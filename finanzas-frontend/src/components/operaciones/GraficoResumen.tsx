import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';
import { formatearMoneda } from '../../utils/formatters';

type GraficoProps = {
  titulo: string;
  datosGrafico: { name: string; value: number; fill: string }[];
  colorBorderTheme: string; // Ej: "dark:border-red-500/30"
  mensajeVacio: string;
};

export default function GraficoResumen({ titulo, datosGrafico, colorBorderTheme, mensajeVacio }: GraficoProps) {
  return (
    <div className={`bg-white dark:bg-neutral-900 border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col sticky top-24 ${colorBorderTheme}`}>
      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{titulo}</h2>
      
      {datosGrafico.length > 0 ? (
        <>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={datosGrafico} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value" 
                  stroke="none" 
                  label={({ percent }) => percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ''} 
                  labelLine={false} 
                />
                <Tooltip 
                  formatter={(value: any) => `${Number(value).toFixed(2)} €`} 
                  contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#171717', borderColor: '#404040', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
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
         <div className="flex items-center justify-center h-64 text-slate-400">{mensajeVacio}</div>
      )}
    </div>
  );
}