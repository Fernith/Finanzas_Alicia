// Exportamos la función para que cualquier archivo del proyecto pueda usarla
export const formatearMoneda = (valor: number) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
};