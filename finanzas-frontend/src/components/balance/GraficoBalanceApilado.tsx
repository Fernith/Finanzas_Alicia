import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatearMoneda } from '../../utils/formatters';

type Props = { resumenMensual: any[]; coloresCategorias: Record<string, string>; };

export default function GraficoBalanceApilado({ resumenMensual, coloresCategorias }: Props) {
  const customTooltipFormatter = (value: any) => [`${formatearMoneda(Number(value))} €`];

  return (
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
  );
}