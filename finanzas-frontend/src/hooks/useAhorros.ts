import { useState, useEffect, useMemo, useCallback } from 'react';

export function useAhorros() {
  const [metas, setMetas] = useState<any[]>([]);
  const [resumen, setResumen] = useState({ dinero_liquido: 0, dinero_invertido: 0 });

  const cargarDatos = useCallback(() => {
    fetch('/api/ahorros/metas').then(res => res.json()).then(data => setMetas(data));
    fetch('/api/ahorros/resumen').then(res => res.json()).then(data => setResumen(data));
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // Cálculos globales
  const totalReservadoMetas = useMemo(() => metas.reduce((acc, m) => acc + (Number(m.ahorrado) || 0), 0), [metas]);
  const dineroDisponibleGastar = resumen.dinero_liquido - totalReservadoMetas;

  // Nuevas métricas para la cabecera
  const objetivoTotal = useMemo(() => metas.reduce((acc, m) => acc + (Number(m.objetivo) || 0), 0), [metas]);
  const dineroPorAhorrar = Math.max(0, objetivoTotal - totalReservadoMetas); // Lo que falta
  const progresoGlobal = objetivoTotal > 0 ? (totalReservadoMetas / objetivoTotal) * 100 : 0;

  const eliminarMeta = async (id: string) => {
    try {
      const res = await fetch(`/api/ahorros/metas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        cargarDatos();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return {
    metas, resumen, totalReservadoMetas, dineroDisponibleGastar,
    objetivoTotal, dineroPorAhorrar, progresoGlobal,
    cargarDatos, eliminarMeta
  };
}