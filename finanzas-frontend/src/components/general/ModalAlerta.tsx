import { AlertTriangle, X } from 'lucide-react';

type ModalAlertaProps = {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  mensaje: string;
};

export default function ModalAlerta({ isOpen, onClose, titulo, mensaje }: ModalAlertaProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        
        <div className="px-6 py-4 border-b border-amber-100 dark:border-amber-900/30 flex justify-between items-center bg-amber-50 dark:bg-amber-500/10">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
            <AlertTriangle size={20} className="shrink-0" />
            <h2 className="text-lg font-bold">{titulo}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {mensaje}
          </p>

          <button 
            onClick={onClose} 
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-semibold shadow-md active:scale-95 transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}