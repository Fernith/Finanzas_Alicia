import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, TrendingUp, Wallet } from 'lucide-react';
import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';
import MonthYearSelector from '../components/SelectorMesAno';
import TransactionTable, { type Column } from '../components/TransactionTable';
import ModalAgregarIngreso from '../components/ModalAgregarIngreso';
import { formatearMoneda } from '../utils/formatters';
import ModalConfirmacion from '../components/ModalConfirmacion';

export default function Ingresos() {
  const fechaActual = new Date();
  const [mesActual, setMesActual] = useState(fechaActual.getMonth() + 1);
  const [añoActual, setAñoActual] = useState(fechaActual.getFullYear());
  const [busquedaGlobal, setBusquedaGlobal] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ingresoSeleccionadoEditar, setIngresoSeleccionadoEditar] = useState<any>(null);

  const [ingresos, setIngresos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [cuentas, setCuentas] = useState<any[]>([]);

  // NUEVO: La columna extra para ingresos añadida a la tabla
  const columnasIngresos: Column[] = [
    { key: 'fecha', label: 'Fecha', sortable: true },
    { key: 'cantidad', label: 'Cantidad', sortable: true },
    { key: 'categoria', label: 'Categoría', filterable: true },
    { key: 'cuenta', label: 'Cuenta', filterable: true },
    { key: 'campo_extra_ingreso', label: 'Info Extra' },
    { key: 'descripcion', label: 'Descripción' }
  ];

  const totalIngresadoMes = useMemo(() => {
    return ingresos.reduce((acc, curr) => acc + Number(curr.cantidad), 0);
  }, [ingresos]);

  useEffect(() => {
    fetch('/api/categorias/ingresos').then(res => res.json()).then(data => setCategorias(data));
    fetch('/api/cuentas/ingresos').then(res => res.json()).then(data => setCuentas(data));
  }, []);

  const cargarIngresosDelServidor = useCallback(() => {
    fetch(`/api/ingresos?mes=${mesActual}&anio=${añoActual}&buscar=${busquedaGlobal}`)
      .then(res => res.json())
      .then(data => setIngresos(data))
      .catch(() => setIngresos([]));
  }, [mesActual, añoActual, busquedaGlobal]);

  useEffect(() => {
    cargarIngresosDelServidor();
  }, [cargarIngresosDelServidor]);

  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);

  const handleEliminarIngreso = (id: string) => {
    setIdAEliminar(id);
  };

  const confirmarEliminacion = async () => {
    if (!idAEliminar) return;
    try {
      const res = await fetch(`/api/ingresos/${idAEliminar}`, { method: 'DELETE' });
      if (res.ok) cargarIngresosDelServidor();
      else alert('No se pudo eliminar el ingreso.');
    } catch {
      alert('Error de conexión.');
    }
  };

  const handleAbrirEdicion = (ingreso: any) => {
    setIngresoSeleccionadoEditar(ingreso);
    setModalAbierto(true);
  };

  const datosGrafico = useMemo(() => {
    const totales: Record<string, number> = {};
    ingresos.forEach(ing => {
      totales[ing.categoria] = (totales[ing.categoria] || 0) + Number(ing.cantidad);
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
      
      {/* CABECERA (Tonos esmeralda) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-900/40 dark:to-teal-900/20 rounded-2xl shadow-sm border border-emerald-200/50 dark:border-emerald-800/50">
            <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Mis Ingresos</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Registra y monitorea tus fuentes de dinero</p>
          </div>
        </div>
      </div>

      {/* TARJETA DE TOTAL ACUMULADO DINÁMICA (Verde) */}
      <div className="w-full md:w-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-center gap-6 transition-all duration-300">
        <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
          <Wallet size={40} />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] text-center sm:text-left">
            {busquedaGlobal ? 'Total Búsqueda' : 'Total ingresado este mes'}
          </p>
          <p className="text-4xl sm:text-6xl font-black text-emerald-600 dark:text-emerald-500 mt-1 tabular-nums text-center sm:text-left">
            {formatearMoneda(totalIngresadoMes)} <span className="text-xl sm:text-2xl font-bold ml-1">€</span>
            </p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Listado de Ingresos</h2>
              <button 
                onClick={() => { setIngresoSeleccionadoEditar(null); setModalAbierto(true); }}
                className="flex items-center justify-center w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-emerald-800 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-emerald-500/30 active:scale-95 transition-all border border-emerald-400/20"
              >
                <Plus size={20} className="mr-2" /> Agregar Ingreso
              </button>
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
              onDelete={handleEliminarIngreso}  
            />
          </div>
        </div>

        {/* GRÁFICO */}
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
             <div className="flex items-center justify-center h-64 text-slate-400">No hay ingresos en este mes.</div>
          )}
        </div>
      </div>

      <ModalAgregarIngreso 
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSuccess={cargarIngresosDelServidor}
        categorias={categoriasActivas}
        cuentas={cuentasActivas}
        ingresoAEditar={ingresoSeleccionadoEditar}
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