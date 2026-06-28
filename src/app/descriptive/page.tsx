"use client";

import { useState } from "react";
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { DescriptivePDF } from '@/components/reports/DescriptivePDF';
import { toPng } from 'html-to-image';
import { useRef } from 'react';

import { API_URL } from '@/config/api';

export default function DescriptivePage() {
  const [activeTab, setActiveTab] = useState<'concepts' | 'lab' | 'code' | 'code2'>('concepts');
  const [inputData, setInputData] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputMode, setInputMode] = useState<'manual' | 'file'>('manual');
  const [isPopulation, setIsPopulation] = useState(false); // False = Muestra (por defecto)

  const resultsRef = useRef<HTMLDivElement>(null);
  const [reportImage, setReportImage] = useState<string>("");
  const [preparingPdf, setPreparingPdf] = useState(false);

  // Función para capturar el área de resultados antes de generar PDF
  const prepareReport = async () => {
    if (resultsRef.current === null) return;
    setPreparingPdf(true);
    try {
        // Capturamos el div "resultsRef" como PNG
        const dataUrl = await toPng(resultsRef.current, { cacheBust: true, backgroundColor: '#ffffff', fontEmbedCSS: '',});
        setReportImage(dataUrl);
    } catch (err) {
        console.error("Error generando imagen para reporte", err);
    } finally {
        setPreparingPdf(false);
    }
  };

  const handleCalculate = async () => {
    setLoading(true);
    const dataArray = inputData.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n));
    
    try {
      const res = await fetch(`${API_URL}/api/v1/descriptive/basic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sample_data: dataArray,
          is_population: isPopulation 
        })
      });
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Código Python básico y didáctico para la pestaña 3
  const pythonCode = `# Cálculo de Estadísticos Descriptivos Básicos
import statistics as stats

datos = [10, 12, 23, 23, 16, 23, 21, 16]

# 3.1 Tendencia Central
media = stats.mean(datos)
mediana = stats.median(datos)
moda = stats.mode(datos)

# 3.2 Dispersión
varianza = stats.variance(datos)
desviacion = stats.stdev(datos)

print(f"Media: {media}")
print(f"Desviación Estándar: {desviacion}")`;

  // Código R básico y didáctico para la pestaña 4
  const rCode = `# Cálculo de Estadísticos Descriptivos Básicos en R

# Vector de datos (usamos c para combinar los valores)
datos <- c(10, 12, 23, 23, 16, 23, 21, 16)

# 3.1 Tendencia Central
media   <- mean(datos)
mediana <- median(datos)

# R base no tiene una función 'mode' estadística directa. 
# Usamos una combinación para encontrar el valor más frecuente:
moda <- names(which.max(table(datos)))

# 3.2 Dispersión
varianza   <- var(datos)  # Varianza muestral
desviacion <- sd(datos)   # Desviación estándar muestral

# Imprimir resultados
cat(paste("Media:", media, "\n"))
cat(paste("Desviación Estándar:", desviacion, "\n"))`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyR = () => {
    navigator.clipboard.writeText(rCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Estadística Descriptiva</h1>
        <p className="text-gray-500 mt-2">Análisis numérico de las propiedades del conjunto de datos.</p>
      </header>

      {/* Navegación Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button onClick={() => setActiveTab('concepts')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'concepts' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>📖 Conceptos</button>
        <button onClick={() => setActiveTab('lab')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'lab' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>🧮 Calculadora</button>
        <button onClick={() => setActiveTab('code')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'code' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>💻 Código Python</button>
        <button onClick={() => setActiveTab('code2')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'code2' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>💻 Código R</button>
      </div>

      {/* TAB 1: CONCEPTOS */}
      {activeTab === 'concepts' && (
        <div className="grid gap-6 animate-fade-in">
          
          {/* Alerta metodológica: Tipo de datos */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-xl shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-amber-700 font-bold text-sm">📌 Nota Metodológica:</span>
              <p className="text-xs text-amber-900">
                Las siguientes fórmulas aplican estrictamente para <strong>Datos No Agrupados (Series Simples)</strong>, donde cada valor individual se procesa uno por uno.
              </p>
            </div>
          </div>

          {/* Diccionario de Símbolos para principiantes */}
          <div className="bg-slate-900 text-slate-200 p-5 rounded-xl mb-8 shadow-md">
            <p className="font-bold text-amber-400 mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
              <span>📖</span> Diccionario rápido para leer las fórmulas:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <div><span className="text-blue-400 font-bold">n</span> = Total de datos (Muestra)</div>
              <div><span className="text-green-400 font-bold">N</span> = Total de datos (Población)</div>
              <div><span className="text-purple-400 font-bold">x_i</span> = El dato en la posición &apos;i&apos;</div>
              <div><span className="text-yellow-400 font-bold">∑</span> = Sumar todos los valores</div>
              <div><span className="text-blue-400 font-bold">x̄</span> = Media de la muestra</div>
              <div><span className="text-green-400 font-bold">μ</span> = Media de la población</div>
              <div><span className="text-pink-400 font-bold">f_i</span> = Frecuencia (repeticiones)</div>
              <div><span className="text-orange-400 font-bold">| |</span> = Valor absoluto (positivo)</div>
            </div>
          </div>

          {/* 3.1 Tendencia Central */}
          <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span>🎯</span> Medidas de Tendencia Central
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Buscan resumir en un solo número el &quot;centro de gravedad&quot; de todo tu conjunto de datos.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Media */}
              <div className="bg-blue-50/60 p-5 rounded-xl border border-blue-100 flex flex-col justify-between">
                <div>
                  <strong className="block text-blue-900 mb-1">Media Aritmética (<InlineMath math="\bar{x}" />)</strong>
                  <p className="text-xs text-gray-600 mb-3">Es el promedio clásico. Sumas todos los valores individuales (<InlineMath math="x_i" />) y los divides entre la cantidad total de datos.</p>
                </div>
                <div className="text-blue-900 py-2 bg-white rounded-lg shadow-sm text-center">
                  <BlockMath math="\bar{x} = \frac{\sum_{i=1}^{n} x_i}{n}" />
                </div>
              </div>

              {/* Mediana */}
              <div className="bg-blue-50/60 p-5 rounded-xl border border-blue-100 flex flex-col justify-between">
                <div>
                  <strong className="block text-blue-900 mb-1">Mediana (Me)</strong>
                  <p className="text-xs text-gray-600 mb-3">Es el dato que queda exactamente a la mitad cuando ordenas los datos de menor a mayor.</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                  <span className="text-[11px] text-gray-500 block mb-1">Posición del dato central:</span>
                  <div className="text-blue-900 font-bold">
                    <InlineMath math="Pos = \frac{n+1}{2}" />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block italic">*Si n es par, promedias los dos del centro</span>
                </div>
              </div>

              {/* Moda */}
              <div className="bg-blue-50/60 p-5 rounded-xl border border-blue-100 flex flex-col justify-between">
                <div>
                  <strong className="block text-blue-900 mb-1">Moda (Mo)</strong>
                  <p className="text-xs text-gray-600 mb-3">El valor que más veces aparece (aquel cuya frecuencia absoluta <InlineMath math="f_i" /> es la máxima).</p>
                </div>
                <div className="text-blue-900 py-3 bg-white rounded-lg shadow-sm text-center">
                   <InlineMath math="Mo = x_i \text{ con } \max(f_i)" />
                </div>
              </div>
            </div>
          </section>

          {/* 3.2 Variabilidad */}
          <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2">
              <span>〰️</span> Medidas de Variabilidad o Dispersión
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Miden qué tan separados están los datos respecto al centro. Un promedio con dispersión gigante es poco confiable.
            </p>

            <div className="space-y-4">
              {/* Varianzas */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-xl border transition-all ${isPopulation ? 'bg-blue-50/40 border-blue-500 ring-2 ring-blue-200' : 'bg-green-50/40 border-green-100'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <strong className="text-green-900 text-sm">Varianza Poblacional (<InlineMath math="\sigma^2" />)</strong>
                    {isPopulation && <span className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded font-bold">ACTIVO</span>}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Promedio de las distancias al cuadrado respecto a la media poblacional (<InlineMath math="\mu" />).</p>
                  <div className="bg-white p-2 rounded shadow-sm text-green-900">
                    <BlockMath math="\sigma^2 = \frac{\sum_{i=1}^{N} (x_i - \mu)^2}{N}" />
                  </div>
                </div>
      
                <div className={`p-5 rounded-xl border transition-all ${!isPopulation ? 'bg-blue-50/40 border-blue-500 ring-2 ring-blue-200' : 'bg-green-50/40 border-green-100'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <strong className="text-green-900 text-sm">Varianza Muestral (<InlineMath math="s^2" />)</strong>
                    {!isPopulation && <span className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded font-bold">ACTIVO</span>}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Divide entre <InlineMath math="n-1" /> (Corrección de Bessel) para compensar matemáticamente que la muestra no posee todos los datos reales.</p>
                  <div className="bg-white p-2 rounded shadow-sm text-green-900">
                    <BlockMath math="s^2 = \frac{\sum_{i=1}^{n} (x_i - \bar{x})^2}{n - 1}" />
                  </div>
                </div>

                {/* Desviación Estándar */}
                <div className="md:col-span-2 bg-green-50/40 p-5 rounded-xl border border-green-100">
                  <strong className="block text-green-900 text-sm mb-1">Desviación Estándar (<InlineMath math="\sigma" /> o <InlineMath math="s" />)</strong>
                  <p className="text-xs text-gray-600 mb-2">
                    Como la varianza eleva las unidades al cuadrado (ej. <InlineMath math="\text{metros}^2" />), le sacamos raíz cuadrada para regresar a las unidades reales de tus datos (ej. <InlineMath math="\text{metros}" />).
                  </p>
                  <div className="bg-white p-2 rounded shadow-sm text-green-900">
                    <BlockMath math="\sigma = \sqrt{\sigma^2} \quad \text{o} \quad s = \sqrt{s^2}" />
                  </div>
                </div>
              </div>

              {/* Coeficiente de Variación */}
              <div className="bg-purple-50/50 p-5 rounded-xl border border-purple-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <strong className="block text-purple-900 text-sm">Coeficiente de Variación (CV)</strong>
                  <p className="text-xs text-gray-600 mt-1">
                    Es la dispersión expresada en porcentaje. Sirve para comparar qué grupo varía más aunque se midan en cosas distintas (ej: ¿Varían más los pesos de elefantes en kg o los de hormigas en gramos?).
                  </p>
                </div>
                <div className="bg-white px-6 py-3 rounded-lg shadow-sm text-purple-900 shrink-0">
                  <BlockMath math="CV = \frac{s}{|\bar{x}|} \times 100\%" />
                </div>
              </div>
            </div>
          </section>

          {/* 3.3 Posición */}
          <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
             <h3 className="text-lg font-bold text-purple-900 mb-2">Medidas de Posición</h3>
             <ul className="text-sm text-gray-600 space-y-2 pl-4">
               <li className="flex items-center gap-2">
                 <span className="font-bold text-purple-700">Cuartiles (<InlineMath math="Q_k" />):</span> 
                 Dividen los datos en 4 partes iguales. <InlineMath math="Q_1 = 25\%, Q_2 = 50\%, Q_3 = 75\%" />.
               </li>
               <li className="flex items-center gap-2">
                 <span className="font-bold text-purple-700">Deciles (<InlineMath math="D_k" />):</span> 
                 Dividen los datos en 10 partes iguales.
               </li>
               <li className="flex items-center gap-2">
                 <span className="font-bold text-purple-700">Percentiles (<InlineMath math="P_k" />):</span> 
                 Dividen los datos en 100 partes iguales.
               </li>
             </ul>
          </section>
        </div>
      )}

      {/* TAB 2: LABORATORIO */}
      {activeTab === 'lab' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Panel de Entrada */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            
            {/* Selector de Modo (Manual vs Archivo) */}
            <div className="flex justify-center mb-6">
                <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                    <button 
                        onClick={() => setInputMode('manual')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${inputMode === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        ✍️ Entrada Manual
                    </button>
                    <button 
                        onClick={() => setInputMode('file')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${inputMode === 'file' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        📂 Subir Excel / CSV
                    </button>
                </div>
            </div>

            {/* Selector de Población vs Muestra */}
            <div className="flex items-center justify-center gap-4 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className={`text-sm font-bold ${!isPopulation ? 'text-blue-600' : 'text-gray-400'}`}>Muestra (n-1)</span>
  
              <button 
                onClick={() => setIsPopulation(!isPopulation)}
                className="relative w-12 h-6 bg-gray-300 rounded-full transition-colors focus:outline-none"
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isPopulation ? 'translate-x-6 bg-blue-600' : ''}`} />
                <div className={`w-full h-full rounded-full ${isPopulation ? 'bg-blue-500' : 'bg-gray-300'}`} />
              </button>

              <span className={`text-sm font-bold ${isPopulation ? 'text-blue-600' : 'text-gray-400'}`}>Población (N)</span>
            </div>

            {/* Opción A: Manual */}
            {inputMode === 'manual' && (
                <div className="animate-fade-in">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Escribe tus datos (separados por coma):</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 p-3 border rounded-lg bg-gray-50 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ej: 5.5, 6.2, 5.8, 7.0..."
                            value={inputData}
                            onChange={(e) => setInputData(e.target.value)}
                        />
                        <button 
                            onClick={handleCalculate}
                            className="bg-blue-600 text-white px-6 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                            disabled={loading}
                        >
                            {loading ? "..." : "Calcular"}
                        </button>
                    </div>
                </div>
            )}

            {/* Opción B: Archivo */}
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
                            
                            const formData = new FormData();
                            formData.append("file", file);

                            try {
                                const res = await fetch(`${API_URL}/api/v1/descriptive/upload?is_population=${isPopulation}`, {
                                    method: "POST",
                                    body: formData, // Enviamos el archivo crudo
                                });
                                if (res.ok) {
                                    setStats(await res.json());
                                } else {
                                    alert("Error al procesar el archivo. Asegúrate de que la primera columna tenga números.");
                                }
                            } catch (err) {
                                console.error(err);
                                alert("Error de conexión.");
                            } finally {
                                setLoading(false);
                            }
                        }}
                    />
                    <div className="pointer-events-none">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="text-sm font-bold text-gray-700">Arrastra tu archivo aquí o haz clic</p>
                        <p className="text-xs text-gray-400 mt-1">Soporta Excel (.xlsx) y CSV. El sistema leerá la primera columna.</p>
                    </div>
                </div>
            )}
          </div>

          {/* Resultados (Se mantienen igual, ya que 'stats' se llena igual) */}
          {stats && (
            <div className="animate-fade-in">
                
              
              <div className="flex justify-end mb-4 gap-2">
                 {/* Botón 1: Preparar PDF */}
                 {!reportImage ? (
                     <button 
                        onClick={prepareReport}
                        disabled={preparingPdf}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-xs font-bold rounded-lg hover:bg-gray-900 transition-all"
                     >
                        {preparingPdf ? "Preparando..." : "📄 Generar Reporte PDF"}
                     </button>
                 ) : (
                     /* Botón 2: Descargar  */
                     <PDFDownloadLink
                        document={<DescriptivePDF stats={stats} chartImage={reportImage} />}
                        fileName={`Reporte_Descriptivo_${new Date().toISOString().split('T')[0]}.pdf`}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all shadow-md"
                     >
                        {/* @ts-ignore */}
                        {({ loading }) => (loading ? 'Construyendo...' : '⬇️ Descargar PDF')}
                     </PDFDownloadLink>
                 )}
              </div>

              
              {/* ref aquí e id para html-to-image */}
              <div ref={resultsRef} className="grid md:grid-cols-3 gap-6 p-4 bg-white rounded-xl"> 
                  {/* Tarjeta 3.1 */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border-t-4 border-blue-500 border border-gray-100">
                    <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">3.1 Tendencia Central</h4>
                    <div className="space-y-3">
                      <StatRow label="Media" value={stats.summary_stats.mean.toFixed(2)} />
                      <StatRow label="Mediana" value={stats.summary_stats.median.toFixed(2)} />
                      <StatRow label="Moda" value={stats.summary_stats.mode.join(", ")} />
                    </div>
                  </div>

                  {/* Tarjeta 3.2 */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border-t-4 border-green-500 border border-gray-100">
                    <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">3.2 Variabilidad</h4>
                    <div className="space-y-3">
                      <StatRow label="Rango" value={stats.summary_stats.range.toFixed(2)} />
                      <StatRow label="Varianza" value={stats.summary_stats.variance.toFixed(2)} />
                      <StatRow label="Desv. Estándar" value={stats.summary_stats.std_dev.toFixed(4)} />
                      <StatRow label="C. Variación" value={`${stats.summary_stats.coeff_variation.toFixed(2)}%`} highlight />
                    </div>
                  </div>

                  {/* Tarjeta 3.3 */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border-t-4 border-purple-500 border border-gray-100">
                    <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">3.3 Posición</h4>
                    <div className="space-y-3">
                      <StatRow label="Mínimo" value={stats.summary_stats.min} />
                      <StatRow label="Cuartil 1 (25%)" value={stats.summary_stats.q1} />
                      <StatRow label="Cuartil 3 (75%)" value={stats.summary_stats.q3} />
                      <StatRow label="Máximo" value={stats.summary_stats.max} />
                    </div>
                  </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CÓDIGO */}
      {activeTab === 'code' && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-3 text-gray-400 font-mono text-sm">calculos_stats.py</span>
              </div>
              <button onClick={handleCopy} className="text-xs font-medium text-gray-300 hover:text-white bg-gray-700 px-3 py-1.5 rounded">
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed text-gray-300"><code>{pythonCode}</code></pre>
            </div>
          </div>
          <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
             <span className="text-2xl">💡</span>
             <div>
               <h4 className="font-bold text-blue-900 text-sm">Nota de Python</h4>
               <div className="text-blue-800 text-xs mt-1">
                 Python tiene un módulo nativo llamado <code>statistics</code> que simplifica mucho las cosas. Para análisis más avanzados (como los que hace esta app), se suele usar <strong>Pandas</strong> o <strong>NumPy</strong>.
               </div>
             </div>
          </div>
        </div>
      )}

      {/* TAB 4: CÓDIGO R */}
      {activeTab === 'code2' && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-3 text-gray-400 font-mono text-sm">calculos_stats.R</span>
              </div>
              <button onClick={handleCopyR} className="text-xs font-medium text-gray-300 hover:text-white bg-gray-700 px-3 py-1.5 rounded">
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed text-gray-300"><code>{rCode}</code></pre>
            </div>
          </div>
          <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
             <span className="text-2xl">💡</span>
             <div>
               <h4 className="font-bold text-blue-900 text-sm">Nota de R</h4>
               <div className="text-blue-800 text-xs mt-1">
                 R no requiere módulos externos para estadística básica; funciones como mean() y sd() son nativas del lenguaje. Sin embargo, para análisis más complejos, se recomienda usar paquetes como <strong>dplyr</strong> o <strong>data.table</strong>.
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente auxiliar para filas de datos
function StatRow({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`font-mono font-bold ${highlight ? "text-blue-600 bg-blue-50 px-2 rounded" : "text-gray-800"}`}>
        {value}
      </span>
    </div>
  );
}