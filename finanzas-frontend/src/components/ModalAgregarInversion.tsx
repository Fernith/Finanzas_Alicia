import React, { useState, useEffect } from 'react';
import { X, Calendar, WalletCards, Tags, AlignLeft, Euro } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  inversionAEditar?: any;
};

export default function ModalAgregarInversion({ isOpen, onClose, onSuccess, inversionAEditar }: Props) {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [cuentas, setCuentas] = useState<any[]>([]);

  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [cantidad, setCantidad] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [cuentaId, setCuentaId] = useState('');
  const [notas, setNotas] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch('/api/inversiones/categorias').then(r => r.json()).then(d => { setCategorias(d); if(d.length > 0 && !inversionAEditar) setCategoriaId(d[0].id); });
    fetch('/api/inversiones/cuentas').then(r => r.json()).then(d => { setCuentas(d); if(d.length > 0 && !inversionAEditar) setCuentaId(d[0].id); });
  }, [inversionAEditar]);

  useEffect(() => {
    if (isOpen && inversionAEditar) {
      setFecha(inversionAEditar.fecha);
      setCantidad(inversionAEditar.cantidad.toString());
      setCategoriaId(inversionAEditar.categoria_id);
      setCuentaId(inversionAEditar.cuenta_id);
      setNotas(inversionAEditar.notas || '');
    } else if (isOpen) {
      setFecha(new Date().toISOString().split('T')[0]);
      setCantidad('');
      setNotas('');
    }
  }, [isOpen, inversionAEditar]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEnviando(true);

    const payload = { fecha, cantidad: Number(cantidad), categoria_id: categoriaId, cuenta_id: cuentaId, notas: notas || null };
    const url = inversionAEditar ? `/api/inversiones/${inversionAEditar.id}` : '/api/inversiones';
    
    try {
      const response = await fetch(url, { method: inversionAEditar ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok) { onSuccess(); onClose(); } 
      else alert('Error al guardar la inversión');
    } catch { alert('Error de red'); } finally { setEnviando(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{inversionAEditar ? 'Modificar Inversión' : 'Nueva Inversión'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><Calendar size={16}/> Fecha</label>
              <input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-900/30" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><Euro size={16}/> Importe</label>
              <input type="number" step="0.01" required value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-900/30" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><Tags size={16}/> Categoría (Activo)</label>
            <select required value={categoriaId} onChange={e => setCategoriaId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-900/30">
              <option value="" disabled>Selecciona un activo...</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><WalletCards size={16}/> Cuenta</label>
            <select required value={cuentaId} onChange={e => setCuentaId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-900/30">
              <option value="" disabled>Selecciona dónde está...</option>
              {cuentas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><AlignLeft size={16}/> Notas</label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Ej: Compra de 0.05 BTC..." rows={2} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-900/30 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={enviando} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-semibold shadow-md active:scale-95 transition-all">{enviando ? 'Guardando...' : 'Confirmar'}</button>
            <button type="button" onClick={onClose} disabled={enviando} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-semibold active:scale-95 transition-all">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}