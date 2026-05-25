use axum::{
    extract::{Path, State},
    Json, response::IntoResponse,
    http::StatusCode,
};
use sqlx::PgPool;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct InversionDTO {
    pub id: String,
    pub fecha: String,
    pub cantidad: f64,
    pub categoria_id: String,
    pub categoria: String,
    pub cuenta_id: String,
    pub cuenta: String,
    pub notas: Option<String>,
    pub color: String,
}

#[derive(Deserialize)]
pub struct UpsertInversionDTO {
    pub fecha: String,
    pub cantidad: f64,
    pub categoria_id: String,
    pub cuenta_id: String,
    pub notas: Option<String>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct MaestroDTO {
    pub id: String,
    pub nombre: String,
    pub color: String,
    pub activo: bool,
}

pub async fn obtener_categorias_inversiones(State(pool): State<PgPool>) -> impl IntoResponse {
    let rows = sqlx::query_as!(
        MaestroDTO,
        r#"SELECT id::text as "id!", nombre as "nombre!", color as "color!", activo as "activo!" FROM categorias WHERE tipo_operacion_id = 'AHORRO' ORDER BY nombre"#
    ).fetch_all(&pool).await;
    match rows { Ok(cats) => Json(cats).into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}

pub async fn obtener_cuentas_inversiones(State(pool): State<PgPool>) -> impl IntoResponse {
    let rows = sqlx::query_as!(
        MaestroDTO,
        r#"SELECT c.id::text as "id!", c.nombre as "nombre!", c.color as "color!", c.activo as "activo!" 
           FROM cuentas c
           JOIN cuentas_tipos_operacion ct ON c.id = ct.cuenta_id
           WHERE ct.tipo_operacion_id = 'AHORRO'
           ORDER BY c.nombre"#
    ).fetch_all(&pool).await;
    match rows { Ok(cuentas) => Json(cuentas).into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}

pub async fn listar_inversiones(State(pool): State<PgPool>) -> impl IntoResponse {
    let rows = sqlx::query_as!(
        InversionDTO,
        r#"
        SELECT 
            o.id::text as "id!", o.fecha::text as "fecha!", o.cantidad::float as "cantidad!", 
            o.categoria_id::text as "categoria_id!", c.nombre as "categoria!", c.color as "color!",
            o.cuenta_id::text as "cuenta_id!", cu.nombre as "cuenta!",
            o.notas
        FROM operaciones o
        JOIN categorias c ON o.categoria_id = c.id
        JOIN cuentas cu ON o.cuenta_id = cu.id
        WHERE o.tipo_operacion_id = 'AHORRO' AND o.estado = true
        ORDER BY o.fecha DESC
        "#
    ).fetch_all(&pool).await;

    match rows { Ok(ops) => Json(ops).into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}

// --- SOLUCIÓN ERROR 500 AQUÍ (Añadido ::date y ::float) ---
pub async fn crear_inversion(State(pool): State<PgPool>, Json(payload): Json<UpsertInversionDTO>) -> impl IntoResponse {
    let result = sqlx::query(
        "INSERT INTO operaciones (tipo_operacion_id, fecha, cantidad, categoria_id, cuenta_id, notas, estado) 
         VALUES ('AHORRO', $1::date, $2::float, $3::uuid, $4::uuid, $5, true)"
    )
    .bind(&payload.fecha).bind(payload.cantidad).bind(&payload.categoria_id).bind(&payload.cuenta_id).bind(&payload.notas)
    .execute(&pool).await;

    match result { 
        Ok(_) => (StatusCode::CREATED, "OK").into_response(), 
        Err(e) => {
            println!("❌ ERROR AL INSERTAR INVERSIÓN: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response()
        } 
    }
}

pub async fn modificar_inversion(State(pool): State<PgPool>, Path(id): Path<String>, Json(payload): Json<UpsertInversionDTO>) -> impl IntoResponse {
    let result = sqlx::query(
        "UPDATE operaciones SET fecha = $1::date, cantidad = $2::float, categoria_id = $3::uuid, cuenta_id = $4::uuid, notas = $5 WHERE id = $6::uuid"
    )
    .bind(&payload.fecha).bind(payload.cantidad).bind(&payload.categoria_id).bind(&payload.cuenta_id).bind(&payload.notas).bind(&id)
    .execute(&pool).await;

    match result { 
        Ok(_) => (StatusCode::OK, "OK").into_response(), 
        Err(e) => {
            println!("❌ ERROR AL MODIFICAR INVERSIÓN: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response()
        } 
    }
}

pub async fn eliminar_inversion(State(pool): State<PgPool>, Path(id): Path<String>) -> impl IntoResponse {
    let result = sqlx::query("UPDATE operaciones SET estado = false WHERE id = $1::uuid").bind(&id).execute(&pool).await;
    match result { Ok(_) => (StatusCode::OK, "OK").into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}