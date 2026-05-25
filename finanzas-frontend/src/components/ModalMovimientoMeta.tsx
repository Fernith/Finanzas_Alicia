import React, { useState, useEffect } from 'react';
import { X, Calendar, Euro } from 'lucide-react';

export default function ModalMovimientoMeta({ isOpen, onClose, onSuccess, meta, tipo }: any) {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [cantidad, setCantidad] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => { if (isOpen) { setFecha(new Date().toISOString().split('T')[0]); setCantidad(''); } }, [isOpen]);
  if (!isOpen || !meta) return null;

  const isAdd = tipo === 'add';

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEnviando(true);
    const montoFinal = isAdd ? Number(cantidad) : -Math.abs(Number(cantidad));
    
    try {
      const response = await fetch(`http://localhost:3000/api/ahorros/metas/${meta.id}/movimientos`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha, cantidad: montoFinal })
      });
      if (response.ok) { onSuccess(); onClose(); } else { alert('Error al procesar el movimiento'); }
    } catch { alert('Error de red'); } finally { setEnviando(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {isAdd ? 'Añadir a' : 'Sacar de'} {meta.nombre}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><Calendar size={16}/> Fecha</label>
            <input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-slate-200" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><Euro size={16}/> Importe a {isAdd ? 'Añadir' : 'Retirar'}</label>
            <input type="number" step="0.01" min="0.01" required value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-slate-200" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={enviando} className={`w-full text-white py-2.5 rounded-xl font-semibold shadow-md active:scale-95 transition-all ${isAdd ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>{enviando ? 'Procesando...' : 'Confirmar'}</button>
            <button type="button" onClick={onClose} disabled={enviando} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-semibold active:scale-95 transition-all">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}