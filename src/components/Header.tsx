"use client";

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between flex-shrink-0 z-10 relative shadow-sm">
      
      {/* 1. LADO IZQUIERDO: Título Principal */}
      <div className="flex items-center gap-3">
        {/* Línea decorativa dorada/azul (color institucional UNACH) */}
        <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
        
        <h2 className="text-lg font-bold text-gray-800 tracking-wide uppercase font-serif">
          Sistema de Aprendizaje Estadístico <span className="text-blue-600 mx-1">-</span>  STADIX
        </h2>
      </div>

      {/* 2. CENTRO: Texto Institucional (Ahora más notorio) */}
      <div className="hidden md:block text-sm font-bold text-600 tracking-wide">
        Benemérita Universidad Autónoma de Chiapas
      </div>
    </header>
  );
}