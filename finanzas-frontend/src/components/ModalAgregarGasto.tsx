import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, CreditCard, AlignLeft } from 'lucide-react';

type ItemMaestro = { id: string; nombre: string };

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categorias: ItemMaestro[];
  cuentas: ItemMaestro[];
  gastoAEditar?: any; // NUEVO: Si viene relleno, estamos en modo EDICIÓN
};

export default function ModalAgregarGasto({ isOpen, onClose, onSuccess, categorias, cuentas, gastoAEditar }: ModalProps) {
  const hoy = new Date().toISOString().split('T')[0];

  const [fecha, setFecha] = useState(hoy);
  const [cantidad, setCantidad] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [cuentaId, setCuentaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (gastoAEditar) {
        // MODO EDICIÓN: Rellenamos con los datos del gasto que queremos cambiar
        setFecha(gastoAEditar.fecha);
        setCantidad(String(gastoAEditar.cantidad));
        
        const catFound = categorias.find(c => c.nombre === gastoAEditar.categoria);
        setCategoriaId(catFound?.id || categorias[0]?.id || '');
        
        const ctaFound = cuentas.find(c => c.nombre === gastoAEditar.cuenta);
        setCuentaId(ctaFound?.id || cuentas[0]?.id || '');
        
        setDescripcion(gastoAEditar.descripcion || '');
      } else {
        // MODO NUEVO GASTO: Valores limpios
        setFecha(hoy);
        setCantidad('');
        setCategoriaId(categorias[0]?.id || '');
        setCuentaId(cuentas[0]?.id || '');
        setDescripcion('');
      }
    }
  }, [isOpen, gastoAEditar, categorias, cuentas, hoy]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cantidad || !categoriaId || !cuentaId) return;

    setEnviando(true);
    const cantidadLimpia = parseFloat(cantidad.replace(',', '.'));
    const cantidadRedondeada = Math.round(cantidadLimpia * 100) / 100;

    if (isNaN(cantidadRedondeada) || cantidadRedondeada <= 0) {
      alert('Cantidad inválida.');
      setEnviando(false);
      return;
    }

    const payload = {
      fecha,
      cantidad: cantidadRedondeada,
      categoria_id: categoriaId,
      cuenta_id: cuentaId,
      descripcion: descripcion.trim() || null
    };

    try {
      // MODIFICADO: URL dinámica y método dinámico (PUT si editamos, POST si creamos)
      const url = gastoAEditar 
        ? `/api/gastos/${gastoAEditar.id}`
        : '/api/gastos';
        
      const method = gastoAEditar ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        alert('Error al guardar en el servidor.');
      }
    } catch {
      alert('Error de red.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          {/* Título dinámico */}
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {gastoAEditar ? 'Editar Gasto' : 'Agregar Nuevo Gasto'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><Calendar size={16} className="text-slate-400" /> Fecha</label>
            <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><DollarSign size={16} className="text-slate-400" /> Cantidad (€)</label>
            <input type="text" inputMode="decimal" placeholder="0,00" required value={cantidad} onChange={(e) => setCantidad(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-red-100" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><Tag size={16} className="text-slate-400" /> Categoría</label>
            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-red-100 cursor-pointer">
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><CreditCard size={16} className="text-slate-400" /> Cuenta de Pago</label>
            <select value={cuentaId} onChange={(e) => setCuentaId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-red-100 cursor-pointer">
              {cuentas.map(cta => <option key={cta.id} value={cta.id}>{cta.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><AlignLeft size={16} className="text-slate-400" /> Descripción</label>
            <textarea rows={3} placeholder="Detalle del movimiento..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-red-100 resize-none" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" disabled={enviando} className="w-full sm:w-1/2 order-1 sm:order-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white py-2.5 rounded-xl font-semibold shadow-lg shadow-red-500/20 active:scale-95 transition-all">
              {enviando ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={onClose} disabled={enviando} className="w-full sm:w-1/2 order-2 sm:order-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-semibold active:scale-95 transition-all">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}