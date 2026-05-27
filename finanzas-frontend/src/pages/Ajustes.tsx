import { useState, useEffect } from 'react';
import { Settings, Plus, Pencil, Trash2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import ModalAjusteMaestro from '../ajustes/ModalAjusteMaestro';
import ModalConfirmacion from '../components/general/ModalConfirmacion';

export default function Ajustes() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [cuentas, setCuentas] = useState<any[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [targetModal, setTargetModal] = useState<'categorias' | 'cuentas'>('categorias');
  const [itemSeleccionado, setItemSeleccionado] = useState<any>(null);

  // ESTADO MEJORADO: Ahora sabe si la acción es activar o desactivar
  const [accionConfirmacion, setAccionConfirmacion] = useState<{ 
    target: 'categorias' | 'cuentas', 
    id: string, 
    nombre: string, 
    tipo: 'activar' | 'desactivar' 
  } | null>(null);

  const cargarCategorias = () => fetch('/api/ajustes/categorias').then(res => res.json()).then(data => setCategorias(data));
  const cargarCuentas = () => fetch('/api/ajustes/cuentas').then(res => res.json()).then(data => setCuentas(data));

  useEffect(() => {
    cargarCategorias();
    cargarCuentas();
  }, []);

  const handleAbrirAlta = (target: 'categorias' | 'cuentas') => {
    setTargetModal(target);
    setItemSeleccionado(null);
    setModalOpen(true);
  };

  const handleAbrirEdicion = (target: 'categorias' | 'cuentas', item: any) => {
    setTargetModal(target);
    setItemSeleccionado(item);
    setModalOpen(true);
  };

  // Lógica unificada para el modal de confirmación
  const ejecutarAccionConfirmada = async () => {
    if (!accionConfirmacion) return;
    
    const { target, id, tipo } = accionConfirmacion;
    
    // Si desactivamos enviamos DELETE a /:id, si activamos enviamos PUT a /:id/activar
    const url = tipo === 'desactivar' 
      ? `/api/ajustes/${target}/${id}`
      : `/api/ajustes/${target}/${id}/activar`;
      
    const method = tipo === 'desactivar' ? 'DELETE' : 'PUT';

    try {
      const res = await fetch(url, { method });
      if (res.ok) {
        target === 'categorias' ? cargarCategorias() : cargarCuentas();
      } else {
        alert(`No se pudo ${tipo} el elemento.`);
      }
    } catch { 
      alert('Error de conexión.'); 
    } finally {
      setAccionConfirmacion(null);
    }
  };

  const renderColumnaMaestra = (titulo: string, items: any[], target: 'categorias' | 'cuentas') => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden h-full">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">{titulo}</h2>
        <button 
          onClick={() => handleAbrirAlta(target)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shadow-blue-500/10 active:scale-95"
        >
          <Plus size={14} /> Añadir
        </button>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 overflow-y-auto max-h-[500px]">
        {items.length > 0 ? (
          items.map(item => (
            <div key={item.id} className={`p-4 flex justify-between items-center transition-colors ${!item.activo ? 'opacity-50 bg-slate-50/40 dark:bg-slate-900/20' : 'hover:bg-slate-50/30 dark:hover:bg-slate-800/20'}`}>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full shadow-inner border border-black/10 shrink-0" style={{ backgroundColor: item.color }}></span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.nombre}</p>
                  
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {/* Renderizado para Categorías (String simple) */}
                    {typeof item.tipo_operacion_id === 'string' && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${item.tipo_operacion_id === 'GASTO' ? 'bg-red-50 text-red-600 dark:bg-red-950/30' : item.tipo_operacion_id === 'INGRESO' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'}`}>
                        {item.tipo_operacion_id}
                      </span>
                    )}

                    {/* Renderizado para Cuentas (Array de Strings) */}
                    {Array.isArray(item.tipos_operacion) && item.tipos_operacion.map((tipo: string) => (
                      <span key={tipo} className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${tipo === 'GASTO' ? 'bg-red-50 text-red-600 dark:bg-red-950/30' : tipo === 'INGRESO' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'}`}>
                        {tipo}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item.activo ? (
                  <span className="text-emerald-500" title="Activo"><CheckCircle size={14} /></span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium" title="Inactivo"><XCircle size={14} /> Inactivo</span>
                )}
                
                <button onClick={() => handleAbrirEdicion(target, item)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors" title="Editar"><Pencil size={15} /></button>
                
                {/* BOTÓN DINÁMICO: Eliminar (Papelera) si está activo, Reactivar (Flecha) si está inactivo */}
                {item.activo ? (
                  <button 
                    onClick={() => setAccionConfirmacion({ target, id: item.id, nombre: item.nombre, tipo: 'desactivar' })} 
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors" title="Desactivar"
                  >
                    <Trash2 size={15} />
                  </button>
                ) : (
                  <button 
                    onClick={() => setAccionConfirmacion({ target, id: item.id, nombre: item.nombre, tipo: 'activar' })} 
                    className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-colors" title="Reactivar"
                  >
                    <RotateCcw size={15} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-400 text-sm">No hay registros definidos.</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-900/20 rounded-2xl shadow-sm border border-blue-200/50 dark:border-blue-800/50">
            <Settings className="text-blue-600 dark:text-blue-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Ajustes Generales</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configura y personaliza tus categorías y métodos de cuenta</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {renderColumnaMaestra('Catálogo de Categorías', categorias, 'categorias')}
        {renderColumnaMaestra('Catálogo de Cuentas Financieras', cuentas, 'cuentas')}
      </div>

      <ModalAjusteMaestro 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={targetModal === 'categorias' ? cargarCategorias : cargarCuentas}
        target={targetModal}
        itemAEditar={itemSeleccionado}
      />

      {/* MODAL DE CONFIRMACIÓN DINÁMICO */}
      <ModalConfirmacion 
        isOpen={!!accionConfirmacion} 
        onClose={() => setAccionConfirmacion(null)} 
        onConfirm={ejecutarAccionConfirmada}
        titulo={accionConfirmacion?.tipo === 'desactivar' ? "Desactivar elemento" : "Reactivar elemento"}
        mensaje={
          accionConfirmacion?.tipo === 'desactivar' 
          ? `¿Estás seguro de que deseas desactivar "${accionConfirmacion?.nombre}"? Dejará de aparecer en los selectores.`
          : `Vas a reactivar "${accionConfirmacion?.nombre}". Volverá a estar disponible para nuevos registros.`
        }
        textoBoton={accionConfirmacion?.tipo === 'desactivar' ? "Desactivar" : "Reactivar"}
        variante={accionConfirmacion?.tipo === 'desactivar' ? 'danger' : 'success'}
      />
    </div>
  );
}