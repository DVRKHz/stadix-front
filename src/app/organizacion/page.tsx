"use client";
import { API_URL } from '@/config/api';
import { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area
} from 'recharts';

import { ReferenceLine } from 'recharts';

// Colores para el gráfico circular
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function OrganizacionPage() {
  const [activeTab, setActiveTab] = useState<'concepts' | 'lab' | 'code' | 'code2'>('concepts');
  const [inputData, setInputData] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState("bar"); // bar, line, pie, box

  const [inputMode, setInputMode] = useState<'manual' | 'file'>('manual');

  const [copied, setCopied] = useState(false); 

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
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Código Python para mostrar en la pestaña didáctica
  const pythonCode = `# Herramientas para organizar datos (Pandas)

import pandas as pd

# Lista de datos brutos
datos = [12, 15, 12, 18, 20, 12, 15]

# Crear una estructura de tabla (DataFrame)
df = pd.DataFrame({'valor': datos})

# 1. Generar Tabla de Frecuencias
# value_counts() cuenta cuántas veces aparece cada valor
# sort_index() los ordena de menor a mayor
tabla = df['valor'].value_counts().sort_index()

print("--- Tabla de Frecuencias ---")
print(tabla)

# 2. Generar Gráficos
# plot() crea visualizaciones directas desde la tabla
tabla.plot(kind='bar', title="Gráfico de Barras")
# kind='pie' para circular, kind='box' para caja`;

  // Codigo en R para mostrar en la pestaña didáctica
  const rCode = `# Herramientas para organizar datos (R)

# Lista de datos brutos (en R se usan vectores con c())
datos <- c(12, 15, 12, 18, 20, 12, 15)

# Crear una estructura de tabla (Data Frame)
df <- data.frame(valor = datos)

# 1. Generar Tabla de Frecuencias
# table() es la función nativa que cuenta las frecuencias
tabla <- table(df$valor)

print("--- Tabla de Frecuencias ---")
print(tabla)

# 2. Generar Gráficos
# barplot() crea visualizaciones directas desde la tabla
barplot(tabla, main = "Gráfico de Barras", col = "skyblue")

# Para otros tipos:
# pie(tabla)          # Para circular
# boxplot(df$valor)    # Para caja (se usa el dato bruto, no la tabla)`;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">2. Organización de Datos</h1>
        <p className="text-gray-500 mt-2">Tablas de frecuencia y representaciones gráficas (2.1 - 2.2).</p>
      </header>

      {/* Tabs */}
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
            <p className="text-sm text-gray-600">Es una ordenación de datos en forma de tabla que muestra cuantas veces se repite cada valor o rango de valores (intervalos).</p>
            <ul className="text-xs mt-3 space-y-1 text-gray-500">
              <li>• <strong>fi (Absoluta):</strong> Conteo simple.</li>
              <li>• <strong>Fi (Acumulada):</strong> Suma progresiva.</li>
              <li>• <strong>hi (Relativa):</strong> Proporción del total (%).</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-blue-900 mb-2">2.2 Tipos de Gráficas</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2"><span className="p-1 bg-blue-100 rounded">📊 Barras</span> Para comparar frecuencias de categorías o intervalos (Histograma).</li>
              <li className="flex items-center gap-2"><span className="p-1 bg-green-100 rounded">📈 Líneas</span> (Polígono) Muestra la tendencia o forma de la distribución uniendo puntos medios.</li>
              <li className="flex items-center gap-2"><span className="p-1 bg-yellow-100 rounded">🍰 Circular</span> Muestra partes de un todo (porcentajes).</li>
              <li className="flex items-center gap-2"><span className="p-1 bg-purple-100 rounded">📦 Caja</span> (Boxplot) Muestra dispersión, cuartiles y valores atípicos.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: LABORATORIO (TABLAS Y GRÁFICAS) */}
      {activeTab === 'lab' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Panel de Entrada (Manual o Archivo) */}
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

            {/* Opción A: Manual */}
            {inputMode === 'manual' && (
                <div className="animate-fade-in">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ingresa tus datos numéricos:</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-1 p-3 border rounded-lg bg-gray-50 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ej: 10, 12, 15, 18, 20, 12, 15..."
                        value={inputData}
                        onChange={(e) => setInputData(e.target.value)}
                      />
                      <button 
                        onClick={handleCalculate}
                        className="bg-blue-600 text-white px-6 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                        disabled={loading}
                      >
                        {loading ? "..." : "Procesar"}
                      </button>
                    </div>
                </div>
            )}

            {/* Opción B: Archivo (Reutilizamos endpoint de Descriptiva) */}
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
                                
                                const res = await fetch(`${API_URL}/api/v1/descriptive/upload`, {
                                    method: "POST",
                                    body: formData,
                                });
                                if (res.ok) {
                                    setStats(await res.json());
                                } else {
                                    alert("Error al procesar el archivo.");
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
                        <p className="text-sm font-bold text-gray-700">Arrastra tu archivo Excel o CSV</p>
                        <p className="text-xs text-gray-400 mt-1">El sistema generará la tabla de frecuencias automáticamente.</p>
                    </div>
                </div>
            )}
          </div>

          {stats && (
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* 2.1 TABLA DE FRECUENCIAS */}
              <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📑</span> 2.1 Tabla de Frecuencias
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                      <tr>
                        <th className="p-2">Clase</th>
                        <th className="p-2">fi</th>
                        <th className="p-2">%</th>
                        <th className="p-2">Fi</th>
                      </tr>
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

              {/* 2.2 GRÁFICAS */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <span>📈</span> 2.2 Visualización Gráfica
                  </h3>
                  {/* Selector de Gráfica */}
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['bar', 'line', 'pie'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setChartType(type)}
                        className={`px-3 py-1 text-xs font-bold rounded-md capitalize transition-all ${chartType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        {type === 'box' ? 'Caja' : type === 'bar' ? 'Barras' : type === 'line' ? 'Líneas' : 'Circular'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-80 w-full bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <BarChart data={stats.frequency_table}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="class_mark" label={{ value: 'Marca de Clase', position: 'insideBottom', offset: -5 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="absolute_freq" name="Frecuencia Absoluta" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : chartType === 'line' ? (
                      <ComposedChart data={stats.frequency_table}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="class_mark" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {/* <Area type="monotone" dataKey="absolute_freq" fill="#bfdbfe" stroke="#3b82f6" /> */}
                        <Line type="monotone" dataKey="absolute_freq" name="Frecuencia Absoluta" stroke="#2563eb" strokeWidth={3} dot={{r:4}} />
                      </ComposedChart>
                    ) : (
                      
                      <PieChart>
                        <Pie
                          data={stats.frequency_table}
                          dataKey="absolute_freq"
                          nameKey="class_mark"
                          cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label
                        >
                          {stats.frequency_table.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CÓDIGO (ESTILIZADO) */}
      {activeTab === 'code' && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            {/* Barra superior estilo editor */}
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-3 text-gray-400 font-mono text-sm">generar_graficas.py</span>
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
                <code>{pythonCode}</code>
              </pre>
            </div>
          </div>

          {/* Explicación Fuera del Contenedor */}
          <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-bold text-blue-900 text-sm">¿Cómo funciona este código?</h4>
              <div className="text-blue-800 text-xs mt-1">
                En Python, usamos la librería <strong>Pandas</strong> para imitar lo que hace Excel:
                <ul className="list-disc pl-4 mt-2 space-y-1">
                  <li><code>DataFrame</code>: Es el equivalente a una hoja de cálculo con filas y columnas.</li>
                  <li><code>value_counts()</code>: Agrupa automáticamente los valores repetidos (hace el conteo de $f_i$).</li>
                  <li><code>plot()</code>: Es la función mágica que convierte esos números en imágenes (barras, pastel, etc).</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* TAB 4: CÓDIGO EN R (ESTILIZADO) */}
      {activeTab === 'code2' && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            {/* Barra superior estilo editor */}
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-3 text-gray-400 font-mono text-sm">generar_graficas.R</span>
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
                <code>{rCode}</code>
              </pre>
            </div>
          </div>

          {/* Explicación Fuera del Contenedor */}
          <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-bold text-blue-900 text-sm">¿Cómo funciona este código?</h4>
              <div className="text-blue-800 text-xs mt-1">
                En R, usamos la librería <strong>ggplot2</strong> para imitar lo que hace Excel:
                <ul className="list-disc pl-4 mt-2 space-y-1">
                  <li><code>DataFrame</code>: Es el equivalente a una hoja de cálculo con filas y columnas.</li>
                  <li><code>table()</code>: Agrupa automáticamente los valores repetidos (hace el conteo de $f_i$).</li>
                  <li><code>ggplot()</code>: Es la función mágica que convierte esos números en imágenes (barras, pastel, etc).</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}