import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, CreditCard, AlignLeft } from 'lucide-react';

export type TipoTransaccion = 'GASTO' | 'INGRESO' | 'INVERSION';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaccionAEditar?: any;
  tipoInicial?: TipoTransaccion;
};

export default function ModalTransaccion({ isOpen, onClose, onSuccess, transaccionAEditar, tipoInicial = 'GASTO' }: ModalProps) {
  const hoy = new Date().toISOString().split('T')[0];
  
  const [tipo, setTipo] = useState<TipoTransaccion>(tipoInicial);
  const [fecha, setFecha] = useState(hoy);
  const [cantidad, setCantidad] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [cuentaId, setCuentaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [pendiente, setPendiente] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Estados locales para las listas
  const [categorias, setCategorias] = useState<any[]>([]);
  const [cuentas, setCuentas] = useState<any[]>([]);

  // 1. Seteo inicial al abrir
  useEffect(() => {
    if (isOpen) {
      const tipoFinal = transaccionAEditar?.tipo_operacion_id || tipoInicial;
      setTipo(tipoFinal);

      if (transaccionAEditar) {
        setFecha(transaccionAEditar.fecha || hoy);
        setCantidad(String(transaccionAEditar.cantidad || ''));
        setDescripcion(transaccionAEditar.descripcion || '');
        setPendiente(transaccionAEditar.pendiente || false);
        setCategoriaId('');
        setCuentaId('');
      } else {
        setFecha(hoy);
        setCantidad('');
        setDescripcion('');
        setPendiente(false);
        setCategoriaId('');
        setCuentaId('');
      }
    }
  }, [isOpen, transaccionAEditar, tipoInicial, hoy]);

  // 2. Fetch dinámico de categorías y cuentas según el "tipo" seleccionado
  useEffect(() => {
    if (isOpen) {
      const fetchCatalogos = async () => {
        try {
          const urlCat = tipo === 'GASTO' ? '/api/categorias/gastos' : tipo === 'INGRESO' ? '/api/categorias/ingresos' : '/api/inversiones/categorias';
          const urlCta = tipo === 'GASTO' ? '/api/cuentas/gastos' : tipo === 'INGRESO' ? '/api/cuentas/ingresos' : '/api/inversiones/cuentas';
          
          const [resCat, resCta] = await Promise.all([fetch(urlCat), fetch(urlCta)]);
          const dataCat = await resCat.json();
          const dataCta = await resCta.json();

          setCategorias(dataCat.filter((c: any) => c.activo !== false));
          setCuentas(dataCta.filter((c: any) => c.activo !== false));
        } catch (e) {
          console.error("Error cargando catálogos", e);
        }
      };
      fetchCatalogos();
    }
  }, [isOpen, tipo]);

  // 3. Asignación segura de los IDs en los selectores
  useEffect(() => {
    if (isOpen) {
      if (transaccionAEditar) {
        if (categorias.length > 0 && !categoriaId) {
          const catId = transaccionAEditar.categoria_id || categorias.find(c => c.nombre === transaccionAEditar.categoria)?.id || categorias[0]?.id || '';
          setCategoriaId(catId);
        }
        if (cuentas.length > 0 && !cuentaId) {
          const ctaId = transaccionAEditar.cuenta_id || cuentas.find(c => c.nombre === transaccionAEditar.cuenta)?.id || cuentas[0]?.id || '';
          setCuentaId(ctaId);
        }
      } else {
        if (categorias.length > 0 && !categoriaId) setCategoriaId(categorias[0].id);
        if (cuentas.length > 0 && !cuentaId) setCuentaId(cuentas[0].id);
      }
    }
  }, [isOpen, transaccionAEditar, categorias, cuentas, categoriaId, cuentaId]);

  if (!isOpen) return null;

  // Tema dinámico basado en el tipo seleccionado
  const getTema = () => {
    if (tipo === 'GASTO') return { bg: 'bg-red-500', btn: 'from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700', ring: 'focus:ring-red-100 dark:focus:ring-red-900/30', toggle: 'peer-checked:bg-red-500' };
    if (tipo === 'INGRESO') return { bg: 'bg-emerald-500', btn: 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700', ring: 'focus:ring-emerald-100 dark:focus:ring-emerald-900/30', toggle: 'peer-checked:bg-emerald-500' };
    return { bg: 'bg-amber-500', btn: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600', ring: 'focus:ring-amber-100 dark:focus:ring-amber-900/30', toggle: 'peer-checked:bg-amber-500' };
  };
  const tema = getTema();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!categoriaId || !cuentaId) { alert('Por favor, selecciona una categoría y cuenta.'); return; }
    
    setEnviando(true);
    const cantidadLimpia = Math.round(parseFloat(String(cantidad).replace(',', '.')) * 100) / 100;

    if (isNaN(cantidadLimpia) || cantidadLimpia <= 0) { alert('Introduce una cantidad válida.'); setEnviando(false); return; }

    const payload: any = { fecha, cantidad: cantidadLimpia, categoria_id: categoriaId, cuenta_id: cuentaId, descripcion: descripcion.trim() || null, pendiente };

    const urls = { GASTO: '/api/gastos', INGRESO: '/api/ingresos', INVERSION: '/api/inversiones' };
    const url = transaccionAEditar ? `${urls[tipo]}/${transaccionAEditar.id}` : urls[tipo];
    const method = transaccionAEditar ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { onSuccess(); onClose(); } 
      else alert('Error al guardar en el servidor.');
    } catch { alert('Error de red.'); } finally { setEnviando(false); }
  };

  const inputClases = `w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-black focus:ring-2 ${tema.ring} transition-all`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-900/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {transaccionAEditar ? `Editar ${tipo.charAt(0) + tipo.slice(1).toLowerCase()}` : `Nueva Operación`}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* SELECTOR DE TIPO (Solo si es nuevo) */}
          {!transaccionAEditar && (
            <div className="flex p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl mb-4 border border-slate-200 dark:border-zinc-800">
              {(['GASTO', 'INGRESO', 'INVERSION'] as TipoTransaccion[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTipo(t); setCategoriaId(''); setCuentaId(''); }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all capitalize ${
                    tipo === t 
                      ? (t === 'GASTO' ? 'bg-red-500 text-white shadow-md' : t === 'INGRESO' ? 'bg-emerald-500 text-white shadow-md' : 'bg-amber-500 text-white shadow-md') 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {t.toLowerCase()}
                </button>
              ))}
            </div>
          )}

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

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-1.5"><AlignLeft size={16} className="text-slate-400"/> Descripción</label>
            <textarea rows={2} placeholder="Detalle de la operación..." value={descripcion} onChange={e => setDescripcion(e.target.value)} className={`${inputClases} resize-none`} />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-100/50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl mt-2">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Operación Pendiente</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Aún no reflejada en el banco</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={pendiente} onChange={e => setPendiente(e.target.checked)}/>
              <div className={`w-11 h-6 bg-slate-300 dark:bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${tema.toggle}`}></div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" disabled={enviando} className={`w-full sm:w-1/2 order-1 sm:order-2 bg-gradient-to-r ${tema.btn} text-white py-2.5 rounded-xl font-semibold shadow-lg active:scale-95 transition-all`}>
              {enviando ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={onClose} disabled={enviando} className="w-full sm:w-1/2 order-2 sm:order-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-semibold active:scale-95 transition-all">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}