import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, LineChart, Wallet, Clock } from 'lucide-react';
import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';
import MonthYearSelector from '../components/general/SelectorMesAno';
import TransactionTable, { type Column } from '../components/general/TransactionTable';
import { formatearMoneda } from '../utils/formatters';
import ModalConfirmacion from '../components/general/ModalConfirmacion';
import ModalTransaccion from '../components/general/ModalTransaccion';
import { useConfig } from '../context/ConfigContext';

export default function Inversiones() {
  const { usarPendientes } = useConfig();
  
  const fechaActual = new Date();
  const [mesActual, setMesActual] = useState(fechaActual.getMonth() + 1);
  const [añoActual, setAñoActual] = useState(fechaActual.getFullYear());
  const [busquedaGlobal, setBusquedaGlobal] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [inversionSeleccionadaEditar, setInversionSeleccionadaEditar] = useState<any>(null);

  const [inversiones, setInversiones] = useState<any[]>([]);
  const [inversionesGlobales, setInversionesGlobales] = useState<any[]>([]);

  const [categorias, setCategorias] = useState<any[]>([]);
  const [cuentas, setCuentas] = useState<any[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);

  const columnasInversiones: Column[] = [
    { key: 'fecha', label: 'Fecha', sortable: true },
    { key: 'cantidad', label: 'Cantidad', sortable: true },
    { key: 'categoria', label: 'Activo', filterable: true },
    { key: 'cuenta', label: 'Cuenta', filterable: true },
    { key: 'descripcion', label: 'Descripción' }
  ];

  const totalRealMes = useMemo(() => {
    return inversionesGlobales
      .filter(i => usarPendientes ? !i.pendiente : true)
      .reduce((acc, curr) => acc + Number(curr.cantidad), 0);
  }, [inversionesGlobales, usarPendientes]);

  const totalConPendientes = useMemo(() => {
    return inversionesGlobales.reduce((acc, curr) => acc + Number(curr.cantidad), 0);
  }, [inversionesGlobales]);

  useEffect(() => { setCurrentPage(1); }, [mesActual, añoActual, busquedaGlobal]);

  useEffect(() => {
    fetch('/api/inversiones/categorias').then(res => res.json()).then(data => setCategorias(data));
    fetch('/api/inversiones/cuentas').then(res => res.json()).then(data => setCuentas(data));
  }, []);

  const cargarInversionesPaginadas = useCallback(async () => {
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const res = await fetch(`/api/inversiones?mes=${mesActual}&anio=${añoActual}&buscar=${busquedaGlobal}&limit=${itemsPerPage}&offset=${offset}`);
      
      const count = res.headers.get('X-Total-Count');
      setTotalItems(Number(count) || 0);
      
      const data = await res.json();
      setInversiones(data);
    } catch {
      setInversiones([]);
    }
  }, [mesActual, añoActual, busquedaGlobal, currentPage, itemsPerPage]);

  const cargarInversionesGlobales = useCallback(async () => {
    try {
      const res = await fetch(`/api/inversiones?mes=${mesActual}&anio=${añoActual}&buscar=${busquedaGlobal}&limit=100000&offset=0`);
      const data = await res.json();
      setInversionesGlobales(data);
    } catch {
      setInversionesGlobales([]);
    }
  }, [mesActual, añoActual, busquedaGlobal]);

  useEffect(() => { cargarInversionesPaginadas(); }, [cargarInversionesPaginadas]);
  useEffect(() => { cargarInversionesGlobales(); }, [cargarInversionesGlobales]);

  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);

  const handleEliminarInversion = (id: string) => {
    setIdAEliminar(id); 
  };

  const confirmarEliminacion = async () => {
    if (!idAEliminar) return;
    try {
      const res = await fetch(`/api/inversiones/${idAEliminar}`, { method: 'DELETE' });
      if (res.ok) {
        cargarInversionesPaginadas();
        cargarInversionesGlobales();
      } else alert('No se pudo eliminar la inversión.');
    } catch {
      alert('Error de conexión.');
    } finally {
      setIdAEliminar(null);
    }
  };

  const handleAbrirEdicion = (inversion: any) => {
    setInversionSeleccionadaEditar(inversion);
    setModalAbierto(true);
  };

  const handleMarcarCompletado = async (id: string) => {
    try {
      const res = await fetch(`/api/inversiones/${id}/completar`, { method: 'PATCH' });
      if (res.ok) {
        cargarInversionesPaginadas();
        cargarInversionesGlobales();
      } else alert('Error al actualizar el estado.');
    } catch {
      alert('Error de conexión.');
    }
  };

  const datosGrafico = useMemo(() => {
    const totales: Record<string, number> = {};
    inversionesGlobales.forEach(inversion => {
      totales[inversion.categoria] = (totales[inversion.categoria] || 0) + Number(inversion.cantidad);
    });
    return Object.entries(totales)
      .map(([name, value]) => {
        const catBBDD = categorias.find(c => c.nombre === name);
        return { name, value, fill: catBBDD?.color || '#f59e0b' };
      })
      .sort((a, b) => b.value - a.value);
  }, [inversionesGlobales, categorias]);

  const categoriasActivas = useMemo(() => categorias.filter(c => c.activo !== false), [categorias]);
  const cuentasActivas = useMemo(() => cuentas.filter(c => c.activo !== false), [cuentas]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/40 dark:to-orange-900/20 rounded-2xl shadow-sm border border-amber-200/50 dark:border-amber-800/50">
            <LineChart className="text-amber-600 dark:text-amber-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Mis Inversiones</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gestiona tu portafolio y activos</p>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${usarPendientes ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-center gap-6 transition-all duration-300">
          <div className="p-4 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex-shrink-0">
            <Wallet size={40} />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] text-center sm:text-left">
              {busquedaGlobal ? 'Búsqueda Real' : (usarPendientes ? 'Inversión Real Completada' : 'Total invertido este mes')}
            </p>
            <p className="text-4xl sm:text-5xl font-black text-amber-600 dark:text-amber-500 mt-1 tabular-nums text-center sm:text-left">
              {formatearMoneda(totalRealMes)} <span className="text-xl sm:text-2xl font-bold ml-1">€</span>
            </p>
          </div>
        </div>

        {usarPendientes && (
          <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6 shadow-sm flex items-center justify-center gap-6 transition-all duration-300 relative overflow-hidden">
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
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Listado de Transacciones</h2>
              
              <button 
                onClick={() => { setInversionSeleccionadaEditar(null); setModalAbierto(true); }}
                className="flex items-center justify-center w-full sm:w-auto bg-gradient-to-r bg-amber-500 dark:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-amber-500/30 active:scale-95 transition-all border border-amber-400/20"
              >
                <Plus size={20} className="mr-2" /> Añadir Inversión
              </button>
            </div>

            <div className="flex w-full overflow-x-auto pb-1 sm:pb-0">
              <MonthYearSelector mesSeleccionado={mesActual} añoSeleccionado={añoActual} onMesChange={setMesActual} onAñoChange={setAñoActual} />
            </div>
          </div>

          <div className="w-full">
            <TransactionTable 
              columns={columnasInversiones} data={inversiones} colorTheme="amber" 
              categoriasDisponibles={categoriasActivas.map(c => c.nombre)} cuentasDisponibles={cuentasActivas.map(c => c.nombre)}
              onGlobalSearch={setBusquedaGlobal} onEdit={handleAbrirEdicion} onDelete={handleEliminarInversion}
              onMarcarCompletado={handleMarcarCompletado}
              totalItems={totalItems} currentPage={currentPage} itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage} onItemsPerPageChange={s => { setItemsPerPage(s); setCurrentPage(1); }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 flex flex-col sticky top-24">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Resumen de Activos</h2>
          {datosGrafico.length > 0 ? (
            <>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={datosGrafico} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none" label={({ percent }) => percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ''} labelLine={false} />
                    <Tooltip formatter={(value: any) => `${Number(value).toFixed(2)} €`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
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
             <div className="flex items-center justify-center h-64 text-slate-400">No hay inversiones en este mes.</div>
          )}
        </div>
      </div>

      <ModalTransaccion 
        isOpen={modalAbierto} 
        onClose={() => { setModalAbierto(false); setInversionSeleccionadaEditar(null); }} 
        onSuccess={() => { cargarInversionesPaginadas(); cargarInversionesGlobales(); }}
        transaccionAEditar={inversionSeleccionadaEditar}
        tipoInicial="INVERSION" 
      />

      <ModalConfirmacion 
        isOpen={!!idAEliminar} 
        onClose={() => setIdAEliminar(null)} 
        onConfirm={confirmarEliminacion}
        mensaje="¿Estás seguro de que deseas eliminar esta inversión permanentemente?"
      />
    </div> 
  );
}