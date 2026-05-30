import { CalendarDays } from 'lucide-react';

type Props = {
  mesSeleccionado: number;
  añoSeleccionado: number;
  onMesChange: (mes: number) => void;
  onAñoChange: (año: number) => void;
};

export default function SelectorMesAno({ mesSeleccionado, añoSeleccionado, onMesChange, onAñoChange }: Props) {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  const añoActual = new Date().getFullYear();
  const años = Array.from({ length: añoActual - 2025 + 2 }, (_, i) => 2025 + i);

  // NUEVO: Función para detectar el mes y año real del sistema operativo y aplicarlo
  const irAlPresente = () => {
    const hoy = new Date();
    onMesChange(hoy.getMonth() + 1); // getMonth() va de 0 a 11, sumamos 1
    onAñoChange(hoy.getFullYear());
  };

  return (
    <div className="flex w-full sm:w-auto gap-2 items-center">
      
      {/* Selector de Mes (55% de ancho en móvil) */}
      <select 
        value={mesSeleccionado}
        onChange={(e) => onMesChange(Number(e.target.value))}
        className="w-[55%] sm:w-auto bg-white dark:bg-neutral-800 border border-slate-200 dark:border-transparent text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-900 transition-shadow cursor-pointer"
      >
        {meses.map((mes, i) => (
          <option key={mes} value={i + 1}>{mes}</option>
        ))}
      </select>
      
      {/* Selector de Año (30% de ancho en móvil) */}
      <select 
        value={añoSeleccionado}
        onChange={(e) => onAñoChange(Number(e.target.value))}
        className="w-[30%] sm:w-auto bg-white dark:bg-neutral-800 border border-slate-200 dark:border-transparent text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-900 transition-shadow cursor-pointer"
      >
        {años.map(año => (
          <option key={año} value={año}>{año}</option>
        ))}
      </select>

      {/* NUEVO: Botón de acceso rápido al presente (15% de ancho en móvil) */}
      <button
        type="button"
        onClick={irAlPresente}
        title="Volver a la fecha actual"
        className="w-[15%] sm:w-auto p-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-lg transition-colors flex items-center justify-center shrink-0 border border-slate-200/40 dark:border-transparent active:scale-95"
      >
        <CalendarDays size={18} />
      </button>

    </div>
  );
}