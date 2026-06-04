import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

type Props = {
  titulo: string;
  defaultOpen?: boolean;
  children: ReactNode;
  extraHeader?: ReactNode;
  colorBorde?: string;
};

export default function Acordeon({ titulo, defaultOpen = false, children, extraHeader, colorBorde = "border-neutral-200 dark:border-neutral-800/80" }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-white dark:bg-[#121212] border ${colorBorde} rounded-2xl shadow-sm overflow-hidden transition-all duration-300`}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full px-6 py-5 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors border-b border-transparent dark:border-transparent data-[open=true]:border-neutral-200 dark:data-[open=true]:border-neutral-800/50"
        data-open={isOpen}
      >
        <div className="flex items-center justify-between w-full pr-4">
          <h3 className="font-bold text-neutral-900 dark:text-white text-xl tracking-tight">{titulo}</h3>
          {extraHeader && <div className="text-right">{extraHeader}</div>}
        </div>
        <div className={`text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={24} />
        </div>
      </button>
      
      {isOpen && (
        <div className="p-6 bg-white dark:bg-[#121212] animate-in slide-in-from-top-2 fade-in duration-300">
          {children}
        </div>
      )}
    </div>
  );
}