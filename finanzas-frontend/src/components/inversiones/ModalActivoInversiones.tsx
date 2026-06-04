import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function ModalActivoInversiones({ isOpen, onClose, onSuccess, activoAEditar }: any) {
  const [ticker, setTicker] = useState('');
  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [categorias, setCategorias] = useState<any[]>([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch('/api/ajustes/categorias')
      .then(r => r.json())
      .then(data => setCategorias(data.filter((c: any) => c.tipo_operacion_id === 'INVERSION' && c.activo)));
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (activoAEditar) {
        setTicker(activoAEditar.ticker);
        setNombre(activoAEditar.nombre);
        setCategoriaId(activoAEditar.categoria_id || '');
      } else {
        setTicker('');
        setNombre('');
        setCategoriaId('');
      }
    }
  }, [activoAEditar, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    
    const payload = { 
        ticker: ticker.trim().toUpperCase(), 
        nombre: nombre.trim(), 
        categoria_id: categoriaId !== '' ? categoriaId : null 
    };

    try {
      const url = activoAEditar ? `/api/inversiones/activos/${activoAEditar.ticker}` : '/api/inversiones/activos';
      const method = activoAEditar ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
      });
      if (res.ok) { onSuccess(); onClose(); } else { alert('Error al guardar. Si es un activo nuevo, verifica que el Ticker no exista ya.'); }
    } catch { alert('Error de red'); } finally { setEnviando(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/50">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{activoAEditar ? 'Modificar Activo' : 'Nuevo Activo'}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Ticker (Símbolo)</label>
            <input type="text" required disabled={!!activoAEditar} value={ticker} onChange={e => setTicker(e.target.value)} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 uppercase" placeholder="Ej: AAPL" />
            {activoAEditar && <p className="text-xs text-neutral-500 mt-1">El ticker no se puede modificar una vez creado.</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Nombre del Activo</label>
            <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Ej: Apple Inc." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Categoría de Inversión</label>
            <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50">
              <option value="">Sin asignar</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <button type="submit" disabled={enviando} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">
            <Save size={18}/> {enviando ? 'Guardando...' : 'Guardar Activo'}
          </button>
        </form>
      </div>
    </div>
  );
}