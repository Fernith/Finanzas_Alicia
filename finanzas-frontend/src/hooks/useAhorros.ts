import { useState, useEffect, useMemo, useCallback } from 'react';

export function useAhorros() {
  const [metas, setMetas] = useState<any[]>([]);
  const [resumen, setResumen] = useState({ dinero_liquido: 0, dinero_invertido: 0 });

  const cargarDatos = useCallback(() => {
    fetch('/api/ahorros/metas').then(res => res.json()).then(data => setMetas(data));
    fetch('/api/ahorros/resumen').then(res => res.json()).then(data => setResumen(data));
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const totalReservadoMetas = useMemo(() => metas.reduce((acc, m) => acc + m.ahorrado, 0), [metas]);
  const dineroDisponibleGastar = resumen.dinero_liquido - totalReservadoMetas;

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
    cargarDatos, eliminarMeta
  };
}