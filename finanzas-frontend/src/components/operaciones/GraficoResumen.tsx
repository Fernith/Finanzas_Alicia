import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';

type GraficoProps = {
  titulo: string;
  datosGrafico: { name: string; value: number; fill: string }[];
  colorBorderTheme?: string; 
  mensajeVacio: string;
};

export default function GraficoResumen({ titulo, datosGrafico, colorBorderTheme = "dark:border-neutral-800", mensajeVacio }: GraficoProps) {
  return (
    <div className={`bg-white dark:bg-neutral-900 border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col h-full transition-colors ${colorBorderTheme}`}>
      <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-300 mb-4 uppercase tracking-wider">{titulo}</h3>
      
      {datosGrafico.length > 0 ? (
        <>
          <div className="h-64 w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {/* Eliminamos el map interno de <Cell>. Recharts leerá "fill" de datosGrafico directamente */}
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
                  formatter={(((value: number, name: string) => [`${value.toFixed(2)} €`, name]) as any)} 
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#171717', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 flex-grow overflow-y-auto pr-2 max-h-48">
            {datosGrafico.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full mr-3 shadow-sm border border-black/10" style={{ backgroundColor: item.fill }}></span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[120px]" title={item.name}>{item.name}</span>
                </div>
                <span className="text-slate-900 dark:text-white font-bold">{item.value.toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </>
      ) : (
         <div className="flex flex-1 items-center justify-center text-slate-400 text-sm">{mensajeVacio}</div>
      )}
    </div>
  );
}