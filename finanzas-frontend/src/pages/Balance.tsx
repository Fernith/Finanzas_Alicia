import { useState, useEffect, useMemo, useCallback } from 'react';
import { Scale, Calendar, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatearMoneda } from '../utils/formatters';

export default function Balance() {
  const fechaActualObj = new Date();
  const anioActualReal = fechaActualObj.getFullYear();
  const mesActualReal = fechaActualObj.getMonth();
  
  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActualReal);
  const años = Array.from({ length: anioActualReal - 2025 + 2 }, (_, i) => 2025 + i);

  const [operaciones, setOperaciones] = useState<any[]>([]);
  const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const cargarDatos = useCallback(() => {
    fetch(`/api/balance/anual?anio=${anioSeleccionado}`)
      .then(res => res.json())
      .then(data => setOperaciones(data))
      .catch(() => setOperaciones([]));
  }, [anioSeleccionado]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const { resumenMensual, tablaCategorias, totalGastosAnual, coloresCategorias } = useMemo(() => {
    const resumen = Array.from({ length: 12 }, (_, i) => ({ mes: mesesNombres[i], ingresos: 0, gastos: 0, balance: 0, categoriasGastos: {} as Record<string, number> }));
    const gastosPorCat: Record<string, number[]> = {};
    const colores: Record<string, string> = {};
    let totalGastos = 0;

    operaciones.forEach(op => {
      const mesIdx = parseInt(op.fecha.split('-')[1]) - 1;
      if (op.tipo_operacion_id === 'INGRESO') {
        resumen[mesIdx].ingresos += Number(op.cantidad);
        resumen[mesIdx].balance += Number(op.cantidad);
      } 
      else if (op.tipo_operacion_id === 'GASTO') {
        const cantidadStr = Number(op.cantidad);
        resumen[mesIdx].gastos += cantidadStr;
        resumen[mesIdx].balance -= cantidadStr;
        resumen[mesIdx].categoriasGastos[op.categoria] = (resumen[mesIdx].categoriasGastos[op.categoria] || 0) + cantidadStr;
        if (!gastosPorCat[op.categoria]) gastosPorCat[op.categoria] = Array(12).fill(0);
        gastosPorCat[op.categoria][mesIdx] += cantidadStr;
        colores[op.categoria] = op.color;
        totalGastos += cantidadStr;
      }
    });

    const tablaCatResult = Object.entries(gastosPorCat).map(([categoria, mesesArray]) => {
      const totalCat = mesesArray.reduce((acc, val) => acc + val, 0);
      const mesesValidosParaMedia = mesesArray.filter((gastoMes, idx) => gastoMes > 0 && !(anioSeleccionado === anioActualReal && idx >= mesActualReal));
      const sumaValidaParaMedia = mesesValidosParaMedia.reduce((acc, val) => acc + val, 0);
      const media = mesesValidosParaMedia.length > 0 ? sumaValidaParaMedia / mesesValidosParaMedia.length : 0;
      const porcentaje = totalGastos > 0 ? (totalCat / totalGastos) * 100 : 0;
      return { categoria, meses: mesesArray, total: totalCat, media, porcentaje, color: colores[categoria] };
    }).sort((a, b) => b.total - a.total);

    return { resumenMensual: resumen, tablaCategorias: tablaCatResult, totalGastosAnual: totalGastos, coloresCategorias: colores };
  }, [operaciones, anioSeleccionado, anioActualReal, mesActualReal]);

  const { totalIngresos, totalBalance } = useMemo(() => {
    return resumenMensual.reduce((acc, curr) => ({ totalIngresos: acc.totalIngresos + curr.ingresos, totalBalance: acc.totalBalance + curr.balance }), { totalIngresos: 0, totalBalance: 0 });
  }, [resumenMensual]);

  const totalMediaMensual = useMemo(() => tablaCategorias.reduce((acc, cat) => acc + cat.media, 0), [tablaCategorias]);
  const customTooltipFormatter = (value: any) => [`${formatearMoneda(Number(value))} €`];

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
            <p className="text-2xl font-black text-red-600 dark:text-red-500 mt-1 whitespace-nowrap">{formatearMoneda(totalGastosAnual)} €</p>
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

      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-blue-500/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-blue-500/30 bg-slate-50/50 dark:bg-neutral-900/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Balance Mes a Mes</h2>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-neutral-900/20 border-b border-slate-200 dark:border-blue-500/30">
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-32 whitespace-nowrap">Métrica</th>
                {mesesNombres.map(mes => <th key={mes} className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right whitespace-nowrap">{mes}</th>)}
                <th className="p-4 text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider text-right bg-slate-100 dark:bg-neutral-800/50 whitespace-nowrap">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-500/20">
              <tr className="hover:bg-slate-50 dark:hover:bg-neutral-800/20 transition-colors">
                <td className="p-4 text-sm font-semibold text-emerald-600 dark:text-emerald-500 whitespace-nowrap">Ingresos</td>
                {resumenMensual.map(m => <td key={m.mes} className="p-4 text-sm text-right text-slate-700 dark:text-slate-300 whitespace-nowrap">{formatearMoneda(m.ingresos)} €</td>)}
                <td className="p-4 text-sm text-right font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10 whitespace-nowrap">{formatearMoneda(totalIngresos)} €</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-neutral-800/20 transition-colors">
                <td className="p-4 text-sm font-semibold text-red-600 dark:text-red-500 whitespace-nowrap">Gastos</td>
                {resumenMensual.map(m => <td key={m.mes} className="p-4 text-sm text-right text-slate-700 dark:text-slate-300 whitespace-nowrap">{formatearMoneda(m.gastos)} €</td>)}
                <td className="p-4 text-sm text-right font-bold text-red-600 dark:text-red-500 bg-red-50/30 dark:bg-red-900/10 whitespace-nowrap">{formatearMoneda(totalGastosAnual)} €</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 dark:border-blue-500/30 bg-slate-50 dark:bg-neutral-900/40">
                <td className="p-4 text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider whitespace-nowrap">Balance</td>
                {resumenMensual.map(m => (
                  <td key={m.mes} className={`p-4 text-sm text-right font-bold whitespace-nowrap ${m.balance > 0 ? 'text-blue-600 dark:text-blue-400' : m.balance < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                    {m.balance > 0 ? '+' : ''}{formatearMoneda(m.balance)} €
                  </td>
                ))}
                <td className={`p-4 text-base text-right font-black whitespace-nowrap bg-blue-50/50 dark:bg-blue-900/20 ${totalBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
                  {totalBalance > 0 ? '+' : ''}{formatearMoneda(totalBalance)} €
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-blue-500/30 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Evolución de Ingresos vs Gastos</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={resumenMensual} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `${val}€`} width={60} />
              <Tooltip formatter={customTooltipFormatter} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#171717', borderColor: '#404040', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line name="Ingresos" type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              <Line name="Gastos" type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

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
                    {fila.meses.map((monto, i) => (
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
                  <td className="p-4 text-base text-right font-black text-red-600 dark:text-red-500 whitespace-nowrap">{formatearMoneda(totalGastosAnual)} €</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-blue-500/30 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Composición de Gastos por Mes</h2>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={resumenMensual.map(m => ({ name: m.mes, ...m.categoriasGastos }))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `${val}€`} width={60} />
              <Tooltip formatter={customTooltipFormatter} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#171717', borderColor: '#404040', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              {Object.entries(coloresCategorias).map(([catName, color]) => (
                <Bar key={catName} dataKey={catName} name={catName} stackId="a" fill={color} radius={[0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}