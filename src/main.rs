use axum::{
    body::{Bytes, Empty},
    extract::State,
    http::{Request, StatusCode, Uri},
    middleware::{self, Next},
    response::Response,
    routing::get,
    Router,
};
use rust_decimal::Decimal;
use sqlx::{PgPool, Row};
use tap::TapFallible;
use tower::ServiceBuilder;
use tower_cookies::{Cookie, CookieManagerLayer, Cookies};
use tower_http::services::{Redirect, ServeDir};
use tracing::{debug, error};

const STUDENTS_1801: &[&str] = &include!("students_1801.rs");

async fn cookie_logger<B>(
    State(db): State<PgPool>,
    cookies: Cookies,
    request: Request<B>,
    next: Next<B>,
) -> Result<Response, StatusCode> {
    #[derive(Debug, serde::Deserialize)]
    struct StudentInfo<'i> {
        roll: &'i str,
        elective3: &'i str,
        elective4: &'i str,
        elective5: &'i str,
    }

    let response = next.run(request);

    if let Some(cookie) = cookies.get("studentInfo") {
        let cookie_val = cookie.value();
        if cookie_val.is_empty() {
            return Ok(response.await);
        }

        let student_info @ StudentInfo {
            roll,
            elective3,
            elective4,
            elective5,
        } = serde_json::from_str(cookie_val).map_err(|e| {
            error!(%e, "malformed studentInfo cookie payload");
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

        if roll.len() != 7
            || !roll.starts_with("1801")
            || roll[4..]
                .parse::<u8>()
                .map_or(false, |roll| !(1..=180).contains(&roll))
        {
            error!(?student_info, "invalid roll");
            cookies.remove(cookie.into_owned());
            return Err(StatusCode::BAD_REQUEST);
        }

        if !elective3.starts_with("eee42") || !["41", "61"].contains(&&elective3[5..]) {
            error!(?student_info, "invalid elective 3");
            cookies.remove(cookie.into_owned());
            return Err(StatusCode::BAD_REQUEST);
        }

        if elective4 != "eee4283" {
            error!(?student_info, "invalid elective 4");
            cookies.remove(cookie.into_owned());
            return Err(StatusCode::BAD_REQUEST);
        }

        if !elective5.starts_with("eee42") || !["47", "69"].contains(&&elective5[5..]) {
            error!(?student_info, "invalid elective 5");
            cookies.remove(cookie.into_owned());
            return Err(StatusCode::BAD_REQUEST);
        }

        let student_name = STUDENTS_1801[roll[4..].parse::<usize>().unwrap() - 1];
        cookies.add(
            Cookie::build("studentName", student_name)
                .expires(None)
                .finish(),
        );

        let condition =
            format!("roll = '{roll}' and elective3 = '{elective3}' and elective4 = '{elective4}' and elective5 = '{elective5}'");
        let condition = condition.as_str();

        let update_query = sqlx::query(&format!("select count from students where {condition}"))
            .fetch_optional(&db)
            .await
            .tap_ok(|r| if r.is_none() { debug!(?student_info, "student is not accounted for") })
            .tap_err(|e| error!(?student_info, ?e, "failed to fetch count for student"))
            .ok().flatten()
            .and_then(|r| r.try_get::<i64, _>(0).ok())
            .map_or_else(
                || format!("insert into students (roll, elective3, elective4, elective5) values ('{roll}', '{elective3}', '{elective4}', '{elective5}')"),
                |hit| {
                    let hit = hit + 1;
                    debug!(?student_info, hit);
                    format!("update students set count = {hit} where {condition}",)
                }
            );

        sqlx::query(&update_query).execute(&db).await.map_err(|e| {
            error!(?student_info, ?e, "failed to update info for student");
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
    }

    Ok(response.await)
}

#[derive(Debug, serde::Serialize)]
struct Stats {
    total_hit: i64,
    most_frequent_user: String,
    unique_users: i64,
    total_variation: i64,
    eee4241: i64,
    eee4261: i64,
    eee4283: i64,
    eee4247: i64,
    eee4269: i64,
}

async fn stats(State(db): State<PgPool>) -> Result<axum::Json<Stats>, StatusCode> {
    macro_rules! q {
        ($query:expr, $emsg:literal) => {
            sqlx::query($query)
            .fetch_one(&db)
            .await
            .and_then(|r| r.try_get(0))
            .map_err(|e| {
                error!(%e, $emsg);
                StatusCode::INTERNAL_SERVER_ERROR
            })
        };
    }

    let total_hit: Decimal = q!(
        "select sum(count) from students",
        "failed to fetch no.o total hit"
    )?;

    let most_frequent_user = q!(
        r"select roll from students
        where roll != '       ' and roll != '1801000' and roll != '1801061'
        order by count desc",
        "failed to fetch the most frequent user"
    )?;

    let unique_users = q!(
        "select count(distinct roll) from students where roll != '       ' and roll != '1801000'",
        "failed to fetch no.o unique users"
    )?;

    let total_variation = q!(
        "select count(*) from students",
        "failed to fetch no.o total variation"
    )?;

    let eee4241 = q!(
        "select count(*) from students where elective3 = 'eee4241'",
        "failed to fetch no.o eee4241 students"
    )?;

    let eee4261 = q!(
        "select count(*) from students where elective3 = 'eee4261'",
        "failed to fetch no.o eee4261 students"
    )?;

    let eee4283 = q!(
        "select count(*) from students where elective4 = 'eee4283'",
        "failed to fetch no.o eee4283 students"
    )?;

    let eee4247 = q!(
        "select count(*) from students where elective5 = 'eee4247'",
        "failed to fetch no.o eee4247 students"
    )?;

    let eee4269 = q!(
        "select count(*) from students where elective5 = 'eee4269'",
        "failed to fetch no.o eee4269 students"
    )?;

    Ok(axum::Json(Stats {
        total_hit: total_hit.try_into().unwrap(),
        most_frequent_user,
        unique_users,
        total_variation,
        eee4241,
        eee4261,
        eee4283,
        eee4247,
        eee4269,
    }))
}

fn trace(e: &impl std::fmt::Debug) {
    error!(?e)
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // #[shuttle_shared_db::Postgres] db: PgPool,
    // #[shuttle_static_folder::StaticFolder(folder = "public")] public_folder: std::path::PathBuf,

    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();

    let db = sqlx::postgres::PgPoolOptions::new()
        // .max_connections(5)
        .connect("postgres://postgres:pussvwrd@db:5432/postgres")
        .await?;

    if let Err(e) = sqlx::query(
        r#"create table if not exists students (
    id serial primary key,
    roll char(7) not null,
    elective3 char(7) not null,
    elective4 char(7) not null,
    elective5 char(7) not null,
    count bigint default 1
)"#,
    )
    .execute(&db)
    .await
    {
        error!(%e, "failed to ensure `students` table");
        panic!("failed to ensure `students` table: {e:?}");
    }

    let router = Router::new()
        .nest_service(
            "/",
            ServeDir::new("public")
                .fallback(Redirect::<Empty<Bytes>>::permanent(Uri::from_static("/"))),
        )
        .nest_service("/stats", get(stats).with_state(db.clone()))
        .layer(
            ServiceBuilder::new()
                .layer(CookieManagerLayer::new())
                .layer(middleware::from_fn_with_state(db, cookie_logger)),
        );

    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(router.into_make_service())
        .await
        .unwrap();

    Ok(())
}
