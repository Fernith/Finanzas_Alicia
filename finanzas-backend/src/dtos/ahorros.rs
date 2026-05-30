use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct MovimientoMetaDTO {
    pub id: String,
    pub fecha: String,
    pub cantidad: f64,
}

#[derive(Serialize)]
pub struct MetaAhorroDTO {
    pub id: String,
    pub nombre: String,
    pub objetivo: f64,
    pub color: String,
    pub ahorrado: f64,
    pub movimientos: Vec<MovimientoMetaDTO>,
}

#[derive(Deserialize)]
pub struct UpsertMetaDTO {
    pub nombre: String,
    pub objetivo: f64,
    pub color: String,
}

#[derive(Deserialize)]
pub struct NuevoMovimientoMetaDTO {
    pub fecha: String,
    pub cantidad: f64,
}

#[derive(Serialize)]
pub struct ResumenAhorrosDTO {
    pub dinero_liquido: f64,
    pub dinero_invertido: f64,
}

#[derive(Deserialize)]
pub struct FinalizarMetaDTO {
    pub fecha: String,
    pub cuenta_id: String,
    pub categoria_id: String,
}

#[derive(Serialize)]
pub struct OpcionesFinalizarDTO {
    pub categorias: Vec<MaestroDTO>,
    pub cuentas: Vec<MaestroDTO>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct MaestroDTO {
    pub id: String,
    pub nombre: String,
}