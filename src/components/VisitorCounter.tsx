'use client';

import React, { useState, useEffect } from 'react';

export default function VisitorCounter() {
  const [count, setCount] = useState<number>(0); // Inicialización con las visitas actuales de base

  useEffect(() => {
    // 1. Intentar leer el total calculado inicial del historial acumulado
    const storedHistory = localStorage.getItem('stadix_analytics_history');
    if (storedHistory) {
      const history = JSON.parse(storedHistory);
      const totalCalculated = history.reduce((sum: number, item: any) => sum + item.count, 0);
      if (totalCalculated > 0) {
        setCount(totalCalculated + 0);
      }
    }

    // 2. Escuchar las actualizaciones del mapa de calor en tiempo real
    const handleStatsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.total) {
        setCount(customEvent.detail.total);
      }
    };

    window.addEventListener('stadix_stats_updated', handleStatsUpdate);
    return () => {
      window.removeEventListener('stadix_stats_updated', handleStatsUpdate);
    };
  }, []);

  return (
    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md shadow-sm transition-all duration-300 hover:border-slate-300">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      <span className="text-xs font-semibold text-slate-600">visitas</span>
      <span className="text-xs font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded-sm min-w-[20px] text-center">
        {count}
      </span>
    </div>
  );
}