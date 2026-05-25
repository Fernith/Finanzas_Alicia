import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightLeft, Plus, ChevronLeft, Wallet } from 'lucide-react';
import { PieChart, Pie, ResponsiveContainer, Tooltip } from 'recharts';
import TransactionTable, { type Column } from '../components/TransactionTable';
import ModalConfirmacion from '../components/ModalConfirmacion';
import ModalAgregarInversion from '../components/ModalAgregarInversion';
import { formatearMoneda } from '../utils/formatters';

export default function Inversiones() {
  const [inversiones, setInversiones] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [inversionAEditar, setInversionAEditar] = useState<any>(null);
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);

  const cargarInversiones = () => {
    fetch('http://localhost:3000/api/inversiones')
      .then(res => res.json())
      .then(data => setInversiones(data))
      .catch(() => setInversiones([]));
  };

  useEffect(() => { cargarInversiones(); }, []);

  const { datosGrafico, totalInvertido } = useMemo(() => {
    const agrupado: Record<string, { valor: number, color: string }> = {};
    let total = 0;

    inversiones.forEach(inv => {
      const cantidad = Number(inv.cantidad);
      total += cantidad;
      if (!agrupado[inv.categoria]) agrupado[inv.categoria] = { valor: 0, color: inv.color };
      agrupado[inv.categoria].valor += cantidad;
    });

    const datos = Object.entries(agrupado)
      .map(([name, data]) => ({ name, value: data.valor, color: data.color, fill: data.color }))
      .sort((a, b) => b.value - a.value);

    return { datosGrafico: datos, totalInvertido: total };
  }, [inversiones]);

  const columns: Column[] = [
    { key: 'fecha', label: 'FECHA', sortable: true },
    { key: 'cantidad', label: 'CANTIDAD', sortable: true },
    { key: 'categoria', label: 'CATEGORÍA', sortable: true, filterable: true },
    { key: 'cuenta', label: 'CUENTA', sortable: true, filterable: true },
    { key: 'notas', label: 'DESCRIPCIÓN', sortable: false }
  ];

  const confirmarEliminacion = async () => {
    if (!idAEliminar) return;
    try {
      const res = await fetch(`http://localhost:3000/api/inversiones/${idAEliminar}`, { method: 'DELETE' });
      if (res.ok) cargarInversiones();
      else alert('No se pudo eliminar la inversión.');
    } catch { alert('Error de conexión.'); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-[1600px] mx-auto">
      
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <Link to="/ahorros" className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/40 dark:to-orange-900/20 rounded-2xl shadow-sm border border-amber-200/50 dark:border-amber-800/50">
          <ArrowRightLeft className="text-amber-600 dark:text-amber-400" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Capital Invertido</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Controla y analiza tus inversiones</p>
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-center gap-6 transition-all duration-300">
        <div className="p-4 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-xl">
          <Wallet size={40} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Invertido</p>
          <p className="text-4xl sm:text-6xl font-black text-amber-600 dark:text-amber-500">{formatearMoneda(totalInvertido)} €</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Listado de Transacciones</h2>
            <button 
              onClick={() => { setInversionAEditar(null); setModalAbierto(true); }} 
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Plus size={16} /> Agregar Inversión
            </button>
          </div>
          
          <TransactionTable 
            columns={columns} 
            data={inversiones} 
            colorTheme="amber" 
            onEdit={(inv) => { setInversionAEditar(inv); setModalAbierto(true); }}
            onDelete={(id) => setIdAEliminar(id)}
          />
        </div>

        <div className="xl:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm sticky top-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Resumen por Categoría</h2>
          
          <div className="h-64 w-full">
            {datosGrafico.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={datosGrafico} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none" label={({ percent }: any) => percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ''} />
                  <Tooltip formatter={(value: any) => `${formatearMoneda(Number(value))} €`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Sin datos para graficar</div>
            )}
          </div>

          <div className="mt-6 space-y-3 max-h-64 overflow-y-auto pr-2">
            {datosGrafico.map(item => (
              <div key={item.name} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shadow-inner shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap pl-4">{formatearMoneda(item.value)} €</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ModalAgregarInversion isOpen={modalAbierto} onClose={() => { setModalAbierto(false); setInversionAEditar(null); }} onSuccess={cargarInversiones} inversionAEditar={inversionAEditar} />
      <ModalConfirmacion isOpen={!!idAEliminar} onClose={() => setIdAEliminar(null)} onConfirm={confirmarEliminacion} mensaje="¿Estás seguro de que deseas eliminar este registro de inversión permanentemente?" />
    </div>
  );
}