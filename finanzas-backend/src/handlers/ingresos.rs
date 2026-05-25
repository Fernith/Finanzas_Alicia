use axum::{
    extract::{Path, Query, State},
    Json, response::IntoResponse,
    http::StatusCode,
};
use sqlx::PgPool;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct IngresoDTO {
    pub id: String,
    pub fecha: String,
    pub cantidad: f64,
    pub categoria: String,
    pub cuenta: String,
    pub descripcion: Option<String>,
    pub campo_extra_ingreso: Option<String>, // <-- EXCLUSIVO DE INGRESOS
}

#[derive(Serialize)]
pub struct MaestroDTO {
    pub id: String,
    pub nombre: String,
    pub color: Option<String>,
    pub activo: Option<bool>,
}

#[derive(Deserialize)]
pub struct FiltroFecha {
    pub mes: i32,
    pub anio: i32,
    pub buscar: Option<String>,
}

#[derive(Deserialize)]
pub struct NuevoIngresoDTO {
    pub fecha: String,
    pub cantidad: f64,
    pub categoria_id: String,
    pub cuenta_id: String,
    pub descripcion: Option<String>,
    pub campo_extra_ingreso: Option<String>, // <-- EXCLUSIVO DE INGRESOS
}

pub async fn obtener_ingresos(
    State(pool): State<PgPool>,
    Query(filtro): Query<FiltroFecha>,
) -> impl IntoResponse {
    let search_term = filtro.buscar.unwrap_or_default();

    let rows = sqlx::query_as!(
        IngresoDTO,
        r#"
        SELECT 
            o.id::text as "id!",
            o.fecha::text as "fecha!",
            o.cantidad::float as "cantidad!",
            c.nombre as "categoria!",
            cu.nombre as "cuenta!",
            o.descripcion,
            o.campo_extra_ingreso
        FROM operaciones o
        JOIN categorias c ON o.categoria_id = c.id
        JOIN cuentas cu ON o.cuenta_id = cu.id
        WHERE o.tipo_operacion_id = 'INGRESO'
          AND o.estado = true
          AND (
              ($3::text != '' AND (
                  o.descripcion ILIKE '%' || $3::text || '%' OR 
                  c.nombre ILIKE '%' || $3::text || '%' OR 
                  cu.nombre ILIKE '%' || $3::text || '%' OR
                  o.campo_extra_ingreso ILIKE '%' || $3::text || '%'
              ))
              OR 
              ($3::text = '' AND EXTRACT(MONTH FROM o.fecha) = $1 AND EXTRACT(YEAR FROM o.fecha) = $2)
          )
        "#,
        filtro.mes as f64,
        filtro.anio as f64,
        search_term
    )
    .fetch_all(&pool)
    .await;

    match rows {
        Ok(ingresos) => Json(ingresos).into_response(),
        Err(err) => (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()).into_response(),
    }
}

pub async fn obtener_categorias_ingresos(State(pool): State<PgPool>) -> impl IntoResponse {
    let rows = sqlx::query_as!(MaestroDTO, r#"SELECT id::text as "id!", nombre, color, activo FROM categorias WHERE tipo_operacion_id = 'INGRESO' ORDER BY nombre"#).fetch_all(&pool).await;
    match rows { Ok(cats) => Json(cats).into_response(), Err(err) => (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()).into_response() }
}

pub async fn obtener_cuentas_ingresos(State(pool): State<PgPool>) -> impl IntoResponse {
    let rows = sqlx::query_as!(
        MaestroDTO,
        r#"SELECT c.id::text as "id!", c.nombre, c.color, c.activo 
           FROM cuentas c
           JOIN cuentas_tipos_operacion ct ON c.id = ct.cuenta_id
           WHERE ct.tipo_operacion_id = 'INGRESO'
           ORDER BY c.nombre"#
    ).fetch_all(&pool).await;
    match rows { Ok(cuentas) => Json(cuentas).into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}

pub async fn crear_ingreso(State(pool): State<PgPool>, Json(payload): Json<NuevoIngresoDTO>) -> impl IntoResponse {
    let result = sqlx::query(
        r#"INSERT INTO operaciones (tipo_operacion_id, fecha, cantidad, categoria_id, cuenta_id, descripcion, campo_extra_ingreso)
           VALUES ('INGRESO', $1::text::date, $2::float8::numeric, $3::text::uuid, $4::text::uuid, $5, $6)"#
    )
    .bind(&payload.fecha).bind(payload.cantidad).bind(&payload.categoria_id).bind(&payload.cuenta_id).bind(&payload.descripcion).bind(&payload.campo_extra_ingreso)
    .execute(&pool).await;

    match result { Ok(_) => (StatusCode::CREATED, "Ingreso creado").into_response(), Err(err) => (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()).into_response() }
}

pub async fn actualizar_ingreso(
    State(pool): State<PgPool>, Path(id): Path<String>, Json(payload): Json<NuevoIngresoDTO>,
) -> impl IntoResponse {
    let result = sqlx::query(
        r#"UPDATE operaciones 
           SET fecha = $1::text::date, cantidad = $2::float8::numeric, categoria_id = $3::text::uuid, cuenta_id = $4::text::uuid, descripcion = $5, campo_extra_ingreso = $6
           WHERE id = $7::text::uuid AND tipo_operacion_id = 'INGRESO'"#
    )
    .bind(&payload.fecha).bind(payload.cantidad).bind(&payload.categoria_id).bind(&payload.cuenta_id).bind(&payload.descripcion).bind(&payload.campo_extra_ingreso).bind(&id)
    .execute(&pool).await;

    match result { Ok(_) => (StatusCode::OK, "Ingreso actualizado").into_response(), Err(err) => (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()).into_response() }
}

pub async fn eliminar_ingreso(State(pool): State<PgPool>, Path(id): Path<String>) -> impl IntoResponse {
    let result = sqlx::query!("DELETE FROM operaciones WHERE id = $1::text::uuid AND tipo_operacion_id = 'INGRESO'", id).execute(&pool).await;
    match result { Ok(_) => (StatusCode::OK, "Ingreso eliminado").into_response(), Err(err) => (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()).into_response() }
}