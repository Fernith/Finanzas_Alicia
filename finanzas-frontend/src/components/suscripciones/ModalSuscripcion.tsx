import { useState, useEffect, useMemo } from 'react';
import { X, Save } from 'lucide-react';

type Props = { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
  suscripcionAEditar: any; 
  cuentas: any[]; 
};

export default function ModalSuscripcion({ isOpen, onClose, onSuccess, suscripcionAEditar, cuentas }: Props) {
  const [form, setForm] = useState({ 
    nombre: '', cantidad: '', cuenta_id: '', fecha_inicio: '', 
    fecha_proxima_renovacion: '', periodicidad: 'MENSUAL', activo: true 
  });

  // Filtramos las cuentas: solo las activas que soportan 'GASTO' (o la que ya tenía seleccionada)
  const cuentasValidas = useMemo(() => {
    return cuentas.filter(c => 
      (c.activo && c.tipos_operacion?.includes('GASTO')) || 
      (suscripcionAEditar && c.id === suscripcionAEditar.cuenta_id)
    );
  }, [cuentas, suscripcionAEditar]);

  useEffect(() => {
    if (suscripcionAEditar) { 
      setForm({ ...suscripcionAEditar }); 
    } else { 
      setForm({ 
        nombre: '', 
        cantidad: '', 
        cuenta_id: cuentasValidas.length > 0 ? cuentasValidas[0].id : '', 
        fecha_inicio: new Date().toISOString().split('T')[0], 
        fecha_proxima_renovacion: '', 
        periodicidad: 'MENSUAL', 
        activo: true 
      }); 
    }
  }, [suscripcionAEditar, isOpen, cuentasValidas]);

  useEffect(() => {
    if (!suscripcionAEditar && form.fecha_inicio && !form.fecha_proxima_renovacion) {
      const d = new Date(form.fecha_inicio);
      if (form.periodicidad === 'MENSUAL') d.setMonth(d.getMonth() + 1);
      else if (form.periodicidad === 'ANUAL') d.setFullYear(d.getFullYear() + 1);
      else if (form.periodicidad === '30_DIAS') d.setDate(d.getDate() + 30);
      setForm(prev => ({ ...prev, fecha_proxima_renovacion: d.toISOString().split('T')[0] }));
    }
  }, [form.fecha_inicio, form.periodicidad, suscripcionAEditar]);

  // Se añade el tipado estricto <HTMLFormElement> para solucionar el aviso
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Forzamos el casteo a número para evitar el Error 422 de Rust
    const payload = {
      ...form,
      cantidad: Number(form.cantidad)
    };

    const url = suscripcionAEditar ? `/api/suscripciones/${suscripcionAEditar.id}` : '/api/suscripciones';
    const method = suscripcionAEditar ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      
      if (res.ok) {
        onSuccess(); 
        onClose();
      } else {
        const errorText = await res.text();
        alert(`No se pudo guardar: ${errorText}`);
      }
    } catch (error) {
      alert("Error de conexión al guardar la suscripción.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-neutral-700">
        <div className="p-5 border-b border-slate-200 dark:border-neutral-700 flex justify-between items-center bg-slate-50/50 dark:bg-neutral-900/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {suscripcionAEditar ? 'Editar Suscripción' : 'Nueva Suscripción'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 dark:text-slate-300">Nombre del Servicio</label>
            <input required type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full p-2.5 bg-slate-100 dark:bg-neutral-800 rounded-lg outline-none focus:ring-2 focus:ring-slate-500/50 dark:text-white" placeholder="Ej: Netflix, Gimnasio..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 dark:text-slate-300">Cantidad (€)</label>
              <input required type="number" step="0.01" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} className="w-full p-2.5 bg-slate-100 dark:bg-neutral-800 rounded-lg outline-none focus:ring-2 focus:ring-slate-500/50 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 dark:text-slate-300">Periodicidad</label>
              <select value={form.periodicidad} onChange={e => setForm({...form, periodicidad: e.target.value})} className="w-full p-2.5 bg-slate-100 dark:bg-neutral-800 rounded-lg outline-none focus:ring-2 focus:ring-slate-500/50 dark:text-white cursor-pointer">
                <option value="MENSUAL">Mensual</option>
                <option value="ANUAL">Anual</option>
                <option value="30_DIAS">Cada 30 Días</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 dark:text-slate-300">Cuenta de Cobro</label>
            <select required value={form.cuenta_id} onChange={e => setForm({...form, cuenta_id: e.target.value})} className="w-full p-2.5 bg-slate-100 dark:bg-neutral-800 rounded-lg outline-none focus:ring-2 focus:ring-slate-500/50 dark:text-white cursor-pointer">
              {cuentasValidas.map(c => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 dark:text-slate-300">Fecha de Inicio</label>
              <input required type="date" value={form.fecha_inicio} onChange={e => setForm({...form, fecha_inicio: e.target.value, fecha_proxima_renovacion: ''})} className="w-full p-2.5 bg-slate-100 dark:bg-neutral-800 rounded-lg outline-none focus:ring-2 focus:ring-slate-500/50 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 dark:text-slate-300">Próxima Renovación</label>
              <input required type="date" value={form.fecha_proxima_renovacion} onChange={e => setForm({...form, fecha_proxima_renovacion: e.target.value})} className="w-full p-2.5 bg-slate-100 dark:bg-neutral-800 rounded-lg outline-none focus:ring-2 focus:ring-slate-500/50 dark:text-white" />
            </div>
          </div>
          {!suscripcionAEditar && (
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="activo" checked={form.activo} onChange={e => setForm({...form, activo: e.target.checked})} className="w-4 h-4 text-slate-900 dark:text-slate-200 rounded" />
              <label htmlFor="activo" className="text-sm dark:text-slate-300 cursor-pointer">Suscripción Activa</label>
            </div>
          )}
          <button type="submit" className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 rounded-xl font-bold shadow-md active:scale-95 transition-all">
            <Save size={18} /> Guardar Suscripción
          </button>
        </form>
      </div>
    </div>
  );
}