use axum::{
    extract::{Path, State, Query}, // <-- AÑADIDO: Query
    Json, response::IntoResponse,
    http::{StatusCode, HeaderMap}, // <-- AÑADIDO: HeaderMap
};
use sqlx::PgPool;
use serde::{Deserialize, Serialize};
use crate::error::AppError;

#[derive(Deserialize)]
pub struct FiltroPaginacion {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Serialize)]
pub struct InversionDTO {
    pub id: String,
    pub fecha: String,
    pub cantidad: f64,
    pub categoria_id: String,
    pub categoria: String,
    pub cuenta_id: String,
    pub cuenta: String,
    pub descripcion: Option<String>, // <-- Cambio de "notas" a "descripcion"
    pub color: String,
    pub pendiente: bool, // <-- NUEVO CAMPO
}

#[derive(Deserialize)]
pub struct UpsertInversionDTO {
    pub fecha: String,
    pub cantidad: f64,
    pub categoria_id: String,
    pub cuenta_id: String,
    pub descripcion: Option<String>,
    pub pendiente: bool,
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

pub async fn listar_inversiones(
    State(pool): State<PgPool>, Query(filtro): Query<FiltroPaginacion>,
) -> Result<impl IntoResponse, AppError> {
    let limit = filtro.limit.unwrap_or(15);
    let offset = filtro.offset.unwrap_or(0);

    let rows = sqlx::query!(
        r#"
        SELECT 
            o.id::text as "id!", o.fecha::text as "fecha!", o.cantidad::float as "cantidad!", 
            o.categoria_id::text as "categoria_id!", c.nombre as "categoria!", c.color as "color!",
            o.cuenta_id::text as "cuenta_id!", cu.nombre as "cuenta!", o.descripcion,
            COALESCE(o.pendiente, false)::bool as "pendiente!", COUNT(*) OVER() as "total_filas!"
        FROM operaciones o
        JOIN categorias c ON o.categoria_id = c.id JOIN cuentas cu ON o.cuenta_id = cu.id
        WHERE o.tipo_operacion_id = 'AHORRO' 
        ORDER BY o.fecha DESC LIMIT $1 OFFSET $2
        "#,
        limit, offset
    ).fetch_all(&pool).await?;

    let total_count = rows.first().map(|r| r.total_filas).unwrap_or(0);

    let inversiones: Vec<InversionDTO> = rows.into_iter().map(|r| InversionDTO {
        id: r.id, fecha: r.fecha, cantidad: r.cantidad, categoria_id: r.categoria_id, 
        categoria: r.categoria, cuenta_id: r.cuenta_id, cuenta: r.cuenta,
        descripcion: r.descripcion, color: r.color, pendiente: r.pendiente
    }).collect();

    let mut headers = HeaderMap::new();
    headers.insert(
        "x-total-count", 
        axum::http::HeaderValue::from_str(&total_count.to_string()).unwrap()
    );

    Ok((headers, Json(inversiones)))
}

pub async fn crear_inversion(State(pool): State<PgPool>, Json(payload): Json<UpsertInversionDTO>) -> impl IntoResponse {
    let result = sqlx::query(
        "INSERT INTO operaciones (tipo_operacion_id, fecha, cantidad, categoria_id, cuenta_id, descripcion, pendiente) 
         VALUES ('AHORRO', $1::date, $2::float, $3::uuid, $4::uuid, $5, $6::boolean)"
    )
    .bind(&payload.fecha).bind(payload.cantidad).bind(&payload.categoria_id).bind(&payload.cuenta_id).bind(&payload.descripcion).bind(payload.pendiente)
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
        "UPDATE operaciones SET fecha = $1::date, cantidad = $2::float, categoria_id = $3::uuid, cuenta_id = $4::uuid, descripcion = $5, pendiente = $6::boolean WHERE id = $7::uuid"
    )
    .bind(&payload.fecha).bind(payload.cantidad).bind(&payload.categoria_id).bind(&payload.cuenta_id).bind(&payload.descripcion).bind(payload.pendiente).bind(&id)
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
    // AHORA HACE UN BORRADO FÍSICO REAL
    let result = sqlx::query("DELETE FROM operaciones WHERE id = $1::uuid AND tipo_operacion_id = 'AHORRO'")
        .bind(&id).execute(&pool).await;
    match result { Ok(_) => (StatusCode::OK, "OK").into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}

// Fíjate que ahora actualizamos 'operaciones' y no 'gastos'
pub async fn completar_operacion(State(pool): State<PgPool>, Path(id): Path<String>) -> impl IntoResponse {
    let result = sqlx::query("UPDATE operaciones SET pendiente = false WHERE id = $1::uuid")
        .bind(&id)
        .execute(&pool)
        .await;
        
    match result { 
        Ok(_) => (StatusCode::OK, "OK").into_response(), 
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() 
    }
}