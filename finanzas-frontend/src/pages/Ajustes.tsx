import { useState, useEffect } from 'react';
import { Settings, Plus, Pencil, Trash2, CheckCircle, XCircle, RotateCcw, Clock, GripVertical } from 'lucide-react';
import ModalAjusteMaestro from '../components/ajustes/ModalAjusteMaestro';
import ModalConfirmacion from '../components/general/ModalConfirmacion';
import { useConfig } from '../context/ConfigContext';

export default function Ajustes() {
  const { usarPendientes, setUsarPendientes } = useConfig();
  const [categorias, setCategorias] = useState<any[]>([]);
  const [cuentas, setCuentas] = useState<any[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [targetModal, setTargetModal] = useState<'categorias' | 'cuentas'>('categorias');
  const [itemSeleccionado, setItemSeleccionado] = useState<any>(null);

  const [modalPendientesAbierto, setModalPendientesAbierto] = useState(false);
  const [accionConfirmacion, setAccionConfirmacion] = useState<{ 
    target: 'categorias' | 'cuentas', id: string, nombre: string, tipo: 'activar' | 'desactivar' 
  } | null>(null);

  // --- ESTADOS PARA DRAG & DROP ---
  const [draggedItem, setDraggedItem] = useState<{ index: number, target: string } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

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

  const ejecutarAccionConfirmada = async () => {
    if (!accionConfirmacion) return;
    const { target, id, tipo } = accionConfirmacion;
    const url = tipo === 'desactivar' ? `/api/ajustes/${target}/${id}` : `/api/ajustes/${target}/${id}/activar`;
    const method = tipo === 'desactivar' ? 'DELETE' : 'PUT';

    try {
      const res = await fetch(url, { method });
      if (res.ok) {
        target === 'categorias' ? cargarCategorias() : cargarCuentas();
      } else {
        alert(`No se pudo ${tipo} el elemento.`);
      }
    } catch { alert('Error de conexión.'); } finally { setAccionConfirmacion(null); }
  };

  const confirmarTogglePendientes = async () => {
    const nuevoEstado = !usarPendientes;
    setUsarPendientes(nuevoEstado); 
    try {
      await fetch('/api/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usar_pendientes: nuevoEstado })
      });
    } catch (e) {
      alert('Error de conexión al guardar la configuración');
      setUsarPendientes(!nuevoEstado); 
    } finally { setModalPendientesAbierto(false); }
  };

  // ==========================================
  // LÓGICA DE DRAG & DROP Y REORDENACIÓN
  // ==========================================
  const handleDragStart = (e: React.DragEvent, index: number, target: string) => {
    // Solo permitimos arrastrar dentro del mismo grupo
    setDraggedItem({ index, target });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number, target: string) => {
    e.preventDefault();
    if (draggedItem?.target === target) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number, target: string) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    if (!draggedItem || draggedItem.target !== target || draggedItem.index === dropIndex) return;

    setIsSavingOrder(true);
    const isCategoria = target === 'categorias';
    
    // Clonamos la lista actual
    const items = isCategoria ? [...categorias] : [...cuentas];
    const dragIndex = draggedItem.index;

    // Recortamos el elemento arrastrado y lo insertamos en la nueva posición visual
    const [draggedEl] = items.splice(dragIndex, 1);
    items.splice(dropIndex, 0, draggedEl);

    // Actualización optimista de la UI
    if (isCategoria) setCategorias(items);
    else setCuentas(items);

    // Construimos el Payload (La posición en el array es el nuevo `orden` exacto y correlativo)
    const payload = items.map((item, idx) => ({ id: item.id, orden: idx }));

    // Enviamos a la base de datos
    try {
      const res = await fetch(`/api/ajustes/${target}/reordenar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al guardar');
    } catch {
      alert("Error al guardar el nuevo orden en el servidor.");
      // Si falla, recargamos la lista desde BBDD para revertir
      isCategoria ? cargarCategorias() : cargarCuentas();
    } finally {
      setIsSavingOrder(false);
      setDraggedItem(null);
    }
  };

  const renderColumnaMaestra = (titulo: string, items: any[], target: 'categorias' | 'cuentas') => (
    <div className={`bg-white dark:bg-neutral-900 border border-slate-200 dark:border-amber-600/40 rounded-2xl shadow-sm flex flex-col overflow-hidden h-full transition-opacity ${isSavingOrder ? 'opacity-70 pointer-events-none' : ''}`}>
      <div className="p-5 border-b border-slate-200 dark:border-amber-600/40 bg-slate-50/50 dark:bg-neutral-900/50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">{titulo}</h2>
        <button 
          onClick={() => handleAbrirAlta(target)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shadow-blue-500/10 active:scale-95"
        >
          <Plus size={14} /> Añadir
        </button>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-amber-600/20 overflow-y-auto max-h-[500px]">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div 
              key={item.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, index, target)}
              onDragOver={(e) => handleDragOver(e, index, target)}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={(e) => handleDrop(e, index, target)}
              className={`p-4 flex justify-between items-center transition-all cursor-move
                ${!item.activo ? 'opacity-50 bg-slate-50/40 dark:bg-neutral-900/20' : 'hover:bg-slate-50/30 dark:hover:bg-neutral-800/50'}
                ${draggedItem?.target === target && dragOverIndex === index ? 'bg-slate-100 dark:bg-neutral-800 shadow-inner' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <GripVertical size={16} className="text-slate-400 shrink-0 hover:text-slate-600 dark:hover:text-slate-200" />
                <span className="w-4 h-4 rounded-full shadow-inner border border-black/10 shrink-0" style={{ backgroundColor: item.color }}></span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.nombre}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {typeof item.tipo_operacion_id === 'string' && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${item.tipo_operacion_id === 'GASTO' ? 'bg-red-50 text-red-600 dark:bg-red-950/30' : item.tipo_operacion_id === 'INGRESO' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'}`}>
                        {item.tipo_operacion_id}
                      </span>
                    )}
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
                {item.activo ? (
                  <button onClick={() => setAccionConfirmacion({ target, id: item.id, nombre: item.nombre, tipo: 'desactivar' })} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors" title="Desactivar"><Trash2 size={15} /></button>
                ) : (
                  <button onClick={() => setAccionConfirmacion({ target, id: item.id, nombre: item.nombre, tipo: 'activar' })} className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-colors" title="Reactivar"><RotateCcw size={15} /></button>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 dark:border-amber-600/40 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-900/20 rounded-2xl shadow-sm border border-blue-200/50 dark:border-blue-800/50">
            <Settings className="text-blue-600 dark:text-blue-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Ajustes Generales</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configura y personaliza tus categorías y cuentas (Arrastra para reordenar)</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-amber-600/40 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock size={20} className="text-amber-500"/> Gestión de Operaciones Pendientes
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Activa esta opción para registrar operaciones que aún no se han reflejado en tu banco.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input type="checkbox" className="sr-only peer" checked={usarPendientes} onChange={() => setModalPendientesAbierto(true)}/>
          <div className="w-11 h-6 bg-slate-300 dark:bg-neutral-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {renderColumnaMaestra('Catálogo de Categorías', categorias, 'categorias')}
        {renderColumnaMaestra('Catálogo de Cuentas', cuentas, 'cuentas')}
      </div>

      <ModalAjusteMaestro 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={targetModal === 'categorias' ? cargarCategorias : cargarCuentas}
        target={targetModal}
        itemAEditar={itemSeleccionado}
      />

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

      <ModalConfirmacion 
        isOpen={modalPendientesAbierto} 
        onClose={() => setModalPendientesAbierto(false)} 
        onConfirm={confirmarTogglePendientes}
        titulo={usarPendientes ? "Desactivar Operaciones Pendientes" : "Activar Operaciones Pendientes"}
        mensaje={usarPendientes 
          ? "¿Estás seguro de que deseas desactivar la gestión de operaciones pendientes? Dejarán de mostrarse las operaciones como pendientes en los listados y las sumas se calcularán sobre el total de registros."
          : "¿Estás seguro de que deseas activar la gestión de operaciones pendientes? Podrás registrar movimientos que aún no se han reflejado en el banco."
        }
        textoBoton={usarPendientes ? "Desactivar" : "Activar"}
        variante={usarPendientes ? 'danger' : 'success'}
      />
    </div>
  );
}