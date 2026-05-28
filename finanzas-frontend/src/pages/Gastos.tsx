import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, TrendingDown, Wallet, Clock } from 'lucide-react';
import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';
import MonthYearSelector from '../components/general/SelectorMesAno';
import TransactionTable, { type Column } from '../components/general/TransactionTable';
import { formatearMoneda } from '../utils/formatters';
import ModalConfirmacion from '../components/general/ModalConfirmacion';
import ModalTransaccion from '../components/general/ModalTransaccion';
import { useConfig } from '../context/ConfigContext';

export default function Gastos() {
  const { usarPendientes } = useConfig();
  
  const fechaActual = new Date();
  const [mesActual, setMesActual] = useState(fechaActual.getMonth() + 1);
  const [añoActual, setAñoActual] = useState(fechaActual.getFullYear());
  const [busquedaGlobal, setBusquedaGlobal] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [gastoSeleccionadoEditar, setGastoSeleccionadoEditar] = useState<any>(null);

  // Dos estados: uno para la tabla (paginado) y otro para sumas/gráficos (global)
  const [gastos, setGastos] = useState<any[]>([]);
  const [gastosGlobales, setGastosGlobales] = useState<any[]>([]);
  
  const [categorias, setCategorias] = useState<any[]>([]);
  const [cuentas, setCuentas] = useState<any[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);

  const columnasGastos: Column[] = [
    { key: 'fecha', label: 'Fecha', sortable: true },
    { key: 'cantidad', label: 'Cantidad', sortable: true },
    { key: 'categoria', label: 'Categoría', filterable: true },
    { key: 'cuenta', label: 'Cuenta', filterable: true },
    { key: 'descripcion', label: 'Descripción' }
  ];

  // Las sumas ahora se hacen sobre gastosGlobales
  const totalRealMes = useMemo(() => {
    return gastosGlobales
      .filter(g => usarPendientes ? !g.pendiente : true)
      .reduce((acc, curr) => acc + Number(curr.cantidad), 0);
  }, [gastosGlobales, usarPendientes]);

  const totalConPendientes = useMemo(() => {
    return gastosGlobales.reduce((acc, curr) => acc + Number(curr.cantidad), 0);
  }, [gastosGlobales]);

  useEffect(() => { setCurrentPage(1); }, [mesActual, añoActual, busquedaGlobal]);

  useEffect(() => {
    fetch('/api/categorias/gastos').then(res => res.json()).then(data => setCategorias(data));
    fetch('/api/cuentas/gastos').then(res => res.json()).then(data => setCuentas(data));
  }, []);

  // Petición paginada para la tabla
  const cargarGastosPaginados = useCallback(async () => {
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const res = await fetch(`/api/gastos?mes=${mesActual}&anio=${añoActual}&buscar=${busquedaGlobal}&limit=${itemsPerPage}&offset=${offset}`);
      
      const count = res.headers.get('X-Total-Count');
      setTotalItems(Number(count) || 0);
      
      const data = await res.json();
      setGastos(data);
    } catch {
      setGastos([]);
    }
  }, [mesActual, añoActual, busquedaGlobal, currentPage, itemsPerPage]);

  // Petición global sin paginar para cálculos (límite altísimo)
  const cargarGastosGlobales = useCallback(async () => {
    try {
      const res = await fetch(`/api/gastos?mes=${mesActual}&anio=${añoActual}&buscar=${busquedaGlobal}&limit=100000&offset=0`);
      const data = await res.json();
      setGastosGlobales(data);
    } catch {
      setGastosGlobales([]);
    }
  }, [mesActual, añoActual, busquedaGlobal]);

  useEffect(() => { cargarGastosPaginados(); }, [cargarGastosPaginados]);
  useEffect(() => { cargarGastosGlobales(); }, [cargarGastosGlobales]);

  // Pon esto debajo de tus otros useEffect()
  useEffect(() => {
    const handleUpdate = () => {
      cargarGastosPaginados();
      cargarGastosGlobales();
    };
    window.addEventListener('actualizarTransacciones', handleUpdate);
    return () => window.removeEventListener('actualizarTransacciones', handleUpdate);
  }, [cargarGastosPaginados, cargarGastosGlobales]);

  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);

  const handleEliminarGasto = (id: string) => {
    setIdAEliminar(id); 
  };

  const confirmarEliminacion = async () => {
    if (!idAEliminar) return;
    try {
      const res = await fetch(`/api/gastos/${idAEliminar}`, { method: 'DELETE' });
      if (res.ok) {
        cargarGastosPaginados();
        cargarGastosGlobales();
      } else alert('No se pudo eliminar el gasto.');
    } catch {
      alert('Error de conexión.');
    } finally {
      setIdAEliminar(null);
    }
  };

  const handleAbrirEdicion = (gasto: any) => {
    setGastoSeleccionadoEditar(gasto);
    setModalAbierto(true);
  };

  const handleMarcarCompletado = async (id: string) => {
    try {
      const res = await fetch(`/api/gastos/${id}/completar`, { method: 'PATCH' });
      if (res.ok) {
        cargarGastosPaginados();
        cargarGastosGlobales();
      } else alert('Error al actualizar el estado.');
    } catch {
      alert('Error de conexión.');
    }
  };

  // El gráfico también se alimenta de gastosGlobales
  const datosGrafico = useMemo(() => {
    const totales: Record<string, number> = {};
    gastosGlobales.forEach(gasto => {
      totales[gasto.categoria] = (totales[gasto.categoria] || 0) + Number(gasto.cantidad);
    });
    return Object.entries(totales)
      .map(([name, value]) => {
        const catBBDD = categorias.find(c => c.nombre === name);
        return { name, value, fill: catBBDD?.color || '#94a3b8' };
      })
      .sort((a, b) => b.value - a.value);
  }, [gastosGlobales, categorias]);

  const categoriasActivas = useMemo(() => categorias.filter(c => c.activo !== false), [categorias]);
  const cuentasActivas = useMemo(() => cuentas.filter(c => c.activo !== false), [cuentas]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-red-100 to-rose-200 dark:from-red-900/40 dark:to-rose-900/20 rounded-2xl shadow-sm border border-red-200/50 dark:border-red-800/50">
            <TrendingDown className="text-red-600 dark:text-red-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Mis Gastos</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Controla y analiza tus salidas de dinero</p>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${usarPendientes ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
        
        <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-center justify-center gap-6 transition-all duration-300">
          <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex-shrink-0">
            <Wallet size={40} />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] text-center sm:text-left">
              {busquedaGlobal ? 'Búsqueda Real' : (usarPendientes ? 'Gasto Real Realizado' : 'Total gastado este mes')}
            </p>
            <p className="text-4xl sm:text-5xl font-black text-red-600 dark:text-red-800 mt-1 tabular-nums text-center sm:text-left">
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
              
              
            </div>

            <div className="flex w-full overflow-x-auto pb-1 sm:pb-0">
              <MonthYearSelector mesSeleccionado={mesActual} añoSeleccionado={añoActual} onMesChange={setMesActual} onAñoChange={setAñoActual} />
            </div>
          </div>

          <div className="w-full">
            <TransactionTable 
              columns={columnasGastos} data={gastos} colorTheme="red" 
              categoriasDisponibles={categoriasActivas.map(c => c.nombre)} cuentasDisponibles={cuentasActivas.map(c => c.nombre)}
              onGlobalSearch={setBusquedaGlobal} onEdit={handleAbrirEdicion} onDelete={handleEliminarGasto}
              onMarcarCompletado={handleMarcarCompletado}
              totalItems={totalItems} currentPage={currentPage} itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage} onItemsPerPageChange={s => { setItemsPerPage(s); setCurrentPage(1); }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 flex flex-col sticky top-24">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Resumen por Categoría</h2>
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
             <div className="flex items-center justify-center h-64 text-slate-400">No hay gastos en este mes.</div>
          )}
        </div>
      </div>

      <ModalTransaccion 
        isOpen={modalAbierto} 
        onClose={() => { setModalAbierto(false); setGastoSeleccionadoEditar(null); }} 
        onSuccess={() => { cargarGastosPaginados(); cargarGastosGlobales(); }}
        transaccionAEditar={gastoSeleccionadoEditar}
        tipoInicial="GASTO" 
      />

    <ModalConfirmacion 
      isOpen={!!idAEliminar} 
      onClose={() => setIdAEliminar(null)} 
      onConfirm={confirmarEliminacion}
      mensaje="¿Estás seguro de que deseas eliminar este gasto permanentemente?"
    />
  </div> 
  );
}