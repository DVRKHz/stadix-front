"use client";
import { API_URL } from '@/config/api';
import { useState, useRef } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, ComposedChart
} from 'recharts';

// --- NUEVAS IMPORTACIONES PARA PDF ---
import { toPng } from 'html-to-image';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { OrganizationPDF } from '@/components/reports/OrganizationPDF'; 

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function OrganizacionPage() {
  const [activeTab, setActiveTab] = useState<'concepts' | 'lab' | 'code' | 'code2' | 'pdf'>('concepts');
  const [inputData, setInputData] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState("bar");
  const [inputMode, setInputMode] = useState<'manual' | 'file'>('manual');
  const [copied, setCopied] = useState(false); 

  // --- ESTADOS PARA CAPTURA DE IMÁGENES ---
  const [isCapturing, setIsCapturing] = useState(false);
  const [reportImages, setReportImages] = useState<{bar?: string, line?: string, pie?: string}>({});
  const chartRef = useRef<HTMLDivElement>(null);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // --- LÓGICA DE CAPTURA RÁFAGA ---
  const handlePrepareAllCharts = async () => {
    if (chartRef.current === null) return;
    setIsCapturing(true);
    const capturedImages: {bar?: string, line?: string, pie?: string} = {};

    try {
      setChartType("bar");
      await sleep(500); 
      capturedImages.bar = await toPng(chartRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });

      setChartType("line");
      await sleep(500);
      capturedImages.line = await toPng(chartRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });

      setChartType("pie");
      await sleep(500);
      capturedImages.pie = await toPng(chartRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });

      setReportImages(capturedImages);
      setChartType("bar"); // Reset a vista inicial
    } catch (err) {
      console.error("Error en capturas:", err);
    } finally {
      setIsCapturing(false);
    }
  };

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

  const handleCalculate = async () => {
    setLoading(true);
    const dataArray = inputData.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n));
    try {
      const res = await fetch(`${API_URL}/api/v1/descriptive/basic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sample_data: dataArray })
      });
      if (res.ok) {
        setStats(await res.json());
        setReportImages({}); // Limpiar capturas previas si cambian los datos
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const pythonCode = `# Herramientas para organizar datos (Pandas)
import pandas as pd

# 1. Definir la lista de datos brutos (la muestra)
datos = [12, 15, 12, 18, 20, 12, 15]

# 2. Convertir la lista a un DataFrame (estructura tabular tipo Excel)
# Esto permite usar funciones avanzadas de análisis de datos
df = pd.DataFrame({'valor': datos})

# 3. Generar la Tabla de Frecuencias
# value_counts(): Cuenta cuántas veces se repite cada número (fi)
# sort_index(): Ordena las clases de menor a mayor para que el gráfico sea coherente
tabla = df['valor'].value_counts().sort_index()

# 4. Mostrar resultados en consola
print("--- Tabla de Frecuencias ---")
print(tabla)

# 5. Visualización
# kind='bar': Genera el histograma o gráfico de barras
# Pandas utiliza Matplotlib internamente para renderizar el gráfico
tabla.plot(kind='bar', title="Gráfico de Barras")`;

  const rCode = `# Herramientas para organizar datos (R)

# 1. Crear un vector con los datos brutos
# c() es la función "combine" para crear arreglos o vectores
datos <- c(12, 15, 12, 18, 20, 12, 15)

# 2. Crear un Data Frame (estructura estándar de R para tablas)
# Asignamos el nombre de la columna como "valor"
df <- data.frame(valor = datos)

# 3. Generar la Tabla de Frecuencias
# table(): Función nativa de R que realiza el conteo de frecuencias absolutas
tabla <- table(df$valor)

# 4. Mostrar resultados en consola
print("--- Tabla de Frecuencias ---")
print(tabla)

# 5. Visualización
# barplot(): Crea el gráfico de barras a partir de la tabla de frecuencias
# main: Define el título del gráfico
# col: Aplica un color estético a las barras (en este caso azul cielo)
barplot(tabla, main = "Gráfico de Barras", col = "skyblue")`;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Organización de Datos</h1>
        <p className="text-gray-500 mt-2">Tablas de frecuencia y representaciones gráficas.</p>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button onClick={() => setActiveTab('concepts')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'concepts' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>📖 Conceptos Teóricos</button>
        <button onClick={() => setActiveTab('lab')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'lab' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>🧪 Laboratorio Interactivo</button>
        <button onClick={() => setActiveTab('code')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'code' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>💻 Código Python</button>
        <button onClick={() => setActiveTab('code2')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'code2' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>💻 Código R</button>
        <button onClick={() => setActiveTab('pdf')} className={`pb-3 px-6 text-sm font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${ activeTab === 'pdf' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600" }`}><span>📄</span> Guía Breve</button>
      </div>

      {/* TAB 1: CONCEPTOS */}
      {activeTab === 'concepts' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-blue-900 mb-2">Tablas de Frecuencia</h3>
            <p className="text-sm text-gray-600">Es una ordenación de datos en forma de tabla que muestra cuantas veces se repite cada valor o rango de valores (intervalos).</p>
            <ul className="text-xs mt-3 space-y-1 text-gray-500">
              <li>• <strong>fi (Absoluta):</strong> Conteo simple.</li>
              <li>• <strong>Fi (Acumulada):</strong> Suma progresiva.</li>
              <li>• <strong>hi (Relativa):</strong> Proporción del total (%).</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-blue-900 mb-2">Tipos de Gráficas</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2"><span className="p-1 bg-blue-100 rounded">📊 Barras</span> Histogramas para comparar frecuencias.</li>
              <li className="flex items-center gap-2"><span className="p-1 bg-green-100 rounded">📈 Líneas</span> Polígono de frecuencia para tendencias.</li>
              <li className="flex items-center gap-2"><span className="p-1 bg-yellow-100 rounded">🍰 Circular</span> Distribución porcentual.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: LABORATORIO */}
      {activeTab === 'lab' && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-center mb-6">
                <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                    <button onClick={() => setInputMode('manual')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${inputMode === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>✍️ Manual</button>
                    <button onClick={() => setInputMode('file')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${inputMode === 'file' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>📂 Excel / CSV</button>
                </div>
            </div>

            {inputMode === 'manual' && (
                <div className="animate-fade-in">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ingresa tus datos numéricos:</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" className="flex-1 p-3 border rounded-lg bg-gray-50 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ej: 10, 12, 15, 18, 20..." value={inputData}
                        onChange={(e) => setInputData(e.target.value)}
                      />
                      <button onClick={handleCalculate} className="bg-blue-600 text-white px-6 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200" disabled={loading}>
                        {loading ? "..." : "Procesar"}
                      </button>
                    </div>
                </div>
            )}

            {inputMode === 'file' && (
                <div className="animate-fade-in text-center border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-50 transition-colors relative">
                    <input type="file" accept=".csv, .xlsx, .xls" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={async (e) => {
                            if (!e.target.files || e.target.files.length === 0) return;
                            const file = e.target.files[0];
                            setLoading(true);
                            const formData = new FormData();
                            formData.append("file", file);
                            try {
                                const res = await fetch(`${API_URL}/api/v1/descriptive/upload`, { method: "POST", body: formData });
                                if (res.ok) setStats(await res.json());
                            } catch (err) { console.error(err); } 
                            finally { setLoading(false); }
                        }}
                    />
                    <div className="pointer-events-none">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="text-sm font-bold text-gray-700">Arrastra tu archivo Excel o CSV</p>
                    </div>
                </div>
            )}
          </div>

          {stats && (
            <div className="space-y-6">
              {/* ACCIONES DE REPORTE */}
              <div className="flex flex-wrap justify-end gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <button 
                  onClick={handlePrepareAllCharts} 
                  disabled={isCapturing}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${isCapturing ? 'bg-gray-400 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  {isCapturing ? "📸 Generando Imágenes..." : "✨ Preparar Gráficos para PDF"}
                </button>

                {Object.keys(reportImages).length === 3 && (
                  <PDFDownloadLink
                    document={<OrganizationPDF data={stats} images={reportImages} />}
                    fileName={`Reporte_Stadix_${new Date().getTime()}.pdf`}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 shadow-lg"
                  >
                    {({ loading: pdfLoading }) => pdfLoading ? "Generando PDF..." : "📥 Descargar Reporte Final"}
                  </PDFDownloadLink>
                )}
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* 2.1 TABLA */}
                <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><span>📑</span> 2.1 Tabla de Frecuencias</h3>
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                        <tr><th className="p-2">Clase</th><th className="p-2">fi</th><th className="p-2">%</th><th className="p-2">Fi</th></tr>
                      </thead>
                      <tbody className="divide-y">
                        {stats.frequency_table.map((row: any, i: number) => (
                          <tr key={i}>
                            <td className="p-2 font-mono text-gray-600">[{row.lower_limit}-{row.upper_limit})</td>
                            <td className="p-2 font-bold text-blue-600">{row.absolute_freq}</td>
                            <td className="p-2">{row.percentage}%</td>
                            <td className="p-2 text-gray-400">{row.cumulative_freq}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2.2 VISUALIZACIÓN (CON REF Y SIN ANIMACIONES) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><span>📈</span> 2.2 Visualización</h3>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      {['bar', 'line', 'pie'].map((type) => (
                        <button key={type} onClick={() => setChartType(type)} className={`px-3 py-1 text-xs font-bold rounded-md capitalize transition-all ${chartType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                          {type === 'bar' ? 'Barras' : type === 'line' ? 'Líneas' : 'Circular'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div ref={chartRef} className="h-80 w-full bg-white rounded-lg p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'bar' ? (
                        <BarChart data={stats.frequency_table}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="class_mark" />
                          <YAxis /><Tooltip /><Legend />
                          <Bar dataKey="absolute_freq" name="fi" fill="#3b82f6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                        </BarChart>
                      ) : chartType === 'line' ? (
                        <ComposedChart data={stats.frequency_table}>
                          <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="class_mark" /><YAxis /><Tooltip /><Legend />
                          <Line type="monotone" dataKey="absolute_freq" name="fi" stroke="#2563eb" strokeWidth={3} dot={{r:4}} isAnimationActive={false} />
                        </ComposedChart>
                      ) : (
                        <PieChart>
                          <Pie
                            data={stats.frequency_table}
                            dataKey="percentage" // Usamos el porcentaje como valor
                            nameKey="class_mark"
                            cx="50%" cy="50%" 
                            outerRadius={100} 
                            fill="#8884d8" 
                            isAnimationActive={false}
                            // MODIFICACIÓN AQUÍ: Función para mostrar solo el valor hi% en el perímetro
                            label={({ value }) => `${value}%`} 
                          >
                            {stats.frequency_table.map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip /><Legend />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TABS DE CÓDIGO (RESTO DEL CÓDIGO IGUAL) */}
      {activeTab === 'code' && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-3 text-gray-400 font-mono text-sm">generar_graficas.py</span>
              </div>
              <button onClick={handleCopy} className="text-xs font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition-colors flex items-center gap-2">
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed text-gray-300"><code>{pythonCode}</code></pre>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'code2' && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
               <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-3 text-gray-400 font-mono text-sm">generar_graficas.R</span>
              </div>
              <button onClick={handleCopyR} className="text-xs font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition-colors flex items-center gap-2">
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
            src="/Manual_organizacion_de_datos.pdf" 
            className="w-full h-full" 
            title="Visor PDF"
          />
        </div>
      )}

    </div>
  );
}