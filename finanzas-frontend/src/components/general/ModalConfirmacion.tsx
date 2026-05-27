import { AlertTriangle, CheckCircle } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo?: string;
  mensaje?: string;
  textoBoton?: string;
  variante?: 'danger' | 'success'; 
};

export default function ModalConfirmacion({ 
  isOpen, 
  onClose, 
  onConfirm, 
  titulo = 'Confirmar', 
  mensaje = '¿Estás seguro?',
  textoBoton = 'Confirmar',
  variante = 'danger'
}: Props) {
  if (!isOpen) return null;

  // Lógica dinámica para cambiar colores e iconos según la variante
  const esDanger = variante === 'danger';
  const Icono = esDanger ? AlertTriangle : CheckCircle;
  
  const bgIcono = esDanger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30';
  const colorIcono = esDanger ? 'text-red-600 dark:text-red-500' : 'text-emerald-600 dark:text-emerald-500';
  const bgBotonClass = esDanger 
    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' 
    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden scale-100">
        
        <div className="p-6 text-center space-y-4">
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${bgIcono}`}>
            <Icono className={`h-6 w-6 ${colorIcono}`} />
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{titulo}</h3>
          
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {mensaje}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={onClose}
              className="w-full sm:w-1/2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-semibold transition-all active:scale-95 border border-transparent"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`w-full sm:w-1/2 text-white py-2.5 rounded-xl font-semibold transition-all shadow-lg active:scale-95 ${bgBotonClass}`}
            >
              {textoBoton}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}