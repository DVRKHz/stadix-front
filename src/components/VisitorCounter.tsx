'use client';

import React from 'react';

export default function VisitorCounter() {
  // Tu dominio de Vercel
  const productionUrl = 'https://stadix-unach.vercel.app';

  // Codificamos la URL completa para que el servidor de la API la lea sin problemas
  const badgeUrl = `https://visitor-badge.laobi.icu/badge?page_id=${encodeURIComponent(
    productionUrl
  )}&left_color=gray&right_color=indigo`;

  return (
    <div className="flex items-center justify-center opacity-75 hover:opacity-100 transition-opacity duration-200">
      <img 
        src={badgeUrl} 
        alt="Contador de visitas" 
        className="h-5 rounded shadow-sm"
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.src = `https://img.shields.io/badge/visitas-online-indigo?style=flat`;
        }}
      />
    </div>
  );
}