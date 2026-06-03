import { useState, useEffect, useCallback } from 'react';

export function useAjustes() {
  const [grupos, setGrupos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [cuentas, setCuentas] = useState<any[]>([]);

  const cargarGrupos = useCallback(() => { fetch('/api/ajustes/grupos').then(res => res.json()).then(data => setGrupos(data)); }, []);
  const cargarCategorias = useCallback(() => { fetch('/api/ajustes/categorias').then(res => res.json()).then(data => setCategorias(data)); }, []);
  const cargarCuentas = useCallback(() => { fetch('/api/ajustes/cuentas').then(res => res.json()).then(data => setCuentas(data)); }, []);

  useEffect(() => { cargarGrupos(); cargarCategorias(); cargarCuentas(); }, [cargarGrupos, cargarCategorias, cargarCuentas]);

  const ejecutarAccionEstado = async (target: 'grupos' | 'categorias' | 'cuentas', id: string, tipo: 'activar' | 'desactivar') => {
    const url = tipo === 'desactivar' ? `/api/ajustes/${target}/${id}` : `/api/ajustes/${target}/${id}/activar`;
    try {
      const res = await fetch(url, { method: tipo === 'desactivar' ? 'DELETE' : 'PUT' });
      if (res.ok) {
        if (target === 'grupos') cargarGrupos();
        if (target === 'categorias') cargarCategorias();
        if (target === 'cuentas') cargarCuentas();
        return true;
      }
      return false;
    } catch { return false; }
  };

  return { grupos, setGrupos, cargarGrupos, categorias, setCategorias, cuentas, setCuentas, cargarCategorias, cargarCuentas, ejecutarAccionEstado };
}