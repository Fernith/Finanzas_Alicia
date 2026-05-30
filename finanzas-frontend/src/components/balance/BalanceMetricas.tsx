import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatearMoneda } from '../../utils/formatters';

type Props = { totalIngresos: number; totalGastos: number; totalBalance: number; };

export default function BalanceMetricas({ totalIngresos, totalGastos, totalBalance }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-blue-500/30 p-6 rounded-2xl shadow-sm flex items-center gap-4">
        <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"><TrendingUp size={24} /></div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Ingresos</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-500 mt-1 whitespace-nowrap">{formatearMoneda(totalIngresos)} €</p>
        </div>
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-blue-500/30 p-6 rounded-2xl shadow-sm flex items-center gap-4">
        <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"><TrendingDown size={24} /></div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Gastos</p>
          <p className="text-2xl font-black text-red-600 dark:text-red-500 mt-1 whitespace-nowrap">{formatearMoneda(totalGastos)} €</p>
        </div>
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-blue-500/30 p-6 rounded-2xl shadow-sm flex items-center gap-4 md:scale-105 md:shadow-md transition-transform ring-1 ring-blue-500/20">
        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"><Wallet size={24} /></div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Balance Neto Anual</p>
          <p className={`text-2xl font-black mt-1 whitespace-nowrap ${totalBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-500'}`}>
            {totalBalance > 0 ? '+' : ''}{formatearMoneda(totalBalance)} €
          </p>
        </div>
      </div>
    </div>
  );
}