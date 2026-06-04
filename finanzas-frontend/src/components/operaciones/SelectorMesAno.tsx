import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

type Props = {
  month: number;
  year: number;
  setMonth: (m: number) => void;
  setYear: (y: number) => void;
  modoAnual?: boolean;
  tipo: 'GASTO' | 'INGRESO';
};

export default function SelectorMesAno({ month, year, setMonth, setYear, modoAnual = false, tipo }: Props) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const years = Array.from({ length: currentYear - 2025 + 1 }, (_, i) => 2025 + i);

  const prev = () => {
    if (modoAnual) {
      if (year > 2025) setYear(year - 1);
    } else {
      if (month === 1) { if (year > 2025) { setMonth(12); setYear(year - 1); } } 
      else { setMonth(month - 1); }
    }
  };

  const next = () => {
    if (modoAnual) {
      if (year < currentYear) setYear(year + 1);
    } else {
      if (month === 12) { if (year < currentYear) { setMonth(1); setYear(year + 1); } } 
      else { setMonth(month + 1); }
    }
  };

  const irAHoy = () => { setMonth(currentMonth); setYear(currentYear); };

  const colorHoverBtn = tipo === 'INGRESO' ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-500' : 'hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500';

  return (
    <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm h-11 w-fit animate-in fade-in zoom-in duration-500">
      <button onClick={prev} disabled={year === 2025 && (modoAnual || month === 1)} className="h-full px-3 text-neutral-500 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-l-xl transition-all">
        <ChevronLeft size={20} />
      </button>

      <div className="flex items-center h-full px-2">        
        {!modoAnual && (
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="bg-transparent text-sm font-bold text-neutral-800 dark:text-neutral-200 outline-none cursor-pointer appearance-none px-1 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md">
            {MESES.map((m, i) => (<option key={m} value={i + 1} className="dark:bg-neutral-800">{m}</option>))}
          </select>
        )}
        
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={`bg-transparent text-sm font-bold text-neutral-800 dark:text-neutral-200 outline-none cursor-pointer appearance-none px-1 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md ${modoAnual ? 'ml-1' : ''}`}>
          {years.map(y => (<option key={y} value={y} className="dark:bg-neutral-800">{y}</option>))}
        </select>
      </div>

      <button onClick={next} disabled={year === currentYear && (modoAnual || month === 12)} className="h-full px-3 text-neutral-500 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">
        <ChevronRight size={20} />
      </button>

      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800"></div>

      <button onClick={irAHoy} title="Ir a este mes" className={`h-full px-3 rounded-r-xl transition-all ${colorHoverBtn}`}>
        <CalendarDays size={18} />
      </button>
    </div>
  );
}