import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Filter, X, Pencil, Trash2 } from 'lucide-react';
import { formatearMoneda } from '../utils/formatters';

export type Column = { 
  key: string; 
  label: string; 
  sortable?: boolean; 
  filterable?: boolean; 
};

type TableProps = { 
  columns: Column[]; 
  data: any[];
  // Se añadieron 'amber' y 'purple' a las opciones válidas del colorTheme
  colorTheme?: 'red' | 'emerald' | 'blue' | 'amber' | 'purple';
  categoriasDisponibles?: string[]; 
  cuentasDisponibles?: string[];
  onGlobalSearch?: (term: string) => void;
  onEdit?: (row: any) => void;   
  onDelete?: (id: string) => void; 
};

const formatearFechaLarga = (fechaStr: string) => {
  if (!fechaStr) return '';
  const [anio, mes, dia] = fechaStr.split('-');
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${parseInt(dia)} ${meses[parseInt(mes) - 1]} ${anio}`;
};

export default function TransactionTable({ columns, data, colorTheme, categoriasDisponibles, cuentasDisponibles, onGlobalSearch, onEdit, onDelete }: TableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'fecha', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onGlobalSearch) onGlobalSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, onGlobalSearch]);

  // --- DICCIONARIOS DE TEMAS ACTUALIZADOS ---
  const headerThemes = {
    red: 'bg-red-50/80 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800/50',
    emerald: 'bg-emerald-50/80 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800/50',
    blue: 'bg-blue-50/80 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/50',
    amber: 'bg-amber-50/80 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/50',
    purple: 'bg-purple-50/80 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800/50',
  };

  const rowThemes = {
    red: 'even:bg-red-50/40 dark:even:bg-red-950/20 hover:bg-red-100/60 dark:hover:bg-red-900/40',
    emerald: 'even:bg-emerald-50/40 dark:even:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40',
    blue: 'even:bg-blue-50/40 dark:even:bg-blue-950/20 hover:bg-blue-100/60 dark:hover:bg-blue-900/40',
    amber: 'even:bg-amber-50/40 dark:even:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-900/40',
    purple: 'even:bg-purple-50/40 dark:even:bg-purple-950/20 hover:bg-purple-100/60 dark:hover:bg-purple-900/40',
  };

  const footerThemes = {
    red: 'bg-red-50/60 dark:bg-red-950/30 border-t-2 border-red-100 dark:border-red-900/60 text-red-700 dark:text-red-400',
    emerald: 'bg-emerald-50/60 dark:bg-emerald-950/30 border-t-2 border-emerald-100 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400',
    blue: 'bg-blue-50/60 dark:bg-blue-950/30 border-t-2 border-blue-100 dark:border-blue-900/60 text-blue-700 dark:text-blue-400',
    amber: 'bg-amber-50/60 dark:bg-amber-950/30 border-t-2 border-amber-100 dark:border-amber-900/60 text-amber-700 dark:text-amber-400',
    purple: 'bg-purple-50/60 dark:bg-purple-950/30 border-t-2 border-purple-100 dark:border-purple-900/60 text-purple-700 dark:text-purple-400',
  };

  const headerBg = colorTheme ? headerThemes[colorTheme] : 'bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-200 dark:border-slate-700';
  const rowBg = colorTheme ? rowThemes[colorTheme] : 'even:bg-slate-50/50 dark:even:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-slate-800/50';
  const footerBg = colorTheme ? footerThemes[colorTheme] : 'bg-slate-100/80 dark:bg-slate-900/40 border-t-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white';

  const opcionesFiltro = useMemo(() => {
    const opciones: Record<string, string[]> = {};
    columns.filter(c => c.filterable).forEach(col => {
      if (col.key === 'categoria' && categoriasDisponibles) opciones[col.key] = categoriasDisponibles;
      else if (col.key === 'cuenta' && cuentasDisponibles) opciones[col.key] = cuentasDisponibles;
      else opciones[col.key] = Array.from(new Set(data.map(item => String(item[col.key])))).sort();
    });
    return opciones;
  }, [data, columns, categoriasDisponibles, cuentasDisponibles]);

  const processedData = useMemo(() => {
    let result = [...data];
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== '') result = result.filter(row => row[key] === value);
    });

    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      if (sortConfig.key === 'fecha') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, filtros, sortConfig]);

  const sumaCantidadFiltrada = useMemo(() => {
    return processedData.reduce((acc, curr) => acc + Number(curr.cantidad), 0);
  }, [processedData]);

  const totalPages = Math.max(1, Math.ceil(processedData.length / itemsPerPage));
  if (currentPage > totalPages && totalPages > 0) setCurrentPage(1); 
  
  const paginatedData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="relative w-full lg:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar en cualquier campo..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-10 py-2 bg-slate-100 dark:bg-slate-800/80 border-transparent rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-red-300 dark:focus:border-red-700 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 transition-all dark:text-white outline-none"
          />
          {searchTerm && (
            <button onClick={() => { setSearchTerm(''); setCurrentPage(1); }} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {columns.filter(c => c.filterable).map(col => (
            <div key={col.key} className="relative flex items-center w-full sm:w-auto">
              <Filter size={14} className="absolute left-3 text-slate-400" />
              <select
                value={filtros[col.key] || ''}
                onChange={(e) => { setFiltros({ ...filtros, [col.key]: e.target.value }); setCurrentPage(1); }}
                className="w-full sm:w-auto pl-8 pr-8 py-2 bg-slate-100 dark:bg-slate-800/80 border-transparent rounded-lg text-sm appearance-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 transition-all dark:text-white outline-none"
              >
                <option value="">Todas las {col.label.toLowerCase()}</option>
                {opcionesFiltro[col.key]?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 text-slate-400 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className={headerBg}>
              {columns.map((col) => (
                <th key={col.key} className={`p-4 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:text-slate-900 dark:hover:text-white' : ''}`} onClick={() => col.sortable && handleSort(col.key)}>
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortConfig.key === col.key && (sortConfig.direction === 'desc' ? <ChevronDown size={14}/> : <ChevronUp size={14}/>)}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete) && <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-right">Acciones</th>}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr key={row.id || index} className={`transition-colors ${rowBg}`}>
                  {columns.map((col) => (
                    <td key={col.key} className="p-4 text-sm text-slate-700 dark:text-slate-300">
                      {col.key === 'fecha' ? (
                        formatearFechaLarga(row[col.key])
                      ) : col.key === 'cantidad' ? (
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatearMoneda(Number(row[col.key]))} €
                        </span>
                      ) : row[col.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      {onEdit && (
                        <button onClick={() => onEdit(row)} className="p-1.5 inline-flex text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors">
                          <Pencil size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(row.id)} className="p-1.5 inline-flex text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="p-8 text-center text-slate-500 dark:text-slate-400">No se encontraron resultados</td>
              </tr>
            )}
          </tbody>

          <tfoot>
            <tr className={`font-bold ${footerBg}`}>
              {columns.map((col, index) => (
                <td key={`total-${col.key}`} className="p-4 text-sm whitespace-nowrap">
                  {col.key === 'cantidad' ? (
                    <span className="text-base font-black tracking-tight">
                      {formatearMoneda(sumaCantidadFiltrada)} €
                    </span>
                  ) : index === 0 ? (
                    <span className="uppercase text-xs font-bold tracking-wider opacity-70">Total Filtrado:</span>
                  ) : (
                    ''
                  )}
                </td>
              ))}
              {(onEdit || onDelete) && <td></td>}
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span>Filas:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-slate-100 dark:bg-slate-800/80 border-transparent rounded px-2 py-1 outline-none focus:ring-2 focus:ring-red-100 cursor-pointer"
            >
              {[10, 15, 25, 50].map(size => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>
          <div className="text-center sm:text-left hidden sm:block">
            Mostrando {paginatedData.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, processedData.length)} de {processedData.length} resultados
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft size={20} /></button>
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-md font-medium">{currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight size={20} /></button>
        </div>
      </div>
    </div>
  );
}