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

      {/* 3. LADO DERECHO: Botón de Documentación */}
      <div className="flex items-center">
        <button
          onClick={() => {
            const width = 800;
            const height = 900;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;

            window.open(
              "/aquipondreelmanualdeusuario.pdf",
              "ManualStadix",
              `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
            );
          }}
          className="flex items-center gap-2 bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-blue-500 hover:text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-md shadow-sm transition-all duration-200"
        >
          <svg 
            className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Ver Manual
        </button>
      </div>
      
    </header>
  );
}