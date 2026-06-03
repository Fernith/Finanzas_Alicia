type Props = {
  totalReservadoMetas: number;
  dineroPorAhorrar: number;
  progresoGlobal: number;
};

export default function AhorrosHeader({ totalReservadoMetas, dineroPorAhorrar, progresoGlobal }: Props) {
  const formatCurrency = (val: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  
  return (
    <div className="flex flex-col items-center justify-center space-y-8 my-10 animate-in fade-in zoom-in-95 duration-700">
      
      {/* 1. Contenedor transparente con texto gigante dorado */}
      <div className="text-center bg-transparent border-none">
        <p className="text-sm md:text-base font-bold text-slate-500 dark:text-slate-400 tracking-[0.2em] uppercase mb-2">
          Patrimonio Ahorrado
        </p>
        <h1 className="text-5xl md:text-7xl font-black text-amber-500 drop-shadow-sm">
          {formatCurrency(totalReservadoMetas)}
        </h1>
      </div>

      {/* 2. Contenedor de métricas con borde dorado (Se ha quitado max-w-4xl para que ocupe todo el ancho) */}
      <div className="w-full bg-white dark:bg-neutral-900 border-2 border-amber-500/60 rounded-2xl shadow-xl shadow-amber-500/5 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
        
        {/* Izquierda: Total Ahorrado (En Verde) */}
        <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Ahorrado</span>
          <span className="text-2xl font-bold text-emerald-500 dark:text-emerald-400 mt-1">{formatCurrency(totalReservadoMetas)}</span>
        </div>
        
        {/* Centro: Dinero Por Ahorrar (En Rojo) */}
        <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Dinero Por Ahorrar</span>
          <span className="text-2xl font-bold text-red-500 dark:text-red-400 mt-1">{formatCurrency(dineroPorAhorrar)}</span>
        </div>
        
        {/* Derecha: Progreso Global */}
        <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Progreso Global</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-500">{progresoGlobal.toFixed(1)}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}