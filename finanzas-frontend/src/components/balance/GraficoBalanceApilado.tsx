import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatearMoneda } from '../../utils/formatters';

export default function GraficoBalanceApilado({ resumenMensual, coloresCategorias, dataKeyPrefix }: any) {
  // Extraemos dinámicamente las categorías únicas según si es Gasto o Ingreso
  const categoriasUnicas = new Set<string>();
  resumenMensual.forEach((mes: any) => {
    Object.keys(mes[dataKeyPrefix] || {}).forEach(cat => categoriasUnicas.add(cat));
  });
  
  const categorias = Array.from(categoriasUnicas);

  const dataAplanada = resumenMensual.map((mes: any) => {
    const aplanado: any = { mes: mes.mes };
    categorias.forEach(cat => { aplanado[cat] = mes[dataKeyPrefix]?.[cat] || 0; });
    return aplanado;
  });

  return (
    <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800/80 rounded-2xl shadow-sm p-6 w-full h-[600px]">
      <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-6 uppercase tracking-wider">Desglose Mensual Acumulado</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dataAplanada} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" className="dark:stroke-neutral-800" />
          <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(v) => `${v}€`} />
          <Tooltip formatter={(((v: number, name: string) => [`${formatearMoneda(v)} €`, name]) as any)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          {categorias.map((cat) => (
            <Bar key={cat} dataKey={cat} stackId="a" fill={coloresCategorias[cat] || '#888'} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}