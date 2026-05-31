use axum::{
    extract::{Path, State},
    Json, response::IntoResponse,
    http::StatusCode,
};
use sqlx::{PgPool, Row};
use crate::dtos::ajustes::*;

pub async fn listar_categorias(State(pool): State<PgPool>) -> impl IntoResponse {
    let rows = sqlx::query_as!(
        CategoriaItemDTO, 
        r#"SELECT 
            id::text as "id!", 
            nombre as "nombre!", 
            tipo_operacion_id::text as "tipo_operacion_id!", 
            color as "color!", 
            activo as "activo!", 
            orden as "orden!" 
           FROM categorias 
           ORDER BY orden ASC, nombre ASC"#
    ).fetch_all(&pool).await;

    match rows { 
        Ok(items) => Json(items).into_response(), 
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() 
    }
}

pub async fn crear_categoria(State(pool): State<PgPool>, Json(payload): Json<UpsertCategoriaDTO>) -> impl IntoResponse {
    let max_orden_row: Result<Option<i32>, _> = sqlx::query_scalar("SELECT MAX(orden) FROM categorias WHERE tipo_operacion_id = $1::tipo_operacion_enum")
        .bind(&payload.tipo_operacion_id).fetch_one(&pool).await;
        
    let max_orden: i32 = match max_orden_row { Ok(Some(val)) => val, _ => 0 };
    let orden_final = payload.orden.unwrap_or(max_orden + 1);

    let result = sqlx::query("INSERT INTO categorias (nombre, tipo_operacion_id, color, activo, orden) VALUES ($1, $2::tipo_operacion_enum, $3, true, $4)")
        .bind(&payload.nombre).bind(&payload.tipo_operacion_id).bind(&payload.color).bind(orden_final).execute(&pool).await;

    match result { Ok(_) => (StatusCode::CREATED, "OK").into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}

pub async fn modificar_categoria(State(pool): State<PgPool>, Path(id): Path<String>, Json(payload): Json<UpsertCategoriaDTO>) -> impl IntoResponse {
    let result = sqlx::query("UPDATE categorias SET nombre = $1, tipo_operacion_id = $2::tipo_operacion_enum, color = $3 WHERE id = $4::uuid")
        .bind(&payload.nombre).bind(&payload.tipo_operacion_id).bind(&payload.color).bind(&id).execute(&pool).await;
    match result { Ok(_) => (StatusCode::OK, "OK").into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}

pub async fn eliminar_categoria_logico(State(pool): State<PgPool>, Path(id): Path<String>) -> impl IntoResponse {
    let result = sqlx::query("UPDATE categorias SET activo = false WHERE id = $1::uuid").bind(&id).execute(&pool).await;
    match result { Ok(_) => (StatusCode::OK, "OK").into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}

pub async fn reactivar_categoria(State(pool): State<PgPool>, Path(id): Path<String>) -> impl IntoResponse {
    let result = sqlx::query("UPDATE categorias SET activo = true WHERE id = $1::uuid").bind(&id).execute(&pool).await;
    match result { Ok(_) => (StatusCode::OK, "OK").into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}

pub async fn listar_cuentas(State(pool): State<PgPool>) -> impl IntoResponse {
    let rows = sqlx::query_as!(
        CuentaItemDTO,
        r#"SELECT 
            c.id::text as "id!", 
            c.nombre as "nombre!", 
            c.color as "color!", 
            c.activo as "activo!", 
            c.orden as "orden!",
            COALESCE(array_agg(ct.tipo_operacion_id::text) FILTER (WHERE ct.tipo_operacion_id IS NOT NULL), ARRAY[]::text[]) as "tipos_operacion!"
           FROM cuentas c
           LEFT JOIN cuentas_tipos_operacion ct ON c.id = ct.cuenta_id
           GROUP BY c.id ORDER BY c.orden ASC, c.nombre ASC"#
    ).fetch_all(&pool).await;

    match rows { Ok(items) => Json(items).into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}

pub async fn crear_cuenta(State(pool): State<PgPool>, Json(payload): Json<UpsertCuentaDTO>) -> impl IntoResponse {
    let mut tx = match pool.begin().await { Ok(t) => t, Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Error tx").into_response() };
    
    let max_orden_row: Result<Option<i32>, _> = sqlx::query_scalar("SELECT MAX(orden) FROM cuentas").fetch_one(&mut *tx).await;
    let max_orden: i32 = match max_orden_row { Ok(Some(val)) => val, _ => 0 };
    let orden_final = payload.orden.unwrap_or(max_orden + 1);
    
    let result = sqlx::query("INSERT INTO cuentas (nombre, color, activo, orden) VALUES ($1, $2, true, $3) RETURNING id::text")
        .bind(&payload.nombre).bind(&payload.color).bind(orden_final).fetch_one(&mut *tx).await;
        
    if let Ok(row) = result {
        let cuenta_id: String = row.get("id");
        for tipo in payload.tipos_operacion {
            let _ = sqlx::query("INSERT INTO cuentas_tipos_operacion (cuenta_id, tipo_operacion_id) VALUES ($1::uuid, $2::tipo_operacion_enum)")
                .bind(&cuenta_id).bind(tipo).execute(&mut *tx).await;
        }
        let _ = tx.commit().await;
        (StatusCode::CREATED, "OK").into_response()
    } else {
        (StatusCode::INTERNAL_SERVER_ERROR, "Error al insertar").into_response()
    }
}

pub async fn modificar_cuenta(State(pool): State<PgPool>, Path(id): Path<String>, Json(payload): Json<UpsertCuentaDTO>) -> impl IntoResponse {
    let mut tx = match pool.begin().await { Ok(t) => t, Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Error tx").into_response() };
    
    let _ = sqlx::query("UPDATE cuentas SET nombre = $1, color = $2 WHERE id = $3::uuid").bind(&payload.nombre).bind(&payload.color).bind(&id).execute(&mut *tx).await;
    let _ = sqlx::query("DELETE FROM cuentas_tipos_operacion WHERE cuenta_id = $1::uuid").bind(&id).execute(&mut *tx).await;
        
    for tipo in payload.tipos_operacion {
        let _ = sqlx::query("INSERT INTO cuentas_tipos_operacion (cuenta_id, tipo_operacion_id) VALUES ($1::uuid, $2::tipo_operacion_enum)")
            .bind(&id).bind(tipo).execute(&mut *tx).await;
    }
    
    let _ = tx.commit().await;
    (StatusCode::OK, "OK").into_response()
}

pub async fn eliminar_cuenta_logico(State(pool): State<PgPool>, Path(id): Path<String>) -> impl IntoResponse {
    let result = sqlx::query("UPDATE cuentas SET activo = false WHERE id = $1::uuid").bind(&id).execute(&pool).await;
    match result { Ok(_) => (StatusCode::OK, "OK").into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}
pub async fn reactivar_cuenta(State(pool): State<PgPool>, Path(id): Path<String>) -> impl IntoResponse {
    let result = sqlx::query("UPDATE cuentas SET activo = true WHERE id = $1::uuid").bind(&id).execute(&pool).await;
    match result { Ok(_) => (StatusCode::OK, "OK").into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}

pub async fn obtener_configuracion(State(pool): State<PgPool>) -> impl IntoResponse {
    let row = sqlx::query!("SELECT usar_pendientes FROM configuracion WHERE id = 1").fetch_one(&pool).await;
    match row { Ok(r) => Json(ConfiguracionDTO { usar_pendientes: r.usar_pendientes }).into_response(), Err(_) => Json(ConfiguracionDTO { usar_pendientes: false }).into_response() }
}

pub async fn actualizar_configuracion(State(pool): State<PgPool>, Json(payload): Json<ConfiguracionDTO>) -> impl IntoResponse {
    let result = sqlx::query!("UPDATE configuracion SET usar_pendientes = $1 WHERE id = 1", payload.usar_pendientes).execute(&pool).await;
    match result { Ok(_) => (StatusCode::OK, "OK").into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}

pub async fn reordenar_categorias(State(pool): State<PgPool>, Json(payload): Json<Vec<ReordenarDTO>>) -> impl IntoResponse {
    let mut tx = match pool.begin().await { Ok(t) => t, Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Error tx").into_response() };
    for item in payload { let _ = sqlx::query("UPDATE categorias SET orden = $1 WHERE id = $2::uuid").bind(item.orden).bind(&item.id).execute(&mut *tx).await; }
    let _ = tx.commit().await; (StatusCode::OK, "OK").into_response()
}

pub async fn reordenar_cuentas(State(pool): State<PgPool>, Json(payload): Json<Vec<ReordenarDTO>>) -> impl IntoResponse {
    let mut tx = match pool.begin().await { Ok(t) => t, Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Error tx").into_response() };
    for item in payload { let _ = sqlx::query("UPDATE cuentas SET orden = $1 WHERE id = $2::uuid").bind(item.orden).bind(&item.id).execute(&mut *tx).await; }
    let _ = tx.commit().await; (StatusCode::OK, "OK").into_response()
}