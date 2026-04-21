"use client";
import { API_URL } from '@/config/api';
import { useState, useRef } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, ComposedChart 
} from 'recharts';
import { toPng } from 'html-to-image';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { OrganizationPDF } from '@/components/reports/OrganizationPDF';

// Colores para el gráfico circular
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function OrganizacionPage() {
  const [activeTab, setActiveTab] = useState<'concepts' | 'lab' | 'code' | 'code2'>('concepts');
  const [inputData, setInputData] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [chartType, setChartType] = useState("bar");
  const [inputMode, setInputMode] = useState<'manual' | 'file'>('manual');
  const [copied, setCopied] = useState(false); 
  
  // Estado para la galería de imágenes del reporte (3 gráficos)
  const [reportImages, setReportImages] = useState<{bar?: string, line?: string, pie?: string}>({});
  const chartRef = useRef<HTMLDivElement>(null);

  // Helper para esperar el renderizado entre capturas
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

  // FUNCIÓN MAESTRA: Captura ráfaga de 3 gráficos sin intervención del usuario
  const handlePrepareAllCharts = async () => {
    if (chartRef.current === null) return;
    setIsCapturing(true);
    const capturedImages: {bar?: string, line?: string, pie?: string} = {};

    try {
      // 1. Forzar Barras y capturar
      setChartType("bar");
      await sleep(500); 
      capturedImages.bar = await toPng(chartRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });

      // 2. Forzar Líneas y capturar
      setChartType("line");
      await sleep(500);
      capturedImages.line = await toPng(chartRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });

      // 3. Forzar Circular y capturar
      setChartType("pie");
      await sleep(500);
      capturedImages.pie = await toPng(chartRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });

      setReportImages(capturedImages);
      setChartType("bar"); // Regresar a vista inicial
    } catch (err) {
      console.error("Error al automatizar capturas:", err);
    } finally {
      setIsCapturing(false);
    }
  };

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
        const result = await res.json();
        setStats(result);
        setReportImages({}); // Resetear imágenes si los datos cambian
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const pythonCode = `# Herramientas para organizar datos (Pandas)
import pandas as pd
datos = [12, 15, 12, 18, 20, 12, 15]
df = pd.DataFrame({'valor': datos})
tabla = df['valor'].value_counts().sort_index()
print(tabla)
tabla.plot(kind='bar', title="Gráfico de Barras")`;

  const rCode = `# Herramientas para organizar datos (R)
datos <- c(12, 15, 12, 18, 20, 12, 15)
df <- data.frame(valor = datos)
tabla <- table(df$valor)
print(tabla)
barplot(tabla, main = "Gráfico de Barras", col = "skyblue")`;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">2. Organización de Datos</h1>
        <p className="text-gray-500 mt-2">Tablas de frecuencia y representaciones gráficas (2.1 - 2.2).</p>
      </header>

      {/* Navegación por Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button onClick={() => setActiveTab('concepts')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'concepts' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>📖 Conceptos</button>
        <button onClick={() => setActiveTab('lab')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'lab' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>📊 Tablas y Gráficas</button>
        <button onClick={() => setActiveTab('code')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'code' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>💻 Código Python</button>
        <button onClick={() => setActiveTab('code2')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'code2' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>💻 Código R</button>
      </div>

      {/* TAB 1: CONCEPTOS */}
      {activeTab === 'concepts' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-blue-900 mb-2">2.1 Tablas de Frecuencia</h3>
            <p className="text-sm text-gray-600">Es una ordenación de datos en forma de tabla que muestra cuantas veces se repite cada valor o rango de valores.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-blue-900 mb-2">2.2 Tipos de Gráficas</h3>
            <p className="text-sm text-gray-600">Histogramas, polígonos de frecuencia y diagramas circulares para el análisis visual.</p>
          </div>
        </div>
      )}

      {/* TAB 2: LABORATORIO */}
      {activeTab === 'lab' && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 p-3 border rounded-lg bg-gray-50 font-mono text-sm"
                placeholder="Ej: 10, 12, 15, 18, 20..."
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
              />
              <button onClick={handleCalculate} className="bg-blue-600 text-white px-6 rounded-lg font-bold" disabled={loading}>
                {loading ? "..." : "Procesar"}
              </button>
            </div>
          </div>

          {stats && (
            <div className="space-y-6">
              {/* ACCIÓN AUTOMATIZADA DE REPORTE */}
              <div className="flex flex-wrap justify-end gap-3 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                <button 
                  onClick={handlePrepareAllCharts} 
                  disabled={isCapturing}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${isCapturing ? 'bg-gray-400 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  {isCapturing ? "📸 Capturando 3 gráficos..." : "✨ Generar Gráficos para PDF"}
                </button>

                {Object.keys(reportImages).length === 3 && (
                  <PDFDownloadLink
                    document={<OrganizationPDF data={stats} images={reportImages} />}
                    fileName={`Reporte_Stadix_${new Date().getTime()}.pdf`}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-100"
                  >
                    {({ loading: pdfLoading }) => pdfLoading ? "Generando..." : "📥 Descargar Reporte Completo"}
                  </PDFDownloadLink>
                )}
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* 2.1 TABLA */}
                <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4">📑 2.1 Tabla de Frecuencias</h3>
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 uppercase font-bold text-gray-500">
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

                {/* 2.2 GRÁFICAS (CON CORRECCIONES DE CAPTURA) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800">📈 2.2 Visualización</h3>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      {['Barras', 'Líneas', 'Circular'].map((type) => (
                        <button key={type} onClick={() => setChartType(type)} className={`px-3 py-1 text-xs font-bold rounded-md capitalize transition-all ${chartType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div ref={chartRef} style={{ width: '100%', height: '320px', backgroundColor: '#ffffff' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'bar' ? (
                        <BarChart data={stats.frequency_table}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="class_mark" /><YAxis /><Tooltip /><Legend />
                          <Bar 
                            dataKey="absolute_freq" name="fi" fill="#3b82f6" 
                            isAnimationActive={false} // Corrección: Sin animación para evitar capturas incompletas
                            radius={[4, 4, 0, 0]} 
                          />
                        </BarChart>
                      ) : chartType === 'line' ? (
                        <ComposedChart data={stats.frequency_table}>
                          <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="class_mark" /><YAxis /><Tooltip /><Legend />
                          <Line 
                            type="monotone" dataKey="absolute_freq" name="fi" stroke="#2563eb" 
                            strokeWidth={3} isAnimationActive={false} 
                          />
                        </ComposedChart>
                      ) : (
                        <PieChart>
                          <Pie 
                            data={stats.frequency_table} dataKey="absolute_freq" nameKey="class_mark" 
                            cx="50%" cy="50%" outerRadius={100} label isAnimationActive={false}
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

      {/* TABS DE CÓDIGO */}
      {activeTab === 'code' && (
        <div className="max-w-4xl mx-auto animate-fade-in p-6 bg-gray-900 rounded-2xl">
          <pre className="font-mono text-sm text-gray-300"><code>{pythonCode}</code></pre>
        </div>
      )}
      {activeTab === 'code2' && (
        <div className="max-w-4xl mx-auto animate-fade-in p-6 bg-gray-900 rounded-2xl">
          <pre className="font-mono text-sm text-gray-300"><code>{rCode}</code></pre>
        </div>
      )}
    </div>
  );
}