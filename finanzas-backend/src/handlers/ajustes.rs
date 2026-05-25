use axum::{
    extract::{Path, State},
    Json, response::IntoResponse,
    http::StatusCode,
};
use serde::{Deserialize, Serialize};
use sqlx::{PgPool, Row};

// --- DTOs CATEGORÍAS ---
#[derive(Serialize, sqlx::FromRow)]
pub struct CategoriaItemDTO {
    pub id: String,
    pub nombre: String,
    pub tipo_operacion_id: String,
    pub color: String,
    pub activo: bool,
}

#[derive(Deserialize)]
pub struct UpsertCategoriaDTO {
    pub nombre: String,
    pub tipo_operacion_id: String,
    pub color: String,
}

// --- DTOs CUENTAS (Múltiples tipos) ---
#[derive(Serialize)]
pub struct CuentaItemDTO {
    pub id: String,
    pub nombre: String,
    pub color: String,
    pub activo: bool,
    pub tipos_operacion: Vec<String>, // Array con los tipos
}

#[derive(Deserialize)]
pub struct UpsertCuentaDTO {
    pub nombre: String,
    pub color: String,
    pub tipos_operacion: Vec<String>, // Array de checkboxes que nos manda React
}

// ==========================================
// MANEJADORES DE CATEGORÍAS (Sin cambios)
// ==========================================
pub async fn listar_categorias(State(pool): State<PgPool>) -> impl IntoResponse {
    let rows = sqlx::query_as!(CategoriaItemDTO, r#"SELECT id::text as "id!", nombre, tipo_operacion_id as "tipo_operacion_id!", color as "color!", activo as "activo!" FROM categorias ORDER BY tipo_operacion_id DESC, nombre ASC"#).fetch_all(&pool).await;
    match rows { Ok(items) => Json(items).into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}
pub async fn crear_categoria(State(pool): State<PgPool>, Json(payload): Json<UpsertCategoriaDTO>) -> impl IntoResponse {
    let result = sqlx::query("INSERT INTO categorias (nombre, tipo_operacion_id, color, activo) VALUES ($1, $2, $3, true)")
        .bind(&payload.nombre).bind(&payload.tipo_operacion_id).bind(&payload.color).execute(&pool).await;
    match result { Ok(_) => (StatusCode::CREATED, "OK").into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}
pub async fn modificar_categoria(State(pool): State<PgPool>, Path(id): Path<String>, Json(payload): Json<UpsertCategoriaDTO>) -> impl IntoResponse {
    let result = sqlx::query("UPDATE categorias SET nombre = $1, tipo_operacion_id = $2, color = $3 WHERE id = $4::uuid")
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

// ==========================================
// MANEJADORES DE CUENTAS (Relación N:M)
// ==========================================
pub async fn listar_cuentas(State(pool): State<PgPool>) -> impl IntoResponse {
    let rows = sqlx::query_as!(
        CuentaItemDTO,
        r#"SELECT 
            c.id::text as "id!", 
            c.nombre as "nombre!", 
            c.color as "color!", 
            c.activo as "activo!", 
            COALESCE(array_agg(ct.tipo_operacion_id) FILTER (WHERE ct.tipo_operacion_id IS NOT NULL), ARRAY[]::text[]) as "tipos_operacion!"
           FROM cuentas c
           LEFT JOIN cuentas_tipos_operacion ct ON c.id = ct.cuenta_id
           GROUP BY c.id
           ORDER BY c.nombre ASC"#
    ).fetch_all(&pool).await;
    match rows { Ok(items) => Json(items).into_response(), Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response() }
}

pub async fn crear_cuenta(State(pool): State<PgPool>, Json(payload): Json<UpsertCuentaDTO>) -> impl IntoResponse {
    let mut tx = match pool.begin().await { Ok(t) => t, Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Error tx").into_response() };
    
    // Pedimos a Postgres que nos devuelva el ID ya convertido a texto
    let result = sqlx::query("INSERT INTO cuentas (nombre, color, activo) VALUES ($1, $2, true) RETURNING id::text")
        .bind(&payload.nombre)
        .bind(&payload.color)
        .fetch_one(&mut *tx)
        .await;
        
    if let Ok(row) = result {
        // Como pedimos id::text, ahora podemos guardarlo en un String normal de Rust
        let cuenta_id: String = row.get("id");
        
        for tipo in payload.tipos_operacion {
            let _ = sqlx::query("INSERT INTO cuentas_tipos_operacion (cuenta_id, tipo_operacion_id) VALUES ($1::uuid, $2)")
                .bind(&cuenta_id)
                .bind(tipo)
                .execute(&mut *tx)
                .await;
        }
        let _ = tx.commit().await;
        (StatusCode::CREATED, "OK").into_response()
    } else {
        (StatusCode::INTERNAL_SERVER_ERROR, "Error al insertar").into_response()
    }
}

pub async fn modificar_cuenta(State(pool): State<PgPool>, Path(id): Path<String>, Json(payload): Json<UpsertCuentaDTO>) -> impl IntoResponse {
    let mut tx = match pool.begin().await { Ok(t) => t, Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Error tx").into_response() };
    
    // 1. Actualizamos datos base
    let _ = sqlx::query("UPDATE cuentas SET nombre = $1, color = $2 WHERE id = $3::uuid")
        .bind(&payload.nombre).bind(&payload.color).bind(&id).execute(&mut *tx).await;
        
    // 2. Borramos las relaciones viejas
    let _ = sqlx::query("DELETE FROM cuentas_tipos_operacion WHERE cuenta_id = $1::uuid")
        .bind(&id).execute(&mut *tx).await;
        
    // 3. Insertamos las nuevas
    for tipo in payload.tipos_operacion {
        let _ = sqlx::query("INSERT INTO cuentas_tipos_operacion (cuenta_id, tipo_operacion_id) VALUES ($1::uuid, $2)")
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