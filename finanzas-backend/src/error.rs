use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

pub enum AppError {
    Database(sqlx::Error),
}

// Permite que un sqlx::Error se convierta automáticamente en nuestro AppError (usando el operador `?`)
impl From<sqlx::Error> for AppError {
    fn from(inner: sqlx::Error) -> Self {
        AppError::Database(inner)
    }
}

// Le decimos a Axum cómo convertir este error en una respuesta HTTP JSON
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AppError::Database(err) => {
                println!("❌ ERROR DE BBDD: {:?}", err);
                (StatusCode::INTERNAL_SERVER_ERROR, "Error interno en la base de datos")
            }
        };

        let body = Json(json!({ "error": error_message }));
        (status, body).into_response()
    }
}