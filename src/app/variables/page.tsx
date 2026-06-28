"use client";

import { useState } from "react";
import VariableAnalyzer from "@/components/VariableAnalyzer";

export default function VariablesPage() {
  const [activeTab, setActiveTab] = useState<'concepts' | 'lab' | 'code' | 'code2'>('concepts');
  const [copied, setCopied] = useState(false);

  // El código didáctico que mostraremos
const pythonCode = `# Ejemplo básico: Determinar el tipo de dato de una sola variable

dato = 10.5  # Prueba cambiando esto por "Hola" o 5

# 1. Verificamos el tipo de dato nativo de Python
tipo = type(dato)

if tipo == str:
    print("Es Cualitativa (Texto)")

elif tipo == int:
    print("Es Cuantitativa Discreta (Número Entero)")

elif tipo == float:
    print("Es Cuantitativa Continua (Número Decimal)")
  `;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

    const rCode = `# Ejemplo básico: Determinar el tipo de dato de una sola variable

dato <- 10.5  # En R usamos <- para asignar, aunque = también funciona

# 1. Verificamos la clase del objeto
tipo <- class(dato)

if (tipo == "character") {
    print("Es Cualitativa (Texto)")
    
} else if (tipo == "integer") {
    print("Es Cuantitativa Discreta (Número Entero)")
    
} else if (tipo == "numeric") {
    print("Es Cuantitativa Continua (Número Decimal)")
}
  `;

  const handleCopyR = () => {
    navigator.clipboard.writeText(rCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-20">
      
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Variables, Datos e Información</h1>
        <p className="text-gray-500 mt-2">Fundamentos de la estadística y clasificación de datos.</p>
      </header>

      {/* Navegación de Pestañas */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('concepts')}
          className={`pb-3 px-6 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'concepts' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          📖 Conceptos Teóricos
        </button>
        <button
          onClick={() => setActiveTab('lab')}
          className={`pb-3 px-6 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'lab' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          🧪 Laboratorio Interactivo
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`pb-3 px-6 text-sm font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'code' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <span>💻</span> Código Python
        </button>
        <button
          onClick={() => setActiveTab('code2')}
          className={`pb-3 px-6 text-sm font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'code2' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <span>💻</span> Código R
        </button>
      </div>

      {/* --- PESTAÑA 1: CONCEPTOS --- */}
      {activeTab === 'concepts' && (
        <div className="space-y-8 animate-fade-in">
          {/* Definición */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-3">¿Qué es la Estadística?</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Según Anderson, Sweeney y Williams (2008), se define como "el arte y la ciencia de reunir datos, analizarlos, presentarlos e interpretarlos". Interviene en cada paso del método científico.
            </p>
          </section>

{/* Variables y Unidades */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Tarjeta 1: Unidad Muestral */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-md font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <span>🔬</span> Unidades Muestrales
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Es la entidad mínima (persona, objeto, lugar o animal) de la cual se extrae la medición o el dato.
                </p>
              </div>

              <div className="space-y-2 bg-gray-50 p-3 rounded-lg text-xs text-gray-600 border border-gray-200/60">
                <span className="block font-bold text-gray-700 uppercase tracking-wider text-[10px] mb-1">Ejemplos:</span>
                <div className="flex gap-2 items-start">
                  <span className="font-bold text-blue-600 shrink-0">1.</span>
                  <span>Un <strong>estudiante</strong> regular de la UNACH.</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="font-bold text-blue-600 shrink-0">2.</span>
                  <span>Un <strong>refrigerador médico</strong> en un Centro de Salud de Tuxtla.</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="font-bold text-blue-600 shrink-0">3.</span>
                  <span>Un <strong>árbol de Flamboyán</strong> en el Parque Marimba.</span>
                </div>
              </div>
            </section>

            {/* Tarjeta 2: Población */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-md font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <span>🌐</span> Población (N)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Es el conjunto total de <em>todas</em> las unidades muestrales que comparten una característica común.
                </p>
              </div>

              <div className="space-y-2 bg-gray-50 p-3 rounded-lg text-xs text-gray-600 border border-gray-200/60">
                <span className="block font-bold text-gray-700 uppercase tracking-wider text-[10px] mb-1">Ejemplos:</span>
                <div className="flex gap-2 items-start">
                  <span className="font-bold text-green-600 shrink-0">1.</span>
                  <span>El total de los <strong>30,000 alumnos</strong> inscritos en la UNACH.</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="font-bold text-green-600 shrink-0">2.</span>
                  <span>La red completa de <strong>refrigeradores médicos</strong> de la Secretaría de Salud en Chiapas.</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="font-bold text-green-600 shrink-0">3.</span>
                  <span>El inventario total de <strong>árboles</strong> dentro del Parque Marimba.</span>
                </div>
              </div>
            </section>

          </div>

          {/* Clasificación Detallada */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Clasificación de Variables y Escalas</h2>
            <div className="space-y-6">
              {/* Cualitativas */}
              <div className="border-l-4 border-purple-400 pl-4">
                <h3 className="text-purple-700 font-bold">Cualitativas (Categóricas)</h3>
                <p className="text-sm text-gray-600 mt-1">Utilizan etiquetas o nombres para identificar atributos. No tienen sentido aritmético.</p>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <strong className="block text-xs text-purple-800 uppercase mb-1">Nominal</strong>
                    <p className="text-xs text-gray-600">Sin jerarquía. <br/>Ej: Nacionalidad, Tipo de Sangre.</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <strong className="block text-xs text-purple-800 uppercase mb-1">Ordinal</strong>
                    <p className="text-xs text-gray-600">Con jerarquía. <br/>Ej: Nivel socioeconómico, Nivel de dolor.</p>
                  </div>
                </div>
              </div>

              {/* Cuantitativas */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-green-700 font-bold">Cuantitativas (Numéricas)</h3>
                <p className="text-sm text-gray-600 mt-1">Valores numéricos donde las operaciones aritméticas son aplicables.</p>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <strong className="block text-xs text-green-800 uppercase mb-1">Discretas</strong>
                    <p className="text-xs text-gray-600">Valores finitos/enteros. <br/>Ej: Número de hijos.</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <strong className="block text-xs text-green-800 uppercase mb-1">Continuas</strong>
                    <p className="text-xs text-gray-600">Infinitos valores en intervalo. <br/>Ej: Temperatura, Lluvia.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* --- PESTAÑA 2: LABORATORIO --- */}
      {activeTab === 'lab' && (
        <section className="animate-fade-in">
           <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-8">
             <h2 className="text-blue-900 font-bold flex items-center gap-2">
               <span className="text-xl">🧪</span> Práctica de Clasificación
             </h2>
             <p className="text-blue-800 text-sm mt-2">
               Utiliza este espacio!!!!! para ingresar datos brutos. El sistema determinará automáticamente si tu variable es cualitativa o cuantitativa.
             </p>
           </div>
           
           <div className="bg-white p-8 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100">
              <VariableAnalyzer />
           </div>
        </section>
      )}

      {/* --- PESTAÑA 3: CÓDIGO (NUEVA) --- */}
      {activeTab === 'code' && (
        <section className="animate-fade-in max-w-4xl mx-auto">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            {/* Barra superior estilo editor */}
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-3 text-gray-400 font-mono text-sm">analisis_variable.py</span>
              </div>
              <button 
                onClick={handleCopy}
                className="text-xs font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Copiado
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Copiar
                  </>
                )}
              </button>
            </div>
            
            {/* Área de código */}
            <div className="p-6 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed text-gray-300">
                <code>
                  {pythonCode}
                </code>
              </pre>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-bold text-blue-900 text-sm">Explicación paso a paso</h4>
              
              <div className="text-blue-800 text-xs mt-1">
                En programación, los datos ya tienen una clasificación interna similar a la estadística:
                <ul className="list-disc pl-4 mt-2 space-y-1">
                  <li><strong>str (String):</strong> Son cadenas de texto, equivalentes a variables <strong>Cualitativas</strong>.</li>
                  <li><strong>int (Integer):</strong> Son números enteros, equivalentes a <strong>Discretas</strong>.</li>
                  <li><strong>float (Flotante):</strong> Son números con punto decimal, equivalentes a <strong>Continuas</strong>.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- PESTAÑA 4: CÓDIGO R --- */}
      {activeTab === 'code2' && (
        <section className="animate-fade-in max-w-4xl mx-auto">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            {/* Barra superior estilo editor */}
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-3 text-gray-400 font-mono text-sm">analisis_variable.R</span>
              </div>
              <button 
                onClick={handleCopyR}
                className="text-xs font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Copiado
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Copiar
                  </>
                )}
              </button>
            </div>
            
            {/* Área de código */}
            <div className="p-6 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed text-gray-300">
                <code>
                  {rCode}
                </code>
              </pre>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-bold text-blue-900 text-sm">Explicación paso a paso</h4>
              
              <div className="text-blue-800 text-xs mt-1">
                En R, la clasificación de datos es similar a Python:
                <ul className="list-disc pl-4 mt-2 space-y-1">
                  <li><strong>character:</strong> Son cadenas de texto, equivalentes a variables <strong>Cualitativas</strong>.</li>
                  <li><strong>integer:</strong> Son números enteros, equivalentes a <strong>Discretas</strong>.</li>
                  <li><strong>numeric:</strong> Son números con punto decimal, equivalentes a <strong>Continuas</strong>.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}