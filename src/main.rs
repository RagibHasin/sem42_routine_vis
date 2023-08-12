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
        elective1: &'i str,
        elective2: &'i str,
    }

    let response = next.run(request);

    if let Some(cookie) = cookies.get("studentInfo") {
        let cookie_val = cookie.value();
        if cookie_val.is_empty() {
            return Ok(response.await);
        }

        let student_info @ StudentInfo {
            roll,
            elective1,
            elective2,
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

        if !elective1.starts_with("eee41") || !["41", "65"].contains(&&elective1[5..]) {
            error!(?student_info, "invalid elective 1");
            cookies.remove(cookie.into_owned());
            return Err(StatusCode::BAD_REQUEST);
        }

        if !elective2.starts_with("eee41") || !["43", "63", "83"].contains(&&elective2[5..]) {
            error!(?student_info, "invalid elective 2");
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
            format!("roll = '{roll}' and elective1 = '{elective1}' and elective2 = '{elective2}'");
        let condition = condition.as_str();

        let update_query = sqlx::query(&format!("select count from students where {condition}"))
            .fetch_optional(&db)
            .await
            .tap_ok(|r| if r.is_none() { debug!(?student_info, "student is not accounted for") })
            .tap_err(|e| error!(?student_info, ?e, "failed to fetch count for student"))
            .ok().flatten()
            .and_then(|r| r.try_get::<i64, _>(0).ok())
            .map_or_else(
                || format!("insert into students (roll, elective1, elective2) values ('{roll}', '{elective1}', '{elective2}')"),
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
    eee4141: i64,
    eee4165: i64,
    eee4143: i64,
    eee4163: i64,
    eee4183: i64,
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

    let eee4141 = q!(
        "select count(*) from students where elective1 = 'eee4141'",
        "failed to fetch no.o eee4141 students"
    )?;

    let eee4165 = q!(
        "select count(*) from students where elective1 = 'eee4165'",
        "failed to fetch no.o eee4165 students"
    )?;

    let eee4143 = q!(
        "select count(*) from students where elective2 = 'eee4143'",
        "failed to fetch no.o eee4143 students"
    )?;

    let eee4163 = q!(
        "select count(*) from students where elective2 = 'eee4163'",
        "failed to fetch no.o eee4163 students"
    )?;

    let eee4183 = q!(
        "select count(*) from students where elective2 = 'eee4183'",
        "failed to fetch no.o eee4183 students"
    )?;

    Ok(axum::Json(Stats {
        total_hit: total_hit.try_into().unwrap(),
        most_frequent_user,
        unique_users,
        total_variation,
        eee4141,
        eee4165,
        eee4143,
        eee4163,
        eee4183,
    }))
}

#[shuttle_runtime::main]
async fn init(
    #[shuttle_shared_db::Postgres] db: PgPool,
    #[shuttle_static_folder::StaticFolder(folder = "public")] public_folder: std::path::PathBuf,
) -> shuttle_axum::ShuttleAxum {
    if let Err(e) = sqlx::query(
        r#"create table if not exists students (
    id serial primary key,
    roll char(7) not null,
    elective1 char(7) not null,
    elective2 char(7) not null,
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
            ServeDir::new(public_folder)
                .fallback(Redirect::<Empty<Bytes>>::permanent(Uri::from_static("/"))),
        )
        .nest_service("/stats", get(stats).with_state(db.clone()))
        .layer(
            ServiceBuilder::new()
                .layer(CookieManagerLayer::new())
                .layer(middleware::from_fn_with_state(db, cookie_logger)),
        );

    Ok(router.into())
}
