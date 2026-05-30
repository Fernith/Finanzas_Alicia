use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct CuentaLiquidezDTO {
    pub cuenta_id: String,
    pub nombre: String,
    pub color: String,
    pub ultimo_saldo_manual: f64,
    pub fecha_actualizacion: Option<String>,
    pub saldo_calculado: f64,
}

#[derive(Serialize)]
pub struct HistorialSaldoDTO { 
    pub id: String, 
    pub fecha: String, 
    pub cantidad: f64 
}

#[derive(Deserialize)]
pub struct NuevoSaldoDTO { 
    pub cuenta_id: String, 
    pub fecha: String, 
    pub cantidad: f64 
}