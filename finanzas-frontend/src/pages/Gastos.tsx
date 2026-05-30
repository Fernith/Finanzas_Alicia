import { useState } from 'react';
import { TrendingDown, Wallet, Clock } from 'lucide-react';
import MonthYearSelector from '../components/operaciones/SelectorMesAno';
import TransactionTable, { type Column } from '../components/operaciones/TransactionTable';
import ModalConfirmacion from '../components/general/ModalConfirmacion';
import ModalTransaccion from '../components/operaciones/ModalTransaccion';
import GraficoResumen from '../components/operaciones/GraficoResumen';
import { formatearMoneda } from '../utils/formatters';
import { useConfig } from '../context/ConfigContext';
import { useTransacciones } from '../hooks/useTransacciones';

export default function Gastos() {
  const { usarPendientes } = useConfig();
  
  // Magia: Todo el estado y la lógica vienen importados de una sola línea
  const {
    mesActual, setMesActual, añoActual, setAñoActual, busquedaGlobal, setBusquedaGlobal,
    transacciones, categoriasActivas, cuentasActivas, datosGrafico,
    totalRealMes, totalConPendientes, cargarTransacciones, eliminarTransaccion, marcarCompletado
  } = useTransacciones('gastos');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [gastoAEditar, setGastoAEditar] = useState<any>(null);
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);

  const columnasGastos: Column[] = [
    { key: 'fecha', label: 'Fecha', sortable: true },
    { key: 'cantidad', label: 'Cantidad', sortable: true },
    { key: 'categoria', label: 'Categoría', filterable: true },
    { key: 'cuenta', label: 'Cuenta', filterable: true },
    { key: 'descripcion', label: 'Descripción' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 dark:border-red-500/30 pb-6">
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
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-red-500/30 rounded-2xl p-6 shadow-sm flex items-center justify-center gap-6">
          <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex-shrink-0">
            <Wallet size={40} />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] text-center sm:text-left">
              {busquedaGlobal ? 'Búsqueda Real' : (usarPendientes ? 'Gasto Real Realizado' : 'Total gastado este mes')}
            </p>
            <p className="text-4xl sm:text-5xl font-black text-red-600 dark:text-red-500 mt-1 tabular-nums text-center sm:text-left">
              {formatearMoneda(totalRealMes)} <span className="text-xl sm:text-2xl font-bold ml-1">€</span>
            </p>
          </div>
        </div>

        {usarPendientes && (
          <div className="bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-6 shadow-sm flex items-center justify-center gap-6 relative overflow-hidden">
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
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-red-500/30 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-red-500/30 bg-slate-50/50 dark:bg-neutral-900/50 flex flex-col gap-5">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Listado de Transacciones</h2>
            <div className="flex w-full overflow-x-auto pb-1 sm:pb-0">
              <MonthYearSelector mesSeleccionado={mesActual} añoSeleccionado={añoActual} onMesChange={setMesActual} onAñoChange={setAñoActual} />
            </div>
          </div>

          <div className="w-full">
            <TransactionTable 
              columns={columnasGastos} 
              data={transacciones} 
              colorTheme="red" 
              categoriasDisponibles={categoriasActivas.map(c => c.nombre)} 
              cuentasDisponibles={cuentasActivas.map(c => c.nombre)}
              onGlobalSearch={setBusquedaGlobal} 
              onEdit={(t) => { setGastoAEditar(t); setModalAbierto(true); }} 
              onDelete={setIdAEliminar}
              onMarcarCompletado={marcarCompletado}
            />
          </div>
        </div>

        <GraficoResumen 
          titulo="Resumen por Categoría" 
          datosGrafico={datosGrafico} 
          colorBorderTheme="dark:border-red-500/30" 
          mensajeVacio="No hay gastos en este mes." 
        />
      </div>

      <ModalTransaccion 
        isOpen={modalAbierto} onClose={() => { setModalAbierto(false); setGastoAEditar(null); }} 
        onSuccess={cargarTransacciones} transaccionAEditar={gastoAEditar} tipoInicial="GASTO"
      />

      <ModalConfirmacion 
        isOpen={!!idAEliminar} onClose={() => setIdAEliminar(null)} onConfirm={() => { if(idAEliminar) eliminarTransaccion(idAEliminar); setIdAEliminar(null); }}
        mensaje="¿Estás seguro de que deseas eliminar este gasto permanentemente?"
      />
    </div> 
  );
}