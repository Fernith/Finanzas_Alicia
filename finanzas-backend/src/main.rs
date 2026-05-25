// Le decimos a Rust que busque una carpeta o archivo llamado "handlers"
mod handlers;

use axum::{routing::get, Router};
use sqlx::postgres::PgPoolOptions;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    let db_url = std::env::var("DATABASE_URL").expect("Falta DATABASE_URL en el .env");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("No se pudo conectar a la base de datos");
        
    println!("✅ Conectado a Supabase correctamente.");

    let cors = CorsLayer::permissive();

    let app = Router::new()
        // --- RUTAS DE GASTOS ---
        .route("/api/gastos", get(handlers::gastos::obtener_gastos).post(handlers::gastos::crear_gasto))
        .route("/api/gastos/:id", axum::routing::put(handlers::gastos::actualizar_gasto).delete(handlers::gastos::eliminar_gasto))
        .route("/api/categorias/gastos", get(handlers::gastos::obtener_categorias_gastos))
        .route("/api/cuentas/gastos", get(handlers::gastos::obtener_cuentas_gastos))
        
        // --- RUTAS DE INGRESOS (NUEVO) ---
        .route("/api/ingresos", get(handlers::ingresos::obtener_ingresos).post(handlers::ingresos::crear_ingreso))
        .route("/api/ingresos/:id", axum::routing::put(handlers::ingresos::actualizar_ingreso).delete(handlers::ingresos::eliminar_ingreso))
        .route("/api/categorias/ingresos", get(handlers::ingresos::obtener_categorias_ingresos))
        .route("/api/cuentas/ingresos", get(handlers::ingresos::obtener_cuentas_ingresos))

        // --- RUTAS DE CONFIGURACIÓN / AJUSTES ---
        .route("/api/ajustes/categorias", axum::routing::get(handlers::ajustes::listar_categorias).post(handlers::ajustes::crear_categoria))
        .route("/api/ajustes/categorias/:id", axum::routing::put(handlers::ajustes::modificar_categoria).delete(handlers::ajustes::eliminar_categoria_logico))
        .route("/api/ajustes/categorias/:id/activar", axum::routing::put(handlers::ajustes::reactivar_categoria))
        
        .route("/api/ajustes/cuentas", axum::routing::get(handlers::ajustes::listar_cuentas).post(handlers::ajustes::crear_cuenta))
        .route("/api/ajustes/cuentas/:id", axum::routing::put(handlers::ajustes::modificar_cuenta).delete(handlers::ajustes::eliminar_cuenta_logico))
        .route("/api/ajustes/cuentas/:id/activar", axum::routing::put(handlers::ajustes::reactivar_cuenta))

        // --- RUTAS DE BALANCE ---
        .route("/api/balance/anual", axum::routing::get(handlers::balance::obtener_balance_anual))

        // --- RUTAS DE AHORROS ---
        .route("/api/ahorros/metas", axum::routing::get(handlers::ahorros::listar_metas).post(handlers::ahorros::crear_meta))
        .route("/api/ahorros/metas/:id", axum::routing::put(handlers::ahorros::modificar_meta).delete(handlers::ahorros::eliminar_meta))
        .route("/api/ahorros/resumen", axum::routing::get(handlers::ahorros::obtener_resumen))
        .route("/api/ahorros/metas/:id/movimientos", axum::routing::post(handlers::ahorros::agregar_movimiento_meta))

        // --- RUTAS DE INVERSIONES ---
        .route("/api/inversiones/categorias", axum::routing::get(handlers::inversiones::obtener_categorias_inversiones))
        .route("/api/inversiones/cuentas", axum::routing::get(handlers::inversiones::obtener_cuentas_inversiones))
        .route("/api/inversiones", axum::routing::get(handlers::inversiones::listar_inversiones).post(handlers::inversiones::crear_inversion))
        .route("/api/inversiones/:id", axum::routing::put(handlers::inversiones::modificar_inversion).delete(handlers::inversiones::eliminar_inversion))

        // --- RUTAS DE LIQUIDEZ ---
        .route("/api/liquidez/saldos", axum::routing::get(handlers::liquidez::obtener_saldos_actuales).post(handlers::liquidez::registrar_saldo))
        .route("/api/liquidez/saldos/:cuenta_id", axum::routing::get(handlers::liquidez::obtener_historial_cuenta))
        .route("/api/ahorros/opciones-finalizar", axum::routing::get(handlers::ahorros::opciones_finalizar))
        .route("/api/ahorros/metas/:id/finalizar", axum::routing::post(handlers::ahorros::finalizar_meta))

        .layer(cors)
        .with_state(pool);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("🚀 Servidor Rust corriendo en http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
}