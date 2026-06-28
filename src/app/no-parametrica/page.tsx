"use client";
import { API_URL } from '@/config/api';
import { useState, useRef } from "react";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { ChiSquarePDF } from '@/components/reports/ChiSquarePDF';
import { toPng } from 'html-to-image';

export default function NonParametricPage() {
  const [activeTab, setActiveTab] = useState<'concepts' | 'lab' | 'code' | 'code2'>('concepts');
  const [inputMatrix, setInputMatrix] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [inputMode, setInputMode] = useState<'manual' | 'file'>('manual');
  
  // Estados para el reporte PDF
  const [preparingPdf, setPreparingPdf] = useState(false);
  const [reportImage, setReportImage] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Función para capturar el área de resultados antes de generar PDF
  const prepareReport = async () => {
    if (resultsRef.current === null) return;
    setPreparingPdf(true);
    try {
        // Capturamos el div "resultsRef" como PNG
        const dataUrl = await toPng(resultsRef.current, { 
            cacheBust: true, 
            backgroundColor: '#ffffff', 
            fontEmbedCSS: '',
            style: { padding: '15px' }
        });
        setReportImage(dataUrl);
    } catch (err) {
        console.error("Error generando imagen para reporte", err);
    } finally {
        setPreparingPdf(false);
    }
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setReportImage(null); // Resetear imagen al hacer nuevo cálculo

    try {
        // Parsear texto a matriz
        const rows = inputMatrix.trim().split("\n");
        const matrix = rows.map(row => 
            row.split(",").map(val => parseInt(val.trim())).filter(n => !isNaN(n))
        ).filter(r => r.length > 0);

        if (matrix.length < 2) throw new Error("Debes ingresar al menos 2 filas.");
        
        const cols = matrix[0].length;
        if (matrix.some(r => r.length !== cols)) throw new Error("Todas las filas deben tener la misma cantidad de columnas.");

        const res = await fetch(`${API_URL}/api/v1/nonparametric/chi-square`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ observed_data: matrix })
        });

        if (!res.ok) throw new Error("Error en el cálculo del servidor.");
        setResult(await res.json());

    } catch (e: any) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
  };

  const pythonCode = `# Prueba Chi-Cuadrada de Independencia
from scipy.stats import chi2_contingency

# Tabla de contingencia (Matriz de observados)
tabla = [
    [10, 20],
    [20, 40]
]

chi2, p, dof, expected = chi2_contingency(tabla)

print(f"Estadístico Chi2: {chi2}")
print(f"Valor p: {p}")
if p < 0.05:
    print("Hay relación significativa (Dependencia)")
else:
    print("Son independientes")`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rCode = `# Prueba Chi-Cuadrada de Independencia
tabla <- matrix(c(10, 20, 
                  20, 40), 
                nrow = 2, byrow = TRUE)

resultado <- chisq.test(tabla)
chi2 <- resultado$statistic
p    <- resultado$p.value

cat(sprintf("Estadístico Chi2: %.4f\\n", chi2))
cat(sprintf("Valor p: %.4f\\n", p))

if (p < 0.05) {
    print("Hay relación significativa (Dependencia)")
} else {
    print("Son independientes")
}`;

  const handleCopyR = () => {
    navigator.clipboard.writeText(rCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Estadística No Paramétrica</h1>
        <p className="text-gray-500 mt-2">Métodos para datos cualitativos o que no siguen una distribución normal.</p>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button onClick={() => setActiveTab('concepts')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'concepts' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>📖 Conceptos</button>
        <button onClick={() => setActiveTab('lab')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'lab' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>🔬 Prueba Chi-Cuadrada</button>
        <button onClick={() => setActiveTab('code')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'code' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>💻 Código Python</button>
        <button onClick={() => setActiveTab('code2')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'code2' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>💻 Código R</button>
      </div>

      {/* CONCEPTOS */}
      {activeTab === 'concepts' && (
        <div className="space-y-6 animate-fade-in">
           <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-3">¿Qué significa "No Paramétrica"?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                A diferencia de la estadística paramétrica (que asume que los datos siguen una curva normal), estas pruebas son "libres de distribución". Se usan cuando:
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm text-gray-600 space-y-1">
                <li>Los datos son <strong>Cualitativos</strong> (Nominales u Ordinales).</li>
                <li>Hay valores atípicos extremos (Outliers).</li>
                <li>La muestra es muy pequeña.</li>
              </ul>
           </section>

           <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-blue-900 mb-3">Prueba de Independencia Chi-Cuadrada (<InlineMath math="\chi^2" />)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Determina si existe una relación significativa entre dos variables categóricas.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                 <BlockMath math="\chi^2 = \sum \frac{(O_i - E_i)^2}{E_i}" />
              </div>
           </section>
        </div>
      )}

      {/* LABORATORIO */}
      {activeTab === 'lab' && (
        <div className="space-y-8 animate-fade-in">

          {/* Panel de Entrada */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
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

             {inputMode === 'manual' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 mb-2">Tabla de Contingencia (Matriz)</h3>
                <textarea 
                    className="w-full p-4 border rounded-lg bg-gray-50 font-mono text-sm h-32 focus:ring-2 focus:ring-blue-500"
                    placeholder={`Ejemplo:\n10, 20\n15, 25`}
                    value={inputMatrix}
                    onChange={(e) => setInputMatrix(e.target.value)}
                />
                {error && <div className="text-red-500 text-xs mt-2 font-bold">{error}</div>}
                <button 
                    onClick={handleCalculate}
                    disabled={loading || !inputMatrix.trim()}
                    className="w-full py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black disabled:bg-gray-300 transition-colors"
                >
                    {loading ? "Calculando..." : "Ejecutar Prueba Chi-Cuadrada"}
                </button>
              </div>
             )}

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
                            setResult(null);
                            setReportImage(null);
                            const formData = new FormData();
                            formData.append("file", file);
                            try {
                                const res = await fetch(`${API_URL}/api/v1/nonparametric/upload`, { method: "POST", body: formData });
                                if (!res.ok) throw new Error("Error al procesar archivo.");
                                setResult(await res.json());
                            } catch (err: any) { setError(err.message); } finally { setLoading(false); }
                        }}
                    />
                    <div className="pointer-events-none">
                        <div className="text-4xl mb-2">📈</div>
                        <p className="text-sm font-bold text-gray-700">Sube tu Excel o CSV</p>
                    </div>
                </div>
             )}
           </div>

           {result && (
             <div className="space-y-6">
                
                {/* BARRA DE HERRAMIENTAS PDF */}
                <div className="flex justify-end items-center bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm gap-4">
                    {!reportImage ? (
                        <button 
                            onClick={prepareReport} 
                            disabled={preparingPdf}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                        >
                            {preparingPdf ? "📸 Capturando resultados..." : "📄 Generar Reporte PDF"}
                        </button>
                    ) : (
                        <div className="flex items-center gap-4 animate-fade-in">
                            <span className="text-xs text-green-600 font-bold">¡Reporte Listo!</span>
                            <PDFDownloadLink 
                                document={<ChiSquarePDF data={result} captureImage={reportImage} />} 
                                fileName={`Reporte_Chi2_${new Date().getTime()}.pdf`}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors"
                            >
                                ⬇️ Descargar PDF
                            </PDFDownloadLink>
                            <button onClick={() => setReportImage(null)} className="text-xs text-gray-500 hover:text-red-500 underline">Nueva captura</button>
                        </div>
                    )}
                </div>

                {/* CONTENEDOR DE RESULTADOS (CAPTURA PDF) */}
                <div ref={resultsRef} className="grid lg:grid-cols-2 gap-6 bg-white p-2 rounded-xl">
                    {/* Resultados Estadísticos */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-4">Resultados de la Prueba</h4>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Estadístico $\chi^2$:</span>
                            <span className="font-mono font-bold text-lg">{result.statistic.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Valor P (p-value):</span>
                            <span className={`font-mono font-bold text-lg ${result.is_significant ? "text-green-600" : "text-gray-600"}`}>{result.p_value.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-600">Grados de libertad:</span>
                            <span className="font-mono font-bold">{result.dof}</span>
                        </div>
                        <div className={`p-3 rounded-lg text-sm font-bold text-center ${result.is_significant ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                            {result.interpretation}
                        </div>
                    </div>

                    {/* Matriz de Esperados */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h4 className="font-bold text-gray-700 mb-4 text-xs uppercase">Frecuencias Esperadas</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-center">
                                <tbody>
                                    {result.expected_frequencies.map((row: number[], i: number) => (
                                        <tr key={i} className="border-b border-gray-200 last:border-0">
                                            {row.map((val, j) => (
                                                <td key={j} className="p-2 font-mono text-gray-600 bg-white border border-gray-100 m-1">{val.toFixed(2)}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
             </div>
           )}
        </div>
      )}

      {/* CÓDIGO PYTHON*/}
      {activeTab === 'code' && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-3 text-gray-400 font-mono text-sm">chi_cuadrada.py</span>
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

      {/* CÓDIGO R*/}
      {activeTab === 'code2' && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-3 text-gray-400 font-mono text-sm">chi_cuadrada.R</span>
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
    </div>
  );
}