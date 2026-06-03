use axum::{extract::{Path, State}, Json, response::IntoResponse, http::StatusCode};
use sqlx::PgPool;
use crate::dtos::suscripciones::{SuscripcionDTO, UpsertSuscripcionDTO};

pub async fn listar_suscripciones(State(pool): State<PgPool>) -> impl IntoResponse {
    let rows = sqlx::query!(
        r#"
        SELECT s.id::text as "id!", s.nombre, s.cantidad::float as "cantidad!", 
               s.cuenta_id::text as "cuenta_id!", c.nombre as "cuenta_nombre!", 
               s.fecha_inicio::text as "fecha_inicio!", s.fecha_proxima_renovacion::text as "fecha_proxima_renovacion!", 
               s.periodicidad::text as "periodicidad!", s.activo 
        FROM suscripciones s
        JOIN cuentas c ON s.cuenta_id = c.id
        ORDER BY s.activo DESC, s.fecha_proxima_renovacion ASC
        "#
    ).fetch_all(&pool).await;

    match rows {
        Ok(filas) => {
            let datos: Vec<SuscripcionDTO> = filas.into_iter().map(|r| SuscripcionDTO {
                id: r.id, nombre: r.nombre, cantidad: r.cantidad, cuenta_id: r.cuenta_id, cuenta_nombre: r.cuenta_nombre,
                fecha_inicio: r.fecha_inicio, fecha_proxima_renovacion: r.fecha_proxima_renovacion, periodicidad: r.periodicidad, activo: r.activo
            }).collect();
            Json(datos).into_response()
        },
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response()
    }
}

pub async fn crear_suscripcion(State(pool): State<PgPool>, Json(payload): Json<UpsertSuscripcionDTO>) -> impl IntoResponse {
    let result = sqlx::query(
        "INSERT INTO suscripciones (nombre, cantidad, cuenta_id, fecha_inicio, fecha_proxima_renovacion, periodicidad, activo) 
         VALUES ($1, $2::float8::numeric, $3::uuid, $4::date, $5::date, $6::tipo_periodicidad, $7)"
    )
    .bind(&payload.nombre).bind(payload.cantidad).bind(&payload.cuenta_id).bind(&payload.fecha_inicio)
    .bind(&payload.fecha_proxima_renovacion).bind(&payload.periodicidad).bind(payload.activo)
    .execute(&pool).await;

    match result { Ok(_) => StatusCode::CREATED.into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}

pub async fn modificar_suscripcion(State(pool): State<PgPool>, Path(id): Path<String>, Json(payload): Json<UpsertSuscripcionDTO>) -> impl IntoResponse {
    let result = sqlx::query(
        "UPDATE suscripciones SET nombre=$1, cantidad=$2::float8::numeric, cuenta_id=$3::uuid, fecha_inicio=$4::date, fecha_proxima_renovacion=$5::date, periodicidad=$6::tipo_periodicidad, activo=$7 WHERE id=$8::uuid"
    )
    .bind(&payload.nombre).bind(payload.cantidad).bind(&payload.cuenta_id).bind(&payload.fecha_inicio)
    .bind(&payload.fecha_proxima_renovacion).bind(&payload.periodicidad).bind(payload.activo).bind(&id)
    .execute(&pool).await;

    match result { Ok(_) => StatusCode::OK.into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}

pub async fn eliminar_suscripcion(State(pool): State<PgPool>, Path(id): Path<String>) -> impl IntoResponse {
    match sqlx::query("DELETE FROM suscripciones WHERE id=$1::uuid").bind(&id).execute(&pool).await {
        Ok(_) => StatusCode::OK.into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response()
    }
}