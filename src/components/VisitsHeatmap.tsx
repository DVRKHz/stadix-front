'use client';

import React, { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import 'react-tooltip/dist/react-tooltip.css';

interface HeatmapValue {
  date: string;
  count: number;
}

export default function VisitsHeatmap() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [visitsData, setVisitsData] = useState<HeatmapValue[]>([]);
  const [totalVisits, setTotalVisits] = useState<number>(0);

  const availableYears = [2026]; // Solo el año actual por ahora, pero se puede expandir fácilmente en el futuro

  const startDate = new Date(`${selectedYear - 1}-12-31`);
  const endDate = new Date(`${selectedYear}-12-31`);

// Definimos explícitamente una tupla mutable de exactamente 12 elementos de tipo string
const mesesEnEspanol: [string, string, string, string, string, string, string, string, string, string, string, string] = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

  useEffect(() => {
    const storedHistory = localStorage.getItem('stadix_analytics_history');
    let history: HeatmapValue[] = storedHistory ? JSON.parse(storedHistory) : [];

    const lastVisitDate = localStorage.getItem('stadix_last_session_date');
    const todayStr = new Date().toLocaleDateString('sv-SE');

    if (lastVisitDate !== todayStr) {
      const todayRecord = history.find((record) => record.date === todayStr);

      if (todayRecord) {
        if (todayRecord.count < 5) todayRecord.count += 1;
      } else {
        history.push({ date: todayStr, count: 1 });
      }

      localStorage.setItem('stadix_analytics_history', JSON.stringify(history));
      localStorage.setItem('stadix_last_session_date', todayStr);
    }

    const totalCalculated = history.reduce((sum, item) => sum + item.count, 0);
    const baseVisits = 13; 
    setTotalVisits(totalCalculated > 0 ? totalCalculated + baseVisits : baseVisits);

    const filteredData = history.filter((record) => record.date.startsWith(`${selectedYear}-`));
    setVisitsData(filteredData);

    window.dispatchEvent(new CustomEvent('stadix_stats_updated', { 
      detail: { total: totalCalculated > 0 ? totalCalculated + baseVisits : baseVisits } 
    }));

  }, [selectedYear]);

  const getClassForValue = (value: any) => {
    if (!value || value.count === 0) return 'color-empty';
    if (value.count === 1) return 'color-scale-1';
    if (value.count === 2) return 'color-scale-2';
    if (value.count === 3) return 'color-scale-3';
    return 'color-scale-4';
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-5xl mx-auto my-10 shadow-sm w-full">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: Mapa de Calor */}
        <div className="flex-1 w-full">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>📅</span> Historial de Visitas Diarias
          </h3>

          <div className="heatmap-container root-heatmap w-full min-h-[130px] overflow-x-auto">
            <CalendarHeatmap
              startDate={startDate}
              endDate={endDate}
              values={visitsData}
              classForValue={getClassForValue}
              monthLabels={mesesEnEspanol} // 👈 TRADUCCIÓN INMEDIATA Y NATIVA AQUÍ
              titleForValue={(value: any) => 
                value && value.date ? `${value.count} visitas el ${value.date}` : 'Sin visitas'
              }
              tooltipDataAttrs={(value: any): any => {
                return {
                  'data-tooltip-id': 'heatmap-tooltip',
                  'data-tooltip-content': value && value.date 
                    ? `${value.count} visitas el ${value.date}`
                    : 'Sin visitas',
                };
              }}
            />
            <Tooltip id="heatmap-tooltip" />
          </div>

          {/* Leyenda */}
          <div className="flex items-center justify-end gap-1 text-xs font-medium text-slate-600 mt-4">
            <span>Menos</span>
            <div className="w-3 h-3 rounded-sm bg-slate-200"></div>
            <div className="w-3 h-3 rounded-sm bg-indigo-100"></div>
            <div className="w-3 h-3 rounded-sm bg-indigo-300"></div>
            <div className="w-3 h-3 rounded-sm bg-indigo-500"></div>
            <div className="w-3 h-3 rounded-sm bg-indigo-700"></div>
            <span>Más</span>
          </div>
        </div>

        {/* COLUMNA DERECHA: Selector de Años */}
        <div className="flex flex-row md:flex-col gap-1 w-full md:w-28 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-4">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                selectedYear === year
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Año {year}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}