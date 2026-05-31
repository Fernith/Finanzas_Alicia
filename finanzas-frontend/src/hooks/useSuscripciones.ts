import { useState, useEffect, useCallback } from 'react';

export function useSuscripciones() {
  const [suscripciones, setSuscripciones] = useState<any[]>([]);

  const cargarSuscripciones = useCallback(() => {
    fetch('/api/suscripciones').then(res => res.json()).then(data => setSuscripciones(data));
  }, []);

  useEffect(() => { cargarSuscripciones(); }, [cargarSuscripciones]);

  const eliminarSuscripcion = async (id: string) => {
    if (await fetch(`/api/suscripciones/${id}`, { method: 'DELETE' }).then(res => res.ok)) {
      cargarSuscripciones();
    }
  };

  const procesarTotales = () => {
    let gastoMensual = 0;
    let gastoAnual = 0;
    suscripciones.filter(s => s.activo).forEach(s => {
      let m = 0, a = 0;
      if (s.periodicidad === 'MENSUAL') { m = Number(s.cantidad); a = m * 12; }
      else if (s.periodicidad === 'ANUAL') { a = Number(s.cantidad); m = a / 12; }
      else if (s.periodicidad === '30_DIAS') { m = Number(s.cantidad) * (365/30)/12; a = Number(s.cantidad) * (365/30); }
      gastoMensual += m; gastoAnual += a;
    });
    return { gastoMensual, gastoAnual };
  };

  return { suscripciones, cargarSuscripciones, eliminarSuscripcion, procesarTotales };
}