import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Activo, TransaccionInversion } from '../types';

export function useInversiones() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [transacciones, setTransacciones] = useState<TransaccionInversion[]>([]);

  const cargarDatos = useCallback(() => {
    fetch('/api/inversiones/activos').then(res => res.json()).then(setActivos);
    fetch('/api/inversiones/transacciones').then(res => res.json()).then(setTransacciones);
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const eliminarTransaccion = async (id: string) => {
    if (await fetch(`/api/inversiones/transacciones/${id}`, { method: 'DELETE' }).then(res => res.ok)) {
      cargarDatos();
    }
  };

  const totalInvertido = useMemo(() => {
    return transacciones.reduce((acc, t) => acc + (Number(t.euros_invertidos) || 0), 0);
  }, [transacciones]);

  const activosConTransacciones = useMemo(() => {
    return activos.map(activo => {
      const transActivo = transacciones.filter(t => t.activo_ticker === activo.ticker);
      const total = transActivo.reduce((acc, t) => acc + (Number(t.euros_invertidos) || 0), 0);
      return { ...activo, transacciones: transActivo, total_invertido: total };
    }).sort((a, b) => b.total_invertido - a.total_invertido); 
  }, [activos, transacciones]);

  const flujoMensual = useMemo(() => {
    const flow: Record<string, number> = {};
    transacciones.forEach(t => {
      const date = new Date(t.fecha_compra);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      flow[monthYear] = (flow[monthYear] || 0) + Number(t.euros_invertidos);
    });
    
    return Object.entries(flow)
      .map(([mes, cantidad]) => ({ mes, cantidad }))
      .sort((a, b) => a.mes.localeCompare(b.mes)); 
  }, [transacciones]);

  return { 
    activos, transacciones, activosConTransacciones, 
    totalInvertido, flujoMensual, cargarDatos, eliminarTransaccion 
  };
}