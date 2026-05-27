import { useState, useEffect } from 'react';
import { Menu, X, Settings, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom'; // NUEVO: Importamos Link

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modoOscuro, setModoOscuro] = useState(true);

  useEffect(() => {
    if (modoOscuro) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [modoOscuro]);

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-colors duration-300 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center">
            {/* BOTONES PC */}
            <div className="hidden md:flex space-x-1">
              <Link to="/balance" className="px-4 py-2 rounded-lg font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 active:scale-95 transition-all duration-150">
                Balance
              </Link>
              <Link to="/gastos" className="px-4 py-2 rounded-lg font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-95 transition-all duration-150">
                Gastos
              </Link>
              <Link to="/ingresos" className="px-4 py-2 rounded-lg font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 active:scale-95 transition-all duration-150">
                Ingresos
              </Link>
              <Link to="/ahorros" className="px-4 py-2 rounded-lg font-semibold text-amber-500 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 active:scale-95 transition-all duration-150">
                Ahorros
              </Link>
            </div>
            
            <div className="md:hidden flex items-center">
              <button onClick={() => setMenuAbierto(!menuAbierto)} className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:outline-none p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all">
                {menuAbierto ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center pointer-events-none">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Mis <span className="text-slate-500 dark:text-slate-400">Finanzas</span>
            </h1>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <button onClick={() => setModoOscuro(!modoOscuro)} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 active:scale-90 transition-all duration-150 focus:outline-none">
              {modoOscuro ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/ajustes" className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="Ajustes generales">
              <Settings size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL (Con cierre automático al hacer clic en un enlace) */}
      {menuAbierto && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-1 absolute w-full shadow-lg">
          <Link to="/balance" onClick={() => setMenuAbierto(false)} className="block w-full text-left px-4 py-3 rounded-lg font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all">
            Balance
          </Link>
          <Link to="/gastos" onClick={() => setMenuAbierto(false)} className="block w-full text-left px-4 py-3 rounded-lg font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all">
            Gastos
          </Link>
          <Link to="/ingresos" onClick={() => setMenuAbierto(false)} className="block w-full text-left px-4 py-3 rounded-lg font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all">
            Ingresos
          </Link>
          <Link to="/ahorros" onClick={() => setMenuAbierto(false)} className="block w-full text-left px-4 py-3 rounded-lg font-semibold text-amber-500 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all">
            Ahorros
          </Link>
        </div>
      )}
    </nav>
  );
}