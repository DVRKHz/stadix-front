"use client";

import { useState } from "react";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Line, ComposedChart 
} from 'recharts';

import { API_URL } from '@/config/api';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { RegressionPDF } from '@/components/reports/RegressionPDF';
import { toPng } from 'html-to-image';
import { useRef } from 'react';

export default function InferencialPage() {
  const [activeTab, setActiveTab] = useState<'concepts' | 'lab' | 'code' | 'code2' | 'pdf'>('concepts');
  const [inputX, setInputX] = useState("");
  const [inputY, setInputY] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const [inputMode, setInputMode] = useState<'manual' | 'file'>('manual');

  const resultsRef = useRef<HTMLDivElement>(null); // Referencia al contenedor de resultados
  const [reportImage, setReportImage] = useState<string>("");
  const [preparingPdf, setPreparingPdf] = useState(false);

  const prepareReport = async () => {
    if (resultsRef.current === null) return;
    setPreparingPdf(true);
    try {
        const dataUrl = await toPng(resultsRef.current, { 
            cacheBust: true, 
            backgroundColor: '#ffffff',
            fontEmbedCSS: '', // IMPORTANTE: Fix para Next.js fonts
        });
        setReportImage(dataUrl);
    } catch (err) {
        console.error("Error capturando imagen", err);
    } finally {
        setPreparingPdf(false);
    }
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError("");
    
    // Parsear datos
    const xData = inputX.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n));
    const yData = inputY.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n));

    if (xData.length !== yData.length) {
        setError(`Error: Las listas tienen tamaños distintos. X tiene ${xData.length} datos, Y tiene ${yData.length}.`);
        setLoading(false);
        return;
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/inference/regression`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x_data: xData, y_data: yData })
      });
      
      if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Error en el servidor");
      }
      
      setResult({ ...await res.json(), rawX: xData, rawY: yData });
    } catch (e: any) { 
        setError(e.message); 
    } finally { 
        setLoading(false); 
    }
  };

  // Preparar datos para el gráfico
  const chartData = result ? result.rawX.map((x: number, i: number) => ({ x, y: result.rawY[i] })) : [];

  const n = chartData.length;
  const sumX = chartData.reduce((acc: number, val: any) => acc + val.x, 0);
  const sumY = chartData.reduce((acc: number, val: any) => acc + val.y, 0);
  const sumXY = chartData.reduce((acc: number, val: any) => acc + (val.x * val.y), 0);
  const sumX2 = chartData.reduce((acc: number, val: any) => acc + (val.x * val.x), 0);

  const m = (n * sumXY - sumX * sumY) / (n * sumX2 -sumX * sumX);
  const b = (sumY - m * sumX) / n;

  const minX = Math.min(...chartData.map((d: { x: number }) => d.x));
  const maxX = Math.max(...chartData.map((d: { x: number }) => d.x));

  const trendLineData = [
    { x: minX, y: m * minX + b },
    { x: maxX, y: m * maxX + b }
  ];

  const pythonCode = `# Regresión Lineal con Scipy
from scipy import stats
import numpy as np

# Datos de dos variables
x = [1, 2, 3, 4, 5]
y = [2, 4, 5, 4, 5]

# Calcular regresión (y = mx + b)
# linregress devuelve: pendiente, intercepto, r, p-value, error
slope, intercept, r, p, std_err = stats.linregress(x, y)

print(f"Ecuación: y = {slope:.2f}x + {intercept:.2f}")
print(f"Correlación (r): {r:.4f}")`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rCode = `# Regresión Lineal con R

# Datos de dos variables (Vectores)
x <- c(1, 2, 3, 4, 5)
y <- c(2, 4, 5, 4, 5)

# Calcular regresión (y ~ x significa "y en función de x")
# lm significa "Linear Model"
modelo <- lm(y ~ x)

# Extraer valores específicos
slope     <- coef(modelo)[2]    # Pendiente (m)
intercept <- coef(modelo)[1]    # Intercepto (b)
r         <- cor(x, y)          # Correlación de Pearson

# Imprimir resultados con formato
cat(sprintf("Ecuación: y = %.2fx + %.2f\n", slope, intercept))
cat(sprintf("Correlación (r): %.4f\n", r))`;

  const handleCopyR = () => {
    navigator.clipboard.writeText(rCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Estadística Inferencial</h1>
        <p className="text-gray-500 mt-2">Buscando relaciones y haciendo predicciones.</p>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button onClick={() => setActiveTab('concepts')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'concepts' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>📖 Conceptos Teóricos</button>
        <button onClick={() => setActiveTab('lab')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'lab' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>🧪 Laboratorio Interactivo</button>
        <button onClick={() => setActiveTab('code')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'code' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>💻 Código Python</button>
        <button onClick={() => setActiveTab('code2')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'code2' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>💻 Código R</button>
        <button onClick={() => setActiveTab('pdf')} className={`pb-3 px-6 text-sm font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${ activeTab === 'pdf' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600" }`}><span>📄</span> Guía Breve</button>
      </div>

      {/* --- TAB 1: CONCEPTOS --- */}
      {activeTab === 'concepts' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* 4.0 Curva Normal */}
          <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
  
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <span>🔔</span>La Curva Normal (Distribución Gaussiana)
            </h3>
  
            <p className="text-gray-600 mb-6 max-w-3xl">
              Es la base de la estadística inferencial. Describe cómo se distribuyen la mayoría de los fenómenos naturales: 
              la mayoría de los datos están cerca del promedio (el centro de la campana), y pocos están en los extremos.
            </p>
  
            <div className="bg-blue-50 p-5 rounded-xl">
              <ul className="space-y-5 text-sm text-blue-800">
                {/* Punto de Simetría */}
                <li className="flex gap-2">
                  <span className="shrink-0">✅</span>
                  <span><strong>Simetría:</strong> La media, mediana y moda coinciden en el centro de la distribución.</span>
                </li>

                {/* Regla Empírica */}
                <li className="flex gap-2">
                  <span className="shrink-0">✅</span>
                  <div className="flex flex-col w-full">
                    <strong>Regla (68-95-99.7):</strong>
          
                    {/* Contenedor de 2 columnas para Texto + Imagen */}
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-white p-4 rounded-xl border border-blue-100/70 shadow-sm">
            
                      {/* Columna Izquierda: Los datos */}
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                          <span>El <strong>68.2%</strong> de los datos está a ±1σ de la media.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                          <span>El <strong>95.4%</strong> de los datos está a ±2σ de la media.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                          <span>El <strong>99.7%</strong> de los datos está a ±3σ de la media.</span>
                        </li>
                      </ul>

                      {/* Columna Derecha: La Imagen */}
                      <div className="flex justify-center p-2 bg-blue-50/50 rounded-lg border border-dashed border-blue-200">
                        <img 
                          src="/distribucion-gaussiana.png" 
                          alt="Diagrama de la Regla Empírica 68-95-99.7" 
                          className="max-h-[140px] w-auto object-contain mix-blend-multiply"
                        />
                      </div>

                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Diccionario de Símbolos para Estadística Bivariada */}
          <div className="bg-slate-900 text-slate-200 p-5 rounded-xl mb-6 shadow-md">
            <p className="font-bold text-amber-400 mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
              <span>📖</span> Diccionario para fórmulas de dos variables:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <div><span className="text-blue-400 font-bold"><InlineMath math="X, Y" /></span> = Las dos variables a comparar</div>
              <div><span className="text-purple-400 font-bold"><InlineMath math="x_i, y_i" /></span> = El par de datos en la posición &apos;i&apos;</div>
              <div><span className="text-yellow-400 font-bold"><InlineMath math="∑" /></span> = Sumatoria desde <InlineMath math="i=1" /> hasta <InlineMath math="n" /></div>
              <div><span className="text-green-400 font-bold"><InlineMath math="\bar{x}, \bar{y}" /></span> = Promedios (medias) de <InlineMath math="X" /> y de <InlineMath math="Y" /></div>
              <div><span className="text-pink-400 font-bold"><InlineMath math="m" /></span> = Pendiente (inclinación de la recta)</div>
              <div><span className="text-orange-400 font-bold"><InlineMath math="b" /></span> = Intersección (dónde corta al eje Y)</div>
              <div><span className="text-cyan-400 font-bold"><InlineMath math="\hat{y}_i" /></span> = Valor predicho o estimado</div>
              <div><span className="text-red-400 font-bold"><InlineMath math="n" /></span> = Número total de pares de datos</div>
            </div>
          </div>

          {/* Grid de Inferencia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  
          {/* 4.1 Regresión */}
          <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Regresión Lineal</h3>
              <p className="text-xs text-gray-500 mb-3">Es una técnica para trazar una &quot;línea recta óptima&quot; a través de tus datos. Sirve para predecir el comportamiento de una variable dependiente (<InlineMath math="Y" />) basándose en una independiente (<InlineMath math="X" />).</p>
            </div>
            <div className="bg-gray-50 p-3 rounded text-center text-gray-700 mt-auto border border-gray-200/60">
              <BlockMath math="y = mx + b" />
              <p className="text-[10px] mt-1 text-gray-400">
                Donde <InlineMath math="m" /> es cuánto sube o baja la recta por cada paso de <InlineMath math="X" />, y <InlineMath math="b" /> es el punto de partida en el eje vertical.
              </p>
            </div>
          </section>

          {/* 4.2 Correlación */}
          <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Correlación de Pearson (<InlineMath math="r" />)</h3>
              <p className="text-xs text-gray-500 mb-2">Mide la fuerza y dirección de la relación lineal entre dos variables cuantitativas. No implica que una cause a la otra.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded text-center text-gray-700 my-2 border border-gray-200/60 overflow-x-auto">
              <BlockMath math="r = \frac{\sum_{i=1}^{n} (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum_{i=1}^{n} (x_i - \bar{x})^2 \sum_{i=1}^{n} (y_i - \bar{y})^2}}" />
            </div>
            <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
              <span className="block text-[10px] font-bold text-blue-900 mb-1">Rango de valores (<InlineMath math="-1 \leq r \leq 1" />):</span>
              <ul className="text-[10px] text-gray-600 pl-3 list-disc space-y-0.5">
                <li><strong className="text-green-700">r = 1</strong>: Correlación Positiva Perfecta (si X sube, Y sube).</li>
                <li><strong className="text-gray-500">r = 0</strong>: Ausencia total de relación lineal.</li>
                <li><strong className="text-red-700">r = -1</strong>: Correlación Negativa Perfecta (si X sube, Y baja).</li>
              </ul>
            </div>
          </section>

          {/* 4.3 Gráfico de Dispersión (Ocupa el ancho completo del grid en MD) */}
          <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm md:col-span-2">
            <h3 className="font-bold text-gray-800 mb-1">Gráfico de Dispersión (Scatter Plot)</h3>
            <p className="text-xs text-gray-500 mb-4">Es el mapa cartesiano donde cada punto representa a un sujeto de estudio con sus dos coordenadas (<InlineMath math="x_i, y_i" />).</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="bg-gray-50 p-4 rounded-lg text-[11px] text-gray-600 h-full flex flex-col justify-center border border-gray-200/60">
                <p className="font-bold text-gray-700 mb-2">Al observar la nube de puntos puedes identificar:</p>
                <ul className="list-disc pl-4 space-y-2">
                  <li><strong>Tendencia:</strong> ¿La nube va hacia arriba, hacia abajo o está completamente plana?</li>
                  <li><strong>Fuerza:</strong> ¿Los puntos están juntos formando casi una línea o están dispersos por todas partes?</li>
                  <li><strong>Datos Atípicos (Outliers):</strong> Puntos que se salen por completo del comportamiento del resto del grupo.</li>
                </ul>
              </div>

              <div className="flex justify-center items-center bg-gray-50/50 p-2 rounded-lg border border-dashed border-gray-200 h-full min-h-[140px]">
                <img 
                  src="/diagrama-dispersion.jpg" 
                  alt="Ejemplo de Gráfico de Dispersión" 
                  className="max-h-[130px] w-auto object-contain mix-blend-multiply"
                />
              </div>
            </div>
          </section>

          {/* 4.4 Covarianza */}
          <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Covarianza (<InlineMath math="Cov" />)</h3>
              <p className="text-xs text-gray-500 mb-3">Indica si dos variables &quot;se mueven juntas&quot;. Si es positiva, ambas crecen a la par; si es negativa, cuando una sube la otra baja. El problema es que su valor numérico es difícil de interpretar porque depende de las unidades de medida.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded text-center text-gray-700 mt-auto border border-gray-200/60">
              <BlockMath math="Cov(X, Y) = \frac{\sum_{i=1}^{n} (x_i - \bar{x})(y_i - \bar{y})}{n}" />
              <p className="text-[10px] mt-1 text-gray-400">
                Multiplica las distancias de cada dato respecto a su propia media.
              </p>
            </div>
          </section>

          {/* 4.5 Coeficiente de Determinación */}
          <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Coeficiente de Determinación (<InlineMath math="R^2" />)</h3>
              <p className="text-xs text-gray-500 mb-3">Es la &quot;calificación&quot; de tu modelo de regresión lineal (va de 0 a 1, o de 0% a 100%). Te dice exactamente qué porcentaje de la variabilidad de <InlineMath math="Y" /> logra ser explicado por tu recta.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded text-center text-gray-700 mt-auto border border-gray-200/60">
              <BlockMath math="R^2 = 1 - \frac{\sum_{i=1}^{n} (y_i - \hat{y}_i)^2}{\sum_{i=1}^{n} (y_i - \bar{y})^2}" />
              <p className="text-[10px] mt-1 text-gray-400">
                Compara el error de tu predicción (<InlineMath math="\hat{y}_i" />) contra el error de simplemente usar el promedio (<InlineMath math="\bar{y}" />).
              </p>
            </div>
          </section>

          </div>
        </div>
      )}

      {/* --- TAB 2: LABORATORIO --- */}
      {activeTab === 'lab' && (
        <div className="space-y-8 animate-fade-in">
           
           {/* Panel de Entrada */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
             
             {/* Selector de Modo */}
             <div className="flex justify-center mb-6">
                <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                    <button 
                        onClick={() => setInputMode('manual')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${inputMode === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        ✍️ Manual
                    </button>
                    <button 
                        onClick={() => setInputMode('file')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${inputMode === 'file' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        📂 Excel / CSV
                    </button>
                </div>
             </div>

             {/* Opción A: Manual (Inputs de Texto) */}
             {inputMode === 'manual' && (
                <div className="animate-fade-in">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 text-center">Datos Bivariados (X, Y)</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-blue-600 mb-1">Variable Independiente (X)</label>
                            <textarea 
                                className="w-full p-3 border rounded-lg bg-gray-50 font-mono text-sm h-24 focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: 1, 2, 3, 4, 5"
                                value={inputX}
                                onChange={(e) => setInputX(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-green-600 mb-1">Variable Dependiente (Y)</label>
                            <textarea 
                                className="w-full p-3 border rounded-lg bg-gray-50 font-mono text-sm h-24 focus:ring-2 focus:ring-green-500"
                                placeholder="Ej: 2, 4, 5, 4, 5"
                                value={inputY}
                                onChange={(e) => setInputY(e.target.value)}
                            />
                        </div>
                    </div>
                    {error && <div className="text-red-500 text-xs mt-2 font-bold text-center">{error}</div>}
                    
                    <button 
                        onClick={handleCalculate}
                        disabled={loading || !inputX || !inputY}
                        className="mt-6 w-full py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black disabled:bg-gray-300 transition-colors"
                    >
                        {loading ? "Calculando..." : "Calcular Regresión"}
                    </button>
                </div>
             )}

             {/* Opción B: Archivo (Carga Automática) */}
             {inputMode === 'file' && (
                <div className="animate-fade-in text-center border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-50 transition-colors relative">
                    <input 
                        type="file" 
                        accept=".csv, .xlsx, .xls"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={async (e) => {
                            if (!e.target.files || e.target.files.length === 0) return;
                            
                            const file = e.target.files[0];
                            setLoading(true);
                            setError("");
                            
                            const formData = new FormData();
                            formData.append("file", file);

                            try {
                                const res = await fetch(`${API_URL}/api/v1/inference/upload`, {
                                    method: "POST",
                                    body: formData,
                                });
                                
                                if (!res.ok) {
                                    const errData = await res.json();
                                    throw new Error(errData.detail || "Error al procesar archivo.");
                                }

                                const data = await res.json();

                                setResult({ 
                                    ...data, 
                                    rawX: data.raw_x, 
                                    rawY: data.raw_y 
                                });
                                

                            } catch (err: any) {
                                console.error(err);
                                setError(err.message || "Error de conexión.");
                            } finally {
                                setLoading(false);
                            }
                        }}
                    />
                    <div className="pointer-events-none">
                        <div className="text-4xl mb-2">📈</div>
                        <p className="text-sm font-bold text-gray-700">Sube tu Excel o CSV con 2 columnas</p>
                        <ul className="text-xs text-gray-400 mt-2 space-y-1">
                            <li>• Columna A: Variable X (Independiente)</li>
                            <li>• Columna B: Variable Y (Dependiente)</li>
                        </ul>
                    </div>
                </div>
             )}
           </div>

           {/* Resultados */}
           {result && (
             <div className="animate-fade-in">
                
                {/* --- BOTONES DE REPORTE  */}
                <div className="flex justify-end mb-4 gap-2">
                    {!reportImage ? (
                        <button 
                            onClick={prepareReport}
                            disabled={preparingPdf}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-xs font-bold rounded-lg hover:bg-gray-900 transition-all"
                        >
                            {preparingPdf ? "Procesando..." : "📄 Generar Reporte PDF"}
                        </button>
                    ) : (
                        <PDFDownloadLink
                            document={<RegressionPDF data={result} chartImage={reportImage} />}
                            fileName={`Reporte_Regresion_${new Date().toISOString().split('T')[0]}.pdf`}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all shadow-md"
                        >
                            {/* @ts-ignore */}
                            {({ loading }) => (loading ? 'Construyendo...' : '⬇️ Descargar PDF')}
                        </PDFDownloadLink>
                    )}
                </div>

                {/* --- CONTENEDOR A CAPTURAR (ref={resultsRef}) --- */}
                <div ref={resultsRef} className="grid lg:grid-cols-3 gap-6 bg-white p-4 rounded-xl">
                    
                    {/* Columna Izquierda: Resultados Numéricos */}
                    <div className="lg:col-span-1 space-y-4">
                        {/**/}
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                            <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Ecuación de la Recta</h4>
                            <div className="text-xl font-mono font-bold text-blue-900">
                                {result.linear_regression.equation}
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                                m (Pendiente): {result.linear_regression.slope.toFixed(4)} <br/>
                                b (Intercepto): {result.linear_regression.intercept.toFixed(4)}
                            </div>
                        </div>

                        <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                            <h4 className="text-xs font-bold text-green-800 uppercase mb-2">Coef. de Correlación</h4>
                            <div className="text-2xl font-bold text-green-900">
                                r = {result.correlation.pearson_r.toFixed(4)}
                            </div>
                            <div className="inline-block px-2 py-1 bg-green-200 text-green-800 text-[10px] font-bold rounded mt-2">
                                {result.correlation.interpretation}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Covarianza:</span>
                                <span className="font-mono font-bold">{result.covariance.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                                <span className="text-gray-500">R² (Determinación):</span>
                                <span className="font-mono font-bold">{result.linear_regression.r_squared.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Gráfico */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="font-bold text-gray-700 mb-4">Gráfico de Dispersión + Línea de Ajuste</h4>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {/* Usamos ComposedChart para permitir mezclar Scatter y Line fácilmente */}
                                <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20}}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" dataKey="x" name="Variable X" unit="" />
                                    <YAxis type="number" dataKey="y" name="Variable Y" unit="" />

                                    {/* La línea de tendencia */}
                                    <Line
                                        data={trendLineData}
                                        type="monotone"
                                        dataKey="y"
                                        stroke="#ef4444" // Color rojo para contraste
                                        dot={false}
                                        legendType="none"
                                        strokeWidth={2}
                                    />

                                    {/* Los puntos de dispersión */}
                                    <Scatter name="Datos" data={chartData} fill="#2563eb" />
                                </ComposedChart>    
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-center text-gray-400 mt-2">
                            La línea de tendencia visualiza la ecuación $y = mx + b$ sobre los puntos dispersos.
                        </p>
                    </div>
                </div>
             </div>
           )}
        </div>
      )}

      {/* --- TAB 3: CÓDIGO PYTHON --- */}
      {activeTab === 'code' && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-3 text-gray-400 font-mono text-sm">regresion_lineal.py</span>
              </div>
              <button onClick={handleCopy} className="text-xs font-medium text-gray-300 hover:text-white bg-gray-700 px-3 py-1.5 rounded">
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed text-gray-300"><code>{pythonCode}</code></pre>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: CÓDIGO R --- */}
      {activeTab === 'code2' && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-3 text-gray-400 font-mono text-sm">regresion_lineal.R</span>
              </div>
              <button onClick={handleCopyR} className="text-xs font-medium text-gray-300 hover:text-white bg-gray-700 px-3 py-1.5 rounded">
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed text-gray-300"><code>{rCode}</code></pre>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pdf' && (
        <div className="w-full h-[600px] bg-white rounded-lg shadow-sm overflow-hidden">
          <iframe 
            src="/prueba.pdf" 
            className="w-full h-full" 
            title="Visor PDF"
          />
        </div>
      )}

    </div>
  );
}