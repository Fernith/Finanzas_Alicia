import { Scale, Calendar } from 'lucide-react';
import BalanceMetricas from '../components/balance/BalanceMetricas';
import TablaBalanceMensual from '../components/balance/TablaBalanceMensual';
import GraficoBalanceEvolutivo from '../components/balance/GraficoBalanceEvolutivo';
import TablaBalanceCategorias from '../components/balance/TablaBalanceCategorias';
import GraficoBalanceApilado from '../components/balance/GraficoBalanceApilado';
import { useBalance } from '../hooks/useBalance';

export default function Balance() {
  const {
    anioSeleccionado, setAnioSeleccionado, años, mesesNombres,
    resumenMensual, tablaCategorias, totalGastosAnual, coloresCategorias,
    totalIngresos, totalBalance, totalMediaMensual
  } = useBalance();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 w-[95vw] max-w-[1600px] 2xl:max-w-[1800px] relative left-1/2 -translate-x-1/2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 dark:border-blue-500/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-900/20 rounded-2xl shadow-sm border border-blue-200/50 dark:border-blue-800/50">
            <Scale className="text-blue-600 dark:text-blue-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Balance General</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Resumen financiero y evolutivo del año</p>
          </div>
        </div>

        <div className="relative flex items-center bg-white dark:bg-neutral-900 border border-slate-200 dark:border-blue-500/30 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30 transition-all cursor-pointer">
          <Calendar className="text-slate-400 absolute left-4 pointer-events-none" size={20} />
          <select value={anioSeleccionado} onChange={(e) => setAnioSeleccionado(Number(e.target.value))} className="w-full pl-12 pr-4 py-2 bg-transparent text-lg font-bold text-slate-800 dark:text-white outline-none cursor-pointer dark:bg-neutral-900 dark:focus:bg-neutral-900">
            {años.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <BalanceMetricas totalIngresos={totalIngresos} totalGastos={totalGastosAnual} totalBalance={totalBalance} />
      <TablaBalanceMensual mesesNombres={mesesNombres} resumenMensual={resumenMensual} totalIngresos={totalIngresos} totalGastos={totalGastosAnual} totalBalance={totalBalance} />
      <GraficoBalanceEvolutivo resumenMensual={resumenMensual} />
      <TablaBalanceCategorias tablaCategorias={tablaCategorias} mesesNombres={mesesNombres} resumenMensual={resumenMensual} totalMediaMensual={totalMediaMensual} totalGastos={totalGastosAnual} />
      <GraficoBalanceApilado resumenMensual={resumenMensual} coloresCategorias={coloresCategorias} />
    </div>
  );
}