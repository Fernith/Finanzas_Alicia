// Interfaz base compartida por todas las operaciones
export interface TransaccionBase {
  id: string;
  fecha: string;
  cantidad: number;
  categoria: string;
  cuenta: string;
  descripcion?: string; // Ahora todas usan descripcion
  pendiente: boolean;   // El nuevo campo
}

export interface Gasto extends TransaccionBase {}

export interface Ingreso extends TransaccionBase {
  campo_extra_ingreso?: string; 
}

export interface Inversion extends TransaccionBase {
  categoria_id: string;
  cuenta_id: string;
  color: string;
}