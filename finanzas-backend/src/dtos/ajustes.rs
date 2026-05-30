use serde::{Deserialize, Serialize};

#[derive(Serialize, sqlx::FromRow)]
pub struct CategoriaItemDTO {
    pub id: String,
    pub nombre: String,
    pub tipo_operacion_id: String,
    pub color: String,
    pub activo: bool,
    pub orden: i32,
}

#[derive(Deserialize)]
pub struct UpsertCategoriaDTO {
    pub nombre: String,
    pub tipo_operacion_id: String,
    pub color: String,
    pub orden: Option<i32>,
}

#[derive(Serialize)]
pub struct CuentaItemDTO {
    pub id: String,
    pub nombre: String,
    pub color: String,
    pub activo: bool,
    pub orden: i32,
    pub tipos_operacion: Vec<String>,
}

#[derive(Deserialize)]
pub struct UpsertCuentaDTO {
    pub nombre: String,
    pub color: String,
    pub orden: Option<i32>,
    pub tipos_operacion: Vec<String>, 
}

#[derive(Serialize, Deserialize)]
pub struct ConfiguracionDTO {
    pub usar_pendientes: bool,
}

#[derive(Deserialize)]
pub struct ReordenarDTO {
    pub id: String,
    pub orden: i32,
}