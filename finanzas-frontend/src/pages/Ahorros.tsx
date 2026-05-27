import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PiggyBank, Plus, Target, ArrowRightLeft, Coins, Pencil, Trash2, ShieldCheck, History, ArrowDownToLine, ArrowUpFromLine, Flag } from 'lucide-react';
import { formatearMoneda } from '../utils/formatters';
import ModalConfirmacion from '../components/general/ModalConfirmacion';
import ModalMetaAhorro from '../components/ahorros/ModalMetaAhorro';
import ModalHistorialMeta from '../components/ahorros/ModalHistorialMeta';
import ModalMovimientoMeta from '../components/ahorros/ModalMovimientoMeta';
import ModalFinalizarMeta from '../components/ahorros/ModalFinalizarMeta';

export default function Ahorros() {
  const [metas, setMetas] = useState<any[]>([]);
  const [resumen, setResumen] = useState({ dinero_liquido: 0, dinero_invertido: 0 });
  
  const [modalOpen, setModalOpen] = useState(false);
  const [metaAEditar, setMetaAEditar] = useState<any>(null);
  const [itemAEliminar, setItemAEliminar] = useState<any>(null);

  // Estados de los nuevos modales
  const [modalHistorial, setModalHistorial] = useState<any>(null);
  const [modalMovimiento, setModalMovimiento] = useState<{ meta: any, tipo: 'add' | 'withdraw' } | null>(null);
  const [modalFinalizar, setModalFinalizar] = useState<any>(null);

  const cargarDatos = () => {
    fetch('/api/ahorros/metas').then(res => res.json()).then(data => setMetas(data));
    fetch('/api/ahorros/resumen').then(res => res.json()).then(data => setResumen(data));
  };

  useEffect(() => { cargarDatos(); }, []);

  const totalReservadoMetas = useMemo(() => metas.reduce((acc, m) => acc + m.ahorrado, 0), [metas]);
  const dineroDisponibleGastar = resumen.dinero_liquido - totalReservadoMetas;

  const handleEliminarMeta = async () => {
    if (!itemAEliminar) return;
    if (await fetch(`/api/ahorros/metas/${itemAEliminar.id}`, { method: 'DELETE' }).then(res => res.ok)) {
      cargarDatos();
      setItemAEliminar(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 w-full">
      <div className="flex flex-col justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/40 dark:to-orange-900/20 rounded-2xl border border-amber-200/50 dark:border-amber-800/50">
            <PiggyBank className="text-amber-600 dark:text-amber-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Caja de Ahorros</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gestión de capital, carteras y objetivos virtuales</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link to="/ahorros/liquidez" className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:ring-2 hover:ring-blue-500 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Coins size={14}/> Fondo Líquido Real</p>
            <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors"><Plus size={16}/></div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{formatearMoneda(resumen.dinero_liquido)} €</p>
          <span className="text-[10px] text-slate-400 block mt-1">Gestionar cuentas y balances manuales</span>
        </Link>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Target size={14} className="text-emerald-500" /> Reservado para Metas</p>
          <p className="text-2xl font-black text-emerald-500 mt-2">{formatearMoneda(totalReservadoMetas)} €</p>
          <span className="text-[10px] text-slate-400 block mt-1">Retenido virtualmente en los sobres</span>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 dark:from-blue-950/30 dark:to-slate-950 border-2 border-blue-500/30 p-6 rounded-2xl shadow-md md:scale-105">
          <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5 animate-pulse"><ShieldCheck size={14}/> Disponible para Gastar</p>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">{formatearMoneda(dineroDisponibleGastar)} €</p>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mt-1">Dinero libre para usar</span>
        </div>

        <Link to="/ahorros/inversiones" className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:ring-2 hover:ring-amber-500 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><ArrowRightLeft size={14}/> Capital Invertido</p>
            <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/30 transition-colors"><ArrowRightLeft size={16}/></div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">{formatearMoneda(resumen.dinero_invertido)} €</p>
          <span className="text-[10px] text-slate-400 block mt-1">Ver desglose de inversiones y ETFs</span>
        </Link>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><Target className="text-emerald-500"/> Tus Sobres y Metas Virtuales</h2>
          <button onClick={() => { setMetaAEditar(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-500/10 active:scale-95 transition-all">
            <Plus size={16} /> Añadir Meta
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metas.map(m => {
            const porcentaje = Math.min(100, (m.ahorrado / m.objetivo) * 100);

            return (
              <div key={m.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: m.color }}></span>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{m.nombre}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setMetaAEditar(m); setModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Pencil size={15}/></button>
                    <button onClick={() => setItemAEliminar(m)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Trash2 size={15}/></button>
                  </div>
                </div>
                
                <div className="space-y-1 mb-6">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">Asignado: {formatearMoneda(m.ahorrado)} €</span>
                    <span className="text-slate-400">Objetivo: {formatearMoneda(m.objetivo)} €</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${porcentaje}%`, backgroundColor: m.color }}></div>
                  </div>
                  <p className="text-right text-[10px] font-bold text-slate-400 pt-1">{porcentaje.toFixed(0)}% Completado</p>
                </div>

                {/* BOTONERA DE ACCIÓN RÁPIDA */}
                <div className="grid grid-cols-4 gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => setModalHistorial(m)} className="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors group">
                    <History size={18} className="mb-1" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Histórico</span>
                  </button>
                  <button onClick={() => setModalMovimiento({ meta: m, tipo: 'add' })} className="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group">
                    <ArrowDownToLine size={18} className="mb-1" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Añadir</span>
                  </button>
                  <button onClick={() => setModalMovimiento({ meta: m, tipo: 'withdraw' })} className="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group">
                    <ArrowUpFromLine size={18} className="mb-1" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Sacar</span>
                  </button>
                  <button onClick={() => setModalFinalizar(m)} className="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group">
                    <Flag size={18} className="mb-1" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Finalizar</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      <ModalMetaAhorro isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={cargarDatos} metaAEditar={metaAEditar} />
      <ModalConfirmacion isOpen={!!itemAEliminar} onClose={() => setItemAEliminar(null)} onConfirm={handleEliminarMeta} titulo="Eliminar meta de ahorro" mensaje={`¿Estás seguro de eliminar el sobre "${itemAEliminar?.nombre}"? El dinero volverá a estar libre.`} />
      
      {/* NUEVOS MODALES */}
      <ModalHistorialMeta isOpen={!!modalHistorial} onClose={() => setModalHistorial(null)} meta={modalHistorial} />
      <ModalMovimientoMeta isOpen={!!modalMovimiento} onClose={() => setModalMovimiento(null)} onSuccess={cargarDatos} meta={modalMovimiento?.meta} tipo={modalMovimiento?.tipo} />
      <ModalFinalizarMeta isOpen={!!modalFinalizar} onClose={() => setModalFinalizar(null)} onSuccess={cargarDatos} meta={modalFinalizar} />
    </div>
  );
}