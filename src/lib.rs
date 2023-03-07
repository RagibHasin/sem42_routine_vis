use axum::{
    body::{Bytes, Empty},
    extract::State,
    http::{Request, StatusCode, Uri},
    middleware::Next,
    response::Response,
    Router,
};
use sqlx::{PgPool, Row};
use sync_wrapper::SyncWrapper;
use tap::TapFallible;
use tower::ServiceBuilder;
use tower_cookies::{CookieManagerLayer, Cookies};
use tower_http::services::{Redirect, ServeDir};
use tracing::{debug, error};

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
        let cookie = cookie.value();
        if cookie.is_empty() {
            return Ok(response.await);
        }

        let student_info @ StudentInfo {
            roll,
            elective1,
            elective2,
        } = serde_json::from_str(cookie).map_err(|e| {
            error!(%e, "malformed studentInfo cookie payload");
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

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

#[shuttle_service::main]
async fn main(
    #[shuttle_shared_db::Postgres] db: PgPool,
    #[shuttle_static_folder::StaticFolder(folder = "public")] public_folder: std::path::PathBuf,
) -> shuttle_service::ShuttleAxum {
    if let Err(e) = sqlx::query(
        r#"create table if not exists students (
    roll char(7) primary key,
    elective1 char(7) not null,
    elective2 char(7) not null,
    count bigint default 1
)"#,
    )
    .execute(&db)
    .await
    {
        error!(%e, "failed to ensure student table");
        panic!("failed to ensure student table: {e:?}");
    }

    let router = Router::new()
        .nest_service(
            "/",
            ServeDir::new(public_folder)
                .fallback(Redirect::<Empty<Bytes>>::permanent(Uri::from_static("/"))),
        )
        .layer(
            ServiceBuilder::new()
                .layer(CookieManagerLayer::new())
                .layer(axum::middleware::from_fn_with_state(db, cookie_logger)),
        );

    Ok(SyncWrapper::new(router))
}
