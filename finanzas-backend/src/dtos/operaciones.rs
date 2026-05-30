use serde::{Deserialize, Serialize};

// --- Filtros Compartidos ---
#[derive(Deserialize)]
pub struct FiltroPaginacion {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Deserialize)]
pub struct FiltroFecha {
    pub mes: i32,
    pub anio: i32,
    pub buscar: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct MaestroDTO {
    pub id: String,
    pub nombre: String,
    pub color: Option<String>,
    pub activo: Option<bool>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct MaestroEstrictoDTO {
    pub id: String,
    pub nombre: String,
    pub color: String,
    pub activo: bool,
}

// --- Gastos ---
#[derive(Serialize)]
pub struct GastoDTO {
    pub id: String,
    pub fecha: String, 
    pub cantidad: f64,
    pub categoria: String,
    pub cuenta: String,
    pub descripcion: Option<String>,
    pub pendiente: bool,
}

#[derive(Deserialize)]
pub struct NuevoGastoDTO {
    pub fecha: String,
    pub cantidad: f64,
    pub categoria_id: String,
    pub cuenta_id: String,
    pub descripcion: Option<String>,
    pub pendiente: bool,
}

// --- Ingresos ---
#[derive(Serialize)]
pub struct IngresoDTO {
    pub id: String,
    pub fecha: String,
    pub cantidad: f64,
    pub categoria: String,
    pub cuenta: String,
    pub descripcion: Option<String>,
    pub campo_extra_ingreso: Option<String>, 
    pub pendiente: bool,
}

#[derive(Deserialize)]
pub struct NuevoIngresoDTO {
    pub fecha: String,
    pub cantidad: f64,
    pub categoria_id: String,
    pub cuenta_id: String,
    pub descripcion: Option<String>,
    pub campo_extra_ingreso: Option<String>, 
    pub pendiente: bool,
}

// --- Inversiones ---
#[derive(Serialize)]
pub struct InversionDTO {
    pub id: String,
    pub fecha: String,
    pub cantidad: f64,
    pub categoria_id: String,
    pub categoria: String,
    pub cuenta_id: String,
    pub cuenta: String,
    pub descripcion: Option<String>,
    pub color: String,
    pub pendiente: bool,
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