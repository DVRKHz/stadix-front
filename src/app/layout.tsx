import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar"; // Importamos el menú
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "STADIX: Estadística Didáctica",
  description: "Plataforma educativa de análisis estadístico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} flex h-screen bg-gray-50 overflow-hidden`}>
        
        {/* 1. BARRA LATERAL (Izquierda, altura completa) */}
        <Sidebar />
        
        {/* 2. CONTENEDOR DERECHO (Columna: Header + Contenido) */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          
          {/* A. El Header Institucional (Fijo arriba) */}
          <Header />
          
          {/* B. El Contenido Principal (Scrollable) */}
          <main className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
            <div className="max-w-6xl mx-auto pb-20">
              {children}
            </div>
          </main>

        </div>

      </body>
    </html>
  );
}