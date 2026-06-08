'use client';

import React from 'react';

export default function VisitorCounter() {
  // Tu dominio oficial de producción en Vercel
  const productionUrl = 'https://stadix-unach.vercel.app';
  
  const badgeTitle = 'visitas';
  const titleColor = '1f2937'; // gray-800
  const countColor = '4f46e5'; // indigo-600

  // Codificamos la URL completa de forma segura para la API de HITS
  const badgeUrl = `https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=${encodeURIComponent(
    productionUrl
  )}&count_bg=%23${countColor}&title_bg=%23${titleColor}&title=${badgeTitle}&edge_flat=false`;

  return (
    <div className="flex items-center justify-center opacity-75 hover:opacity-100 transition-opacity duration-200">
      <a href="https://hits.seeyoufarm.com" target="_blank" rel="noopener noreferrer">
        <img 
          src={badgeUrl} 
          alt="Contador de visitas" 
          className="h-5 rounded shadow-sm"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = `https://img.shields.io/badge/visitas-dynamic-indigo?style=flat`;
          }}
        />
      </a>
    </div>
  );
}