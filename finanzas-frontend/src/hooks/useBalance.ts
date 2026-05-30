import { useState, useEffect, useMemo, useCallback } from 'react';

export function useBalance() {
  const fechaActualObj = new Date();
  const anioActualReal = fechaActualObj.getFullYear();
  const mesActualReal = fechaActualObj.getMonth();
  
  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActualReal);
  const años = Array.from({ length: anioActualReal - 2025 + 2 }, (_, i) => 2025 + i);

  const [operaciones, setOperaciones] = useState<any[]>([]);
  const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const cargarDatos = useCallback(() => {
    fetch(`/api/balance/anual?anio=${anioSeleccionado}`)
      .then(res => res.json())
      .then(data => setOperaciones(data))
      .catch(() => setOperaciones([]));
  }, [anioSeleccionado]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const { resumenMensual, tablaCategorias, totalGastosAnual, coloresCategorias } = useMemo(() => {
    const resumen = Array.from({ length: 12 }, (_, i) => ({ mes: mesesNombres[i], ingresos: 0, gastos: 0, balance: 0, categoriasGastos: {} as Record<string, number> }));
    const gastosPorCat: Record<string, number[]> = {};
    const colores: Record<string, string> = {};
    let totalGastos = 0;

    operaciones.forEach(op => {
      const mesIdx = parseInt(op.fecha.split('-')[1]) - 1;
      if (op.tipo_operacion_id === 'INGRESO') {
        resumen[mesIdx].ingresos += Number(op.cantidad);
        resumen[mesIdx].balance += Number(op.cantidad);
      } 
      else if (op.tipo_operacion_id === 'GASTO') {
        const cantidadStr = Number(op.cantidad);
        resumen[mesIdx].gastos += cantidadStr;
        resumen[mesIdx].balance -= cantidadStr;
        resumen[mesIdx].categoriasGastos[op.categoria] = (resumen[mesIdx].categoriasGastos[op.categoria] || 0) + cantidadStr;
        if (!gastosPorCat[op.categoria]) gastosPorCat[op.categoria] = Array(12).fill(0);
        gastosPorCat[op.categoria][mesIdx] += cantidadStr;
        colores[op.categoria] = op.color;
        totalGastos += cantidadStr;
      }
    });

    const tablaCatResult = Object.entries(gastosPorCat).map(([categoria, mesesArray]) => {
      const totalCat = mesesArray.reduce((acc, val) => acc + val, 0);
      const mesesValidosParaMedia = mesesArray.filter((gastoMes, idx) => gastoMes > 0 && !(anioSeleccionado === anioActualReal && idx >= mesActualReal));
      const sumaValidaParaMedia = mesesValidosParaMedia.reduce((acc, val) => acc + val, 0);
      const media = mesesValidosParaMedia.length > 0 ? sumaValidaParaMedia / mesesValidosParaMedia.length : 0;
      const porcentaje = totalGastos > 0 ? (totalCat / totalGastos) * 100 : 0;
      return { categoria, meses: mesesArray, total: totalCat, media, porcentaje, color: colores[categoria] };
    }).sort((a, b) => b.total - a.total);

    return { resumenMensual: resumen, tablaCategorias: tablaCatResult, totalGastosAnual: totalGastos, coloresCategorias: colores };
  }, [operaciones, anioSeleccionado, anioActualReal, mesActualReal]);

  const { totalIngresos, totalBalance } = useMemo(() => {
    return resumenMensual.reduce((acc, curr) => ({ totalIngresos: acc.totalIngresos + curr.ingresos, totalBalance: acc.totalBalance + curr.balance }), { totalIngresos: 0, totalBalance: 0 });
  }, [resumenMensual]);

  const totalMediaMensual = useMemo(() => tablaCategorias.reduce((acc, cat) => acc + cat.media, 0), [tablaCategorias]);

  return {
    anioSeleccionado, setAnioSeleccionado, años, mesesNombres,
    resumenMensual, tablaCategorias, totalGastosAnual, coloresCategorias,
    totalIngresos, totalBalance, totalMediaMensual
  };
}