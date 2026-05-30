import { useState, useEffect, useMemo, useCallback } from 'react';

export function useLiquidez() {
  const [cuentas, setCuentas] = useState<any[]>([]);

  const cargarCuentas = useCallback(() => {
    fetch('/api/liquidez/saldos')
      .then(res => res.json())
      .then(data => setCuentas(data));
  }, []);

  useEffect(() => { cargarCuentas(); }, [cargarCuentas]);

  const totalCalculado = useMemo(() => cuentas.reduce((acc, c) => acc + c.saldo_calculado, 0), [cuentas]);

  return { cuentas, totalCalculado, cargarCuentas };
}