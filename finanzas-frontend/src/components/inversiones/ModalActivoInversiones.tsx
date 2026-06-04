import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function ModalActivoInversion({ isOpen, onClose, onSuccess, activoAEditar }: any) {
  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [categorias, setCategorias] = useState<any[]>([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    // Cargamos solo las categorías marcadas como 'INVERSION'
    fetch('/api/ajustes/categorias')
      .then(r => r.json())
      .then(data => setCategorias(data.filter((c: any) => c.tipo_operacion_id === 'INVERSION' && c.activo)));
  }, []);

  useEffect(() => {
    if (activoAEditar && isOpen) {
      setNombre(activoAEditar.nombre);
      setCategoriaId(activoAEditar.categoria_id || '');
    }
  }, [activoAEditar, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    const payload = { 
        ticker: activoAEditar.ticker, // El Ticker NO cambia
        nombre: nombre.trim(), 
        categoria_id: categoriaId !== '' ? categoriaId : null 
    };

    try {
      const res = await fetch(`/api/inversiones/activos/${activoAEditar.ticker}`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
      });
      if (res.ok) { onSuccess(); onClose(); } else { alert('Error al guardar'); }
    } catch { alert('Error de red'); } finally { setEnviando(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/50">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Modificar Activo</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Nombre del Activo</label>
            <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
            <p className="text-xs text-neutral-500 mt-1">Ticker: <strong>{activoAEditar?.ticker}</strong> (No modificable)</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Categoría de Inversión</label>
            <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50">
              <option value="">Sin asignar</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <button type="submit" disabled={enviando} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">
            <Save size={18}/> {enviando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}