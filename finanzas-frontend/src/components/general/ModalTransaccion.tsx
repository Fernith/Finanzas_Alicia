import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, CreditCard, AlignLeft, Info } from 'lucide-react';

export type TipoTransaccion = 'GASTO' | 'INGRESO' | 'INVERSION';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categorias: any[];
  cuentas: any[];
  transaccionAEditar?: any;
  tipo: TipoTransaccion;
};

export default function ModalTransaccion({ isOpen, onClose, onSuccess, categorias, cuentas, transaccionAEditar, tipo }: ModalProps) {
  const hoy = new Date().toISOString().split('T')[0];
  
  const [fecha, setFecha] = useState(hoy);
  const [cantidad, setCantidad] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [cuentaId, setCuentaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [campoExtra, setCampoExtra] = useState('');
  const [pendiente, setPendiente] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Efecto 1: Cargar datos cuando se abre el modal o cambia la transacción
  useEffect(() => {
    if (isOpen) {
      if (transaccionAEditar) {
        setFecha(transaccionAEditar.fecha || hoy);
        setCantidad(String(transaccionAEditar.cantidad || ''));

        const catId = transaccionAEditar.categoria_id || 
                      categorias.find(c => c.nombre === transaccionAEditar.categoria)?.id || 
                      categorias[0]?.id || '';
        setCategoriaId(catId);

        const ctaId = transaccionAEditar.cuenta_id || 
                      cuentas.find(c => c.nombre === transaccionAEditar.cuenta)?.id || 
                      cuentas[0]?.id || '';
        setCuentaId(ctaId);

        setDescripcion(transaccionAEditar.descripcion || '');
        setCampoExtra(transaccionAEditar.campo_extra_ingreso || '');
        setPendiente(transaccionAEditar.pendiente || false);
      } else {
        // Modo "Nuevo"
        setFecha(hoy);
        setCantidad('');
        setCategoriaId(categorias[0]?.id || '');
        setCuentaId(cuentas[0]?.id || '');
        setDescripcion('');
        setCampoExtra('');
        setPendiente(false);
      }
    }
  }, [isOpen, transaccionAEditar, categorias, cuentas, hoy]);

  // Efecto 2 (CRÍTICO): Fallback por si las listas de categorías/cuentas cargan DESPUÉS de abrir el modal
  useEffect(() => {
    if (isOpen && !categoriaId && categorias.length > 0) setCategoriaId(categorias[0].id);
    if (isOpen && !cuentaId && cuentas.length > 0) setCuentaId(cuentas[0].id);
  }, [categorias, cuentas, isOpen, categoriaId, cuentaId]);

  if (!isOpen) return null;

  const getTema = () => {
    if (tipo === 'GASTO') return { bg: 'bg-red-500', btn: 'from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700', ring: 'focus:ring-red-100 dark:focus:ring-red-900/30', toggle: 'peer-checked:bg-red-500' };
    if (tipo === 'INGRESO') return { bg: 'bg-emerald-500', btn: 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700', ring: 'focus:ring-emerald-100 dark:focus:ring-emerald-900/30', toggle: 'peer-checked:bg-emerald-500' };
    return { bg: 'bg-amber-500', btn: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600', ring: 'focus:ring-amber-100 dark:focus:ring-amber-900/30', toggle: 'peer-checked:bg-amber-500' };
  };
  const tema = getTema();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoriaId || !cuentaId) {
      alert('Por favor, selecciona una categoría y una cuenta.');
      return;
    }

    setEnviando(true);

    const cantidadStr = String(cantidad).replace(',', '.');
    const cantidadLimpia = Math.round(parseFloat(cantidadStr) * 100) / 100;

    if (isNaN(cantidadLimpia) || cantidadLimpia <= 0) {
      alert('Por favor, introduce una cantidad válida.');
      setEnviando(false);
      return;
    }

    const payload: any = {
      fecha,
      cantidad: cantidadLimpia,
      categoria_id: categoriaId,
      cuenta_id: cuentaId,
      descripcion: descripcion.trim() || null,
      pendiente
    };

    if (tipo === 'INGRESO') {
      payload.campo_extra_ingreso = campoExtra.trim() || null;
    }

    const urls = { GASTO: '/api/gastos', INGRESO: '/api/ingresos', INVERSION: '/api/inversiones' };
    const url = transaccionAEditar ? `${urls[tipo]}/${transaccionAEditar.id}` : urls[tipo];
    const method = transaccionAEditar ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSuccess();
        onClose(); // Esto llama al padre que reseteará los estados
      } else {
        const errorMsg = await res.text();
        console.error('Error del servidor:', errorMsg);
        alert('Error al guardar en el servidor. Verifica que los datos son correctos.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de red. Comprueba tu conexión.');
    } finally {
      setEnviando(false);
    }
  };

  // Clases unificadas para inputs (Modo Oscuro Corregido)
  const inputClases = `w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 ${tema.ring} transition-all`;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {transaccionAEditar ? `Editar ${tipo.charAt(0) + tipo.slice(1).toLowerCase()}` : `Nuevo ${tipo.charAt(0) + tipo.slice(1).toLowerCase()}`}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-1.5"><Calendar size={16} className="text-slate-400"/> Fecha</label>
              <input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} className={inputClases} />
            </div>
            <div className="w-1/2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-1.5"><DollarSign size={16} className="text-slate-400"/> Cantidad (€)</label>
              <input type="number" step="0.01" min="0.01" required value={cantidad} onChange={e => setCantidad(e.target.value)} className={inputClases} placeholder="0.00" />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-1.5"><Tag size={16} className="text-slate-400"/> {tipo === 'INVERSION' ? 'Activo' : 'Categoría'}</label>
            <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} className={inputClases}>
              {categorias.length === 0 && <option value="" disabled>Cargando...</option>}
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-1.5"><CreditCard size={16} className="text-slate-400"/> Cuenta</label>
            <select value={cuentaId} onChange={e => setCuentaId(e.target.value)} className={inputClases}>
              {cuentas.length === 0 && <option value="" disabled>Cargando...</option>}
              {cuentas.map(cta => <option key={cta.id} value={cta.id}>{cta.nombre}</option>)}
            </select>
          </div>

          {tipo === 'INGRESO' && (
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-1.5"><Info size={16} className="text-slate-400"/> Info Extra</label>
              <input type="text" placeholder="Ej. Nómina, Venta..." value={campoExtra} onChange={e => setCampoExtra(e.target.value)} className={inputClases} />
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-1.5"><AlignLeft size={16} className="text-slate-400"/> Descripción</label>
            <textarea rows={2} placeholder="Detalle de la operación..." value={descripcion} onChange={e => setDescripcion(e.target.value)} className={`${inputClases} resize-none`} />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl mt-2">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Operación Pendiente</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Aún no reflejada en el banco</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={pendiente} onChange={e => setPendiente(e.target.checked)}/>
              <div className={`w-11 h-6 bg-slate-300 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${tema.toggle}`}></div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" disabled={enviando} className={`w-full sm:w-1/2 order-1 sm:order-2 bg-gradient-to-r ${tema.btn} text-white py-2.5 rounded-xl font-semibold shadow-lg active:scale-95 transition-all`}>
              {enviando ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={onClose} disabled={enviando} className="w-full sm:w-1/2 order-2 sm:order-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-semibold active:scale-95 transition-all">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}