import { useState, useEffect, useCallback } from 'react';
import type { Transaction } from '../types';

export function useTransacciones(tipo: 'GASTO' | 'INGRESO', month: number, year: number) {
  const [transaccionesAnuales, setTransaccionesAnuales] = useState<Transaction[]>([]);
  const [transacciones, setTransacciones] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransacciones = useCallback(async (searchTerm = '') => {
    setLoading(true);
    try {
      const url = `/api/${tipo.toLowerCase()}s?mes=0&anio=${year}&buscar=${encodeURIComponent(searchTerm)}`;
      const res = await fetch(url);
      const data = await res.json();
      
      setTransaccionesAnuales(data);
      
      if (searchTerm) {
        setTransacciones(data);
      } else {
        setTransacciones(data.filter((t: Transaction) => parseInt(t.fecha.split('-')[1]) === month));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [tipo, month, year]);

  useEffect(() => {
    fetchTransacciones();
  }, [fetchTransacciones]);

  // Añadimos el searchTerm para no perder la vista si el usuario estaba buscando algo
  const togglePendiente = async (id: string, searchTerm: string = '') => {
    try {
      // Intentamos con PUT primero (fallback a PATCH por si tu axum router lo exige)
      let res = await fetch(`/api/${tipo.toLowerCase()}s/${id}/completar`, { method: 'PUT' });
      
      if (!res.ok && res.status === 405) {
        res = await fetch(`/api/${tipo.toLowerCase()}s/${id}/completar`, { method: 'PATCH' });
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Error interno del servidor al actualizar');
      }

      fetchTransacciones(searchTerm);
    } catch (e: any) { 
      console.error('Error al activar operación:', e); 
      alert(`No se pudo completar la operación. \nDetalle: ${e.message}`);
    }
  };

  const eliminarTransaccion = async (id: string, searchTerm: string = '') => {
    try {
      const res = await fetch(`/api/${tipo.toLowerCase()}s/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Fallo al eliminar en el servidor');
      
      fetchTransacciones(searchTerm);
    } catch (e: any) { 
      console.error('Error al eliminar:', e); 
      alert(`No se pudo eliminar la operación. \nDetalle: ${e.message}`);
    }
  };

  return { transaccionesAnuales, transacciones, loading, fetchTransacciones, togglePendiente, eliminarTransaccion };
}