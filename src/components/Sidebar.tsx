"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";


const menuStructure = [
  {
    title: "INICIO",
    path: "/",
    icon: "🏠"
  },
  {
    title: "Variables y Datos",
    path: "/variables",
    icon: "🔍"
  },
  {
    title: "Organización de Datos",
    path: "/organizacion",
    icon: "📊",
  },
  {
    title: "Estadística Descriptiva",
    path: "/descriptive",
    icon: "∑",
  },
  {
    title: "Estadística Inferencial",
    path: "/inferencial",
    icon: "🔮",
    submenu: [
      { title: "Pruebas Hipótesis", path: "/inferencial/pruebas" }
    ]
  },
  {
    title: "Probabilidad",
    path: "/probabilidad",
    icon: "🎲"
  },
  {
    title: "Muestreo",
    path: "/muestreo",
    icon: "🎯"
  },
  {
    title: "No Paramétrica",
    path: "/no-parametrica",
    icon: "≠"
  },
  {
    title: "Manual de Usuario",
    path: "/manual",
    icon: "📖"
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  // Función para abrir la ventana flotante de manera segura en Next.js (Client Component)
  const openPopup = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();

    const width = 800;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      path,
      "ManualUsuario",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  }

  return (
    <aside className={`relative bg-white border-r border-gray-200 h-screen flex-shrink-0 transition-all duration-300 ${isOpen ? "w-72" : "w-20"}`}>
      
      {/* Botón Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-6 bg-blue-600 text-white rounded-full p-1 shadow-md z-50 hover:bg-blue-700"
      >
        {isOpen ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        )}
      </button>

      {/* Header con LOGO PRINCIPAL */}
      <div className="h-20 flex items-center justify-center border-b border-gray-100 relative">
        {isOpen ? (
          <div className="relative w-40 h-12">
            <Image 
              src="/stadix_logohorizontal.png" 
              alt="Logo Estadística" 
              fill 
              className="object-contain"
              priority
            />
          </div>
        ) : (
          <div className="relative w-10 h-10">
            <Image 
              src="/STADIX_logo.png" 
              alt="Icono" 
              fill 
              className="object-contain" 
            />
          </div>
        )}
      </div>

      <nav className="p-4 overflow-y-auto h-[calc(100vh-160px)]">
        <ul className="space-y-1">
          {menuStructure.map((item, index) => {
            const isActiveMain = pathname.startsWith(item.path);
            const isManual = item.path === "/manual";

            return (
              <li key={index} className="mb-2">
                <Link
                  href={item.path}
                  // Si es el manual, ejecutamos la función popup al hacer click
                  onClick={(e) => isManual && openPopup(e, item.path)}
                  className={`
                    flex items-center px-3 py-2.5 rounded-lg transition-colors font-medium
                    ${isActiveMain ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}
                    ${isOpen ? "justify-start" : "justify-center"}
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {isOpen && <span className="ml-3 text-sm truncate">{item.title}</span>}
                  </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Navegación con Scroll */}
      
      <nav className="p-4 overflow-y-auto h-[calc(100vh-160px)]">
        <ul className="space-y-1">
          {menuStructure.map((item, index) => {
            const isActiveMain = pathname.startsWith(item.path);
            
            return (
              <li key={index} className="mb-2">
                <Link
                  href={item.path}
                  className={`
                    flex items-center px-3 py-2.5 rounded-lg transition-colors font-medium
                    ${isActiveMain ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}
                    ${isOpen ? "justify-start" : "justify-center"}
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  {isOpen && <span className="ml-3 text-sm truncate">{item.title}</span>}
                </Link>

                {isOpen && item.submenu && (
                  <ul className="mt-1 ml-9 space-y-1 border-l-2 border-gray-100 pl-2">
                    {item.submenu.map((sub, subIndex) => {
                       const isActiveSub = pathname === sub.path;
                       return (
                        <li key={subIndex}>
                          <Link 
                            href={sub.path}
                            className={`block px-2 py-1.5 text-xs rounded transition-colors ${isActiveSub ? "text-blue-600 font-bold bg-blue-50/50" : "text-gray-500 hover:text-gray-800"}`}
                          >
                            {sub.title}
                          </Link>
                        </li>
                       )
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer con LOGOS INSTITUCIONALES (UNACH y CEDES) */}
      <div className="absolute bottom-0 w-full border-t border-gray-100 bg-gray-50 flex items-center justify-center h-20 px-2">
        {isOpen ? (
          /* Versión Expandida: Ajuste de proporciones para compensar tamaños visuales */
          <div className="flex items-center justify-between w-full h-14 px-1 gap-1">
            
            {/* Contenedor UNACH (42% del ancho disponible) */}
            <div className="relative w-[42%] h-full opacity-90 hover:opacity-100 transition-opacity">
              <Image 
                src="/Logo_de_la_UNACH.svg.png" 
                alt="Logo UNACH" 
                fill 
                sizes="(max-width: 768px) 100px, 150px"
                className="object-contain"
              />
            </div>
            
            {/* Separador */}
            <div className="h-8 w-[1px] bg-gray-200 flex-shrink-0" /> 
            
            {/* Contenedor CEDES (53% del ancho disponible para compensar sus márgenes internos) */}
            <div className="relative w-[53%] h-full opacity-90 hover:opacity-100 transition-opacity">
              <Image 
                src="/logo-cedes.png" 
                alt="Logo CEDES" 
                fill 
                sizes="(max-width: 768px) 120px, 170px"
                className="object-contain"
              />
            </div>
          </div>
        ) : (
          /* Versión Colapsada: Logos ligeramente más grandes que antes (w-7 h-7) */
          <div className="flex flex-col items-center justify-center gap-1.5 py-1">
            <div className="relative w-7 h-7 opacity-90">
              <Image 
                src="/Logo_de_la_UNACH.svg.png" 
                alt="Mini Logo UNACH" 
                fill 
                sizes="28px"
                className="object-contain"
              />
            </div>
            <div className="relative w-7 h-7 opacity-90">
              <Image 
                src="/logo-cedes.png" 
                alt="Mini Logo CEDES" 
                fill 
                sizes="28px"
                className="object-contain"
              />
            </div>
          </div>
        )}
      </div>

    </aside>
  );
}