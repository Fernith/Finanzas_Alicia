import { formatearMoneda } from '../../utils/formatters';

type Props = { tablaCategorias: any[]; mesesNombres: string[]; resumenMensual: any[]; totalMediaMensual: number; totalGastos: number; };

export default function TablaBalanceCategorias({ tablaCategorias, mesesNombres, resumenMensual, totalMediaMensual, totalGastos }: Props) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-blue-500/30 rounded-2xl shadow-sm overflow-hidden w-full">
      <div className="p-5 border-b border-slate-200 dark:border-blue-500/30 bg-slate-50/50 dark:bg-neutral-900/50">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Desglose de Gastos por Categoría</h2>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-neutral-900/20 border-b border-slate-200 dark:border-blue-500/30">
              <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50/90 dark:bg-neutral-900/90 backdrop-blur z-10 whitespace-nowrap">Categoría</th>
              {mesesNombres.map(mes => <th key={mes} className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right whitespace-nowrap">{mes}</th>)}
              <th className="p-4 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-right bg-blue-50/30 dark:bg-blue-900/10 whitespace-nowrap">Media Mensual</th>
              <th className="p-4 text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider text-right bg-purple-50/30 dark:bg-purple-900/10 whitespace-nowrap">% Total</th>
              <th className="p-4 text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider text-right bg-slate-100 dark:bg-neutral-800/50 whitespace-nowrap">Total Anual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-blue-500/20">
            {tablaCategorias.length > 0 ? (
              tablaCategorias.map(fila => (
                <tr key={fila.categoria} className="hover:bg-slate-50 dark:hover:bg-neutral-800/20 transition-colors">
                  <td className="p-4 text-sm font-semibold text-slate-800 dark:text-slate-200 sticky left-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur z-10 flex items-center gap-2 whitespace-nowrap">
                    <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: fila.color }}></span>
                    <span className="truncate">{fila.categoria}</span>
                  </td>
                  {fila.meses.map((monto: number, i: number) => (
                    <td key={i} className={`p-4 text-sm text-right whitespace-nowrap ${monto > 0 ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600 font-light'}`}>
                      {monto > 0 ? `${formatearMoneda(monto)} €` : '-'}
                    </td>
                  ))}
                  <td className="p-4 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10 whitespace-nowrap">{formatearMoneda(fila.media)} €</td>
                  <td className="p-4 text-sm text-right font-semibold text-purple-600 dark:text-purple-400 bg-purple-50/30 dark:bg-purple-900/10 whitespace-nowrap">{fila.porcentaje.toFixed(1)} %</td>
                  <td className="p-4 text-sm text-right font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-neutral-800/30 whitespace-nowrap">{formatearMoneda(fila.total)} €</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={16} className="p-8 text-center text-slate-400">No hay gastos registrados en este año.</td></tr>
            )}
          </tbody>
          {tablaCategorias.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-slate-200 dark:border-blue-500/30 bg-slate-50 dark:bg-neutral-900/40">
                <td className="p-4 text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider sticky left-0 bg-slate-50/90 dark:bg-neutral-900/90 backdrop-blur z-10 whitespace-nowrap">Total Gastos</td>
                {resumenMensual.map(m => <td key={m.mes} className="p-4 text-sm text-right font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{formatearMoneda(m.gastos)} €</td>)}
                <td className="p-4 text-sm text-right font-bold text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10 whitespace-nowrap">{formatearMoneda(totalMediaMensual)} €</td>
                <td className="p-4 bg-purple-50/30 dark:bg-purple-900/10 whitespace-nowrap"></td>
                <td className="p-4 text-base text-right font-black text-red-600 dark:text-red-500 whitespace-nowrap">{formatearMoneda(totalGastos)} €</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}