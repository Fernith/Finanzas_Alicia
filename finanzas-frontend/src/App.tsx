import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/general/Navbar';
import Gastos from './pages/Gastos';
import Ingresos from './pages/Ingresos';
import Ajustes from './pages/Ajustes';
import Balance from './pages/Balance';
import Ahorros from './pages/Ahorros';
import Inversiones from './pages/Inversiones';
import Liquidez from './pages/Liquidez';

function App() {
  return (
    // Router envuelve toda la app para habilitar la navegación
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Navbar />
        
        {/* Aquí eliminamos el max-w-md que aplastaba todo y usamos w-full para que ocupe lo necesario */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/balance" replace />} />
            <Route path="/balance" element={<Balance />} />
            <Route path="/gastos" element={<Gastos />} />
            <Route path="/ingresos" element={<Ingresos />} />
            <Route path="/ahorros" element={<Ahorros />} />
            <Route path="/ingresos" element={<Ingresos />} />
            <Route path="/ajustes" element={<Ajustes />} />
            <Route path="/ahorros/inversiones" element={<Inversiones />} />
            <Route path="/ahorros/liquidez" element={<Liquidez />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;