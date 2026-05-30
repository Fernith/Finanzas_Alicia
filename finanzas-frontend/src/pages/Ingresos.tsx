import { useState, useEffect, useMemo, useCallback } from 'react';
import { TrendingUp, Wallet, Clock } from 'lucide-react';
import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';
import MonthYearSelector from '../components/general/SelectorMesAno';
import TransactionTable, { type Column } from '../components/general/TransactionTable';
import { formatearMoneda } from '../utils/formatters';
import ModalConfirmacion from '../components/general/ModalConfirmacion';
import ModalTransaccion from '../components/general/ModalTransaccion';
import { useConfig } from '../context/ConfigContext';

export default function Ingresos() {
  const { usarPendientes } = useConfig();
  
  const fechaActual = new Date();
  const [mesActual, setMesActual] = useState(fechaActual.getMonth() + 1);
  const [añoActual, setAñoActual] = useState(fechaActual.getFullYear());
  const [busquedaGlobal, setBusquedaGlobal] = useState('');
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ingresoSeleccionadoEditar, setIngresoSeleccionadoEditar] = useState<any>(null);

  const [ingresos, setIngresos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [cuentas, setCuentas] = useState<any[]>([]);

  const columnasIngresos: Column[] = [
    { key: 'fecha', label: 'Fecha', sortable: true },
    { key: 'cantidad', label: 'Cantidad', sortable: true },
    { key: 'categoria', label: 'Categoría', filterable: true },
    { key: 'cuenta', label: 'Cuenta', filterable: true },
    { key: 'campo_extra_ingreso', label: 'Info Extra' },
    { key: 'descripcion', label: 'Descripción' }
  ];

  const totalRealMes = useMemo(() => {
    return ingresos
      .filter(i => usarPendientes ? !i.pendiente : true)
      .reduce((acc, curr) => acc + Number(curr.cantidad), 0);
  }, [ingresos, usarPendientes]);

  const totalConPendientes = useMemo(() => {
    return ingresos.reduce((acc, curr) => acc + Number(curr.cantidad), 0);
  }, [ingresos]);

  useEffect(() => {
    fetch('/api/categorias/ingresos').then(res => res.json()).then(data => setCategorias(data));
    fetch('/api/cuentas/ingresos').then(res => res.json()).then(data => setCuentas(data));
  }, []);

  const cargarIngresos = useCallback(async () => {
    try {
      const res = await fetch(`/api/ingresos?mes=${mesActual}&anio=${añoActual}&buscar=${busquedaGlobal}&limit=100000&offset=0`);
      const data = await res.json();
      setIngresos(data);
    } catch {
      setIngresos([]);
    }
  }, [mesActual, añoActual, busquedaGlobal]);

  useEffect(() => { cargarIngresos(); }, [cargarIngresos]);

  useEffect(() => {
    const handleUpdate = () => cargarIngresos();
    window.addEventListener('actualizarTransacciones', handleUpdate);
    return () => window.removeEventListener('actualizarTransacciones', handleUpdate);
  }, [cargarIngresos]);

  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);

  const confirmarEliminacion = async () => {
    if (!idAEliminar) return;
    try {
      const res = await fetch(`/api/ingresos/${idAEliminar}`, { method: 'DELETE' });
      if (res.ok) cargarIngresos();
      else alert('No se pudo eliminar el ingreso.');
    } catch {
      alert('Error de conexión.');
    } finally {
      setIdAEliminar(null);
    }
  };

  const handleAbrirEdicion = (ingreso: any) => {
    setIngresoSeleccionadoEditar(ingreso);
    setModalAbierto(true);
  };

  const handleMarcarCompletado = async (id: string) => {
    try {
      const res = await fetch(`/api/ingresos/${id}/completar`, { method: 'PATCH' });
      if (res.ok) cargarIngresos();
      else alert('Error al actualizar el estado.');
    } catch {
      alert('Error de conexión.');
    }
  };

  const datosGrafico = useMemo(() => {
    const totales: Record<string, number> = {};
    ingresos.forEach(ingreso => {
      totales[ingreso.categoria] = (totales[ingreso.categoria] || 0) + Number(ingreso.cantidad);
    });
    return Object.entries(totales)
      .map(([name, value]) => {
        const catBBDD = categorias.find(c => c.nombre === name);
        return { name, value, fill: catBBDD?.color || '#94a3b8' };
      })
      .sort((a, b) => b.value - a.value);
  }, [ingresos, categorias]);

  const categoriasActivas = useMemo(() => categorias.filter(c => c.activo !== false), [categorias]);
  const cuentasActivas = useMemo(() => cuentas.filter(c => c.activo !== false), [cuentas]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 dark:border-amber-600/40 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-900/40 dark:to-teal-900/20 rounded-2xl shadow-sm border border-emerald-200/50 dark:border-emerald-800/50">
            <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Mis Ingresos</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Controla y analiza tus entradas de dinero</p>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${usarPendientes ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-amber-600/40 rounded-2xl p-6 shadow-sm flex items-center justify-center gap-6 transition-all duration-300">
          <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            <Wallet size={40} />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] text-center sm:text-left">
              {busquedaGlobal ? 'Búsqueda Real' : (usarPendientes ? 'Ingreso Real Percibido' : 'Total ingresado este mes')}
            </p>
            <p className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-500 mt-1 tabular-nums text-center sm:text-left">
              {formatearMoneda(totalRealMes)} <span className="text-xl sm:text-2xl font-bold ml-1">€</span>
            </p>
          </div>
        </div>

        {usarPendientes && (
          <div className="bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-600/40 rounded-2xl p-6 shadow-sm flex items-center justify-center gap-6 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -z-10"></div>
            <div className="p-4 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex-shrink-0">
              <Clock size={40} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] text-center sm:text-left">
                {busquedaGlobal ? 'Búsqueda Total (Inc. Pendientes)' : 'Total (Inc. Pendientes)'}
              </p>
              <p className="text-4xl sm:text-5xl font-black text-amber-600 dark:text-amber-500 mt-1 tabular-nums text-center sm:text-left">
                {formatearMoneda(totalConPendientes)} <span className="text-xl sm:text-2xl font-bold ml-1">€</span>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-amber-600/40 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          
          <div className="p-5 border-b border-slate-200 dark:border-amber-600/40 shrink-0 bg-slate-50/50 dark:bg-neutral-900/50 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Listado de Transacciones</h2>
            </div>
            <div className="flex w-full overflow-x-auto pb-1 sm:pb-0">
              <MonthYearSelector mesSeleccionado={mesActual} añoSeleccionado={añoActual} onMesChange={setMesActual} onAñoChange={setAñoActual} />
            </div>
          </div>

          <div className="w-full">
            <TransactionTable 
              columns={columnasIngresos} 
              data={ingresos} 
              colorTheme="emerald" 
              categoriasDisponibles={categoriasActivas.map(c => c.nombre)} 
              cuentasDisponibles={cuentasActivas.map(c => c.nombre)}
              onGlobalSearch={setBusquedaGlobal} 
              onEdit={handleAbrirEdicion} 
              onDelete={setIdAEliminar}
              onMarcarCompletado={handleMarcarCompletado}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-amber-600/40 rounded-xl shadow-sm p-5 flex flex-col sticky top-24">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Resumen por Categoría</h2>
          {datosGrafico.length > 0 ? (
            <>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={datosGrafico} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none" label={({ percent }) => percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ''} labelLine={false} />
                    <Tooltip formatter={(value: any) => `${Number(value).toFixed(2)} €`} contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#171717', borderColor: '#404040', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-3 flex-grow">
                {datosGrafico.map((item) => (
                  <div key={item.name} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full mr-3 shadow-sm" style={{ backgroundColor: item.fill }}></span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                    </div>
                    <span className="text-slate-900 dark:text-white font-bold">{item.value.toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
             <div className="flex items-center justify-center h-64 text-slate-400">No hay ingresos en este mes.</div>
          )}
        </div>
      </div>

      <ModalTransaccion 
        isOpen={modalAbierto} 
        onClose={() => { setModalAbierto(false); setIngresoSeleccionadoEditar(null); }} 
        onSuccess={cargarIngresos}
        transaccionAEditar={ingresoSeleccionadoEditar}
        tipoInicial="INGRESO"
      />

      <ModalConfirmacion 
        isOpen={!!idAEliminar} 
        onClose={() => setIdAEliminar(null)} 
        onConfirm={confirmarEliminacion}
        mensaje="¿Estás seguro de que deseas eliminar este ingreso permanentemente?"
      />
    </div> 
  );
}