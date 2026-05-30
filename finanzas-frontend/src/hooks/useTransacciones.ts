import { useState, useEffect, useMemo, useCallback } from 'react';
import { useConfig } from '../context/ConfigContext';

type TipoTransaccion = 'gastos' | 'ingresos' | 'inversiones';

export function useTransacciones(tipo: TipoTransaccion) {
  const { usarPendientes } = useConfig();
  const fechaActual = new Date();
  const [mesActual, setMesActual] = useState(fechaActual.getMonth() + 1);
  const [añoActual, setAñoActual] = useState(fechaActual.getFullYear());
  const [busquedaGlobal, setBusquedaGlobal] = useState('');

  const [transacciones, setTransacciones] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [cuentas, setCuentas] = useState<any[]>([]);

  // Adaptamos los endpoints dinámicamente
  const endpoints = useMemo(() => {
    if (tipo === 'inversiones') {
      return { cat: '/api/inversiones/categorias', cuen: '/api/inversiones/cuentas', trans: '/api/inversiones' };
    }
    return { cat: `/api/categorias/${tipo}`, cuen: `/api/cuentas/${tipo}`, trans: `/api/${tipo}` };
  }, [tipo]);

  useEffect(() => {
    fetch(endpoints.cat).then(res => res.json()).then(data => setCategorias(data));
    fetch(endpoints.cuen).then(res => res.json()).then(data => setCuentas(data));
  }, [endpoints]);

  const cargarTransacciones = useCallback(async () => {
    try {
      const res = await fetch(`${endpoints.trans}?mes=${mesActual}&anio=${añoActual}&buscar=${busquedaGlobal}&limit=100000&offset=0`);
      const data = await res.json();
      setTransacciones(data);
    } catch {
      setTransacciones([]);
    }
  }, [mesActual, añoActual, busquedaGlobal, endpoints]);

  useEffect(() => { cargarTransacciones(); }, [cargarTransacciones]);

  // Evento global para refrescar tras modificar desde el FAB
  useEffect(() => {
    const handleUpdate = () => cargarTransacciones();
    window.addEventListener('actualizarTransacciones', handleUpdate);
    return () => window.removeEventListener('actualizarTransacciones', handleUpdate);
  }, [cargarTransacciones]);

  const eliminarTransaccion = async (id: string) => {
    try {
      const res = await fetch(`${endpoints.trans}/${id}`, { method: 'DELETE' });
      if (res.ok) cargarTransacciones();
      else alert('No se pudo eliminar el registro.');
    } catch { alert('Error de conexión.'); }
  };

  const marcarCompletado = async (id: string) => {
    try {
      const res = await fetch(`${endpoints.trans}/${id}/completar`, { method: 'PATCH' });
      if (res.ok) cargarTransacciones();
      else alert('Error al actualizar el estado.');
    } catch { alert('Error de conexión.'); }
  };

  // Cálculos matemáticos extraídos al hook
  const totalRealMes = useMemo(() => {
    return transacciones
      .filter(t => usarPendientes ? !t.pendiente : true)
      .reduce((acc, curr) => acc + Number(curr.cantidad), 0);
  }, [transacciones, usarPendientes]);

  const totalConPendientes = useMemo(() => {
    return transacciones.reduce((acc, curr) => acc + Number(curr.cantidad), 0);
  }, [transacciones]);

  // Procesado del gráfico
  const datosGrafico = useMemo(() => {
    const totales: Record<string, number> = {};
    transacciones.forEach(t => {
      totales[t.categoria] = (totales[t.categoria] || 0) + Number(t.cantidad);
    });
    const defaultColor = tipo === 'gastos' ? '#ef4444' : tipo === 'ingresos' ? '#10b981' : '#f59e0b';
    return Object.entries(totales)
      .map(([name, value]) => {
        const catBBDD = categorias.find(c => c.nombre === name);
        return { name, value, fill: catBBDD?.color || defaultColor };
      })
      .sort((a, b) => b.value - a.value);
  }, [transacciones, categorias, tipo]);

  const categoriasActivas = useMemo(() => categorias.filter(c => c.activo !== false), [categorias]);
  const cuentasActivas = useMemo(() => cuentas.filter(c => c.activo !== false), [cuentas]);

  return {
    mesActual, setMesActual, añoActual, setAñoActual, busquedaGlobal, setBusquedaGlobal,
    transacciones, categoriasActivas, cuentasActivas, datosGrafico,
    totalRealMes, totalConPendientes,
    cargarTransacciones, eliminarTransaccion, marcarCompletado
  };
}