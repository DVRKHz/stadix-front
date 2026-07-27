"use client";
import { API_URL } from '@/config/api';
import { useState, useRef } from "react";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// --- GRÁFICOS ---
import { 
  VictoryChart, VictoryBoxPlot, VictoryAxis, VictoryTheme, VictoryTooltip 
} from 'victory';

// --- IMPORTACIONES PARA PDF ---
import { PDFDownloadLink } from '@react-pdf/renderer';
import { HypothesisPDF } from '@/components/reports/HypothesisPDF';
import { toPng } from 'html-to-image';

export default function HypothesisPage() {
  const [activeTab, setActiveTab] = useState<'concepts' | 'lab' | 'code' | 'code2' | 'pdf'>('concepts');
  const [testType, setTestType] = useState<'t1' | 't2' | 'anova'>('t1');
  
  const [inputData1, setInputData1] = useState(""); 
  const [inputData2, setInputData2] = useState(""); 
  const [inputData3, setInputData3] = useState(""); 
  const [mu, setMu] = useState("0"); 

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  const [reportImage, setReportImage] = useState<string>("");
  const [preparingPdf, setPreparingPdf] = useState(false);

  const prepareReport = async () => {
    if (resultsRef.current === null) return;
    setPreparingPdf(true);
    try {
        const dataUrl = await toPng(resultsRef.current, { 
            cacheBust: true, 
            backgroundColor: '#ffffff',
            fontEmbedCSS: '', 
        });
        setReportImage(dataUrl);
    } catch (err) {
        console.error("Error capturando imagen", err);
    } finally {
        setPreparingPdf(false);
    }
  };

  const parseData = (str: string) => str.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n));

  // Datos para Recharts (T-Tests)
  const getRechartsData = () => {
      if (!result) return [];
      if (testType === 't1') {
          return [
              { name: 'Muestra', media: result.sample_mean, fill: '#3b82f6' },
              { name: 'Teórico (µ)', media: result.theoretical_mean, fill: '#dc2626' }
          ];
      } else if (testType === 't2') {
          return [
              { name: 'Grupo 1', media: result.mean_group1, fill: '#10b981' },
              { name: 'Grupo 2', media: result.mean_group2, fill: '#f59e0b' }
          ];
      }
      return [];
  };

const getVictoryData = () => {
    if (!result) return [];
    
    // Caso T-Student (1 Muestra)
    if (testType === 't1') {
        const m = result.sample_mean;
        return [{
            x: 'Muestra',
            min: Number((m * 0.8).toFixed(2)),
            q1: Number((m * 0.9).toFixed(2)),
            median: Number(m.toFixed(2)),
            q3: Number((m * 1.1).toFixed(2)),
            max: Number((m * 1.2).toFixed(2)),
            label: `Media: ${m.toFixed(2)}`
        }];
    }

    // Caso T-Student (2 Muestras)
    if (testType === 't2') {
        return [
            { m: result.mean_group1, label: 'G1' },
            { m: result.mean_group2, label: 'G2' }
        ].map(item => ({
            x: item.label,
            min: Number((item.m * 0.8).toFixed(2)),
            q1: Number((item.m * 0.9).toFixed(2)),
            median: Number(item.m.toFixed(2)),
            q3: Number((item.m * 1.1).toFixed(2)),
            max: Number((item.m * 1.2).toFixed(2))
        }));
    }

    // Caso ANOVA (3 muestras)
    if (testType === 'anova' && result.group_means) {
        return result.group_means.map((m: number, i: number) => ({
            x: `G${i+1}`,
            min: Number((m * 0.8).toFixed(2)),
            q1: Number((m * 0.9).toFixed(2)),
            median: Number(m.toFixed(2)),
            q3: Number((m * 1.1).toFixed(2)),
            max: Number((m * 1.2).toFixed(2))
        }));
    }
    return [];
};

  const handleCalculate = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setReportImage(""); 
    
    let endpoint = "";
    let payload = {};

    try {
        if (testType === 't1') {
            endpoint = "t-test-one";
            const data = parseData(inputData1);
            if (data.length < 2) throw new Error("Se requieren al menos 2 datos.");
            payload = { data, mu: Number(mu) };
        } 
        else if (testType === 't2') {
            endpoint = "t-test-ind";
            const g1 = parseData(inputData1);
            const g2 = parseData(inputData2);
            if (g1.length < 2 || g2.length < 2) throw new Error("Ambos grupos requieren datos.");
            payload = { group1: g1, group2: g2 };
        } 
        else if (testType === 'anova') {
            endpoint = "anova";
            const g1 = parseData(inputData1);
            const g2 = parseData(inputData2);
            const g3 = parseData(inputData3);
            if (g1.length < 2 || g2.length < 2 || g3.length < 2) throw new Error("Se requieren al menos 3 grupos con datos.");
            payload = { groups: [g1, g2, g3] };
        }

        const res = await fetch(`${API_URL}/api/v1/hypothesis/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Error del servidor");
        }
        
        setResult(await res.json());

    } catch (e: any) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
  };

  // CÓDIGOS ORIGINALES (RESTABLECIDOS)
  const pythonCode = `# Pruebas de Hipótesis con Scipy
from scipy import stats

# 1. T-Student (1 muestra) vs media teórica (mu=50)
data = [52, 55, 49, 58, 54]
t_stat, p_val = stats.ttest_1samp(data, 50)

# 2. T-Student (2 muestras independientes)
grupo_A = [85, 88, 90, 92]
grupo_B = [78, 82, 80, 85]
t_stat, p_val = stats.ttest_ind(grupo_A, grupo_B)

# 3. ANOVA (3 grupos)
g1 = [10, 12, 11]
g2 = [15, 18, 16]
g3 = [20, 22, 19]
f_stat, p_val = stats.f_oneway(g1, g2, g3)

print(f"Valor P: {p_val}")
if p_val < 0.05:
    print("Rechazamos H0 (Diferencia Significativa)")`;

  const rCode = `# Pruebas de Hipótesis en R (Base)

# 1. T-Student (1 muestra) vs media teórica (mu=50)
data <- c(52, 55, 49, 58, 54)
prueba1 <- t.test(data, mu = 50)
p_val1 <- prueba1$p.value

# 2. T-Student (2 muestras independientes)
grupo_A <- c(85, 88, 90, 92)
grupo_B <- c(78, 82, 80, 85)
prueba2 <- t.test(grupo_A, grupo_B)
p_val2 <- prueba2$p.value

# 3. ANOVA (3 grupos)
g1 <- c(10, 12, 11)
g2 <- c(15, 18, 16)
g3 <- c(20, 22, 19)

valores <- c(g1, g2, g3)
grupos  <- factor(c(rep("G1", 3), rep("G2", 3), rep("G3", 3)))
prueba3 <- aov(valores ~ grupos)
p_val3  <- summary(prueba3)[[1]][["Pr(>F)"]][1]

cat(sprintf("Valor P: %f\\n", p_val3))
if (p_val3 < 0.05) {
    print("Rechazamos H0 (Diferencia Significativa)")
}`;

  const handleCopy = () => { navigator.clipboard.writeText(pythonCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleCopyR = () => { navigator.clipboard.writeText(rCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Pruebas de Hipótesis</h1>
        <p className="text-gray-500 mt-2">Comparación de medias y análisis de varianza para la toma de decisiones.</p>
      </header>

      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button onClick={() => setActiveTab('concepts')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'concepts' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>📖 Conceptos Teóricos</button>
        <button onClick={() => setActiveTab('lab')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'lab' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>🧪 Laboratorio Interactivo</button>
        <button onClick={() => setActiveTab('code')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'code' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>💻 Código Python</button>
        <button onClick={() => setActiveTab('code2')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'code2' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>💻 Código R</button>
        <button onClick={() => setActiveTab('pdf')} className={`pb-3 px-6 text-sm font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${ activeTab === 'pdf' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600" }`}><span>📄</span> Guía Breve</button>
      </div>

      {activeTab === 'concepts' && (
        <div className="space-y-8 animate-fade-in">
            <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-blue-900 mb-3">¿Qué es una Prueba de Hipótesis?</h3>
                <p className="text-sm text-gray-600 mb-4">Procedimiento estadístico para rechazar o no una creencia poblacional.</p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <strong className="text-blue-800 text-xs uppercase">Hipótesis Nula (<InlineMath math="H_0" />)</strong>
                        <p className="text-xs text-gray-600 mt-1">Asume que NO hay diferencia significativa.</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <strong className="text-blue-800 text-xs uppercase">Hipótesis Alterna (<InlineMath math="H_1" />)</strong>
                        <p className="text-xs text-gray-600 mt-1">Asume que SÍ hay diferencia significativa.</p>
                    </div>
                </div>
            </section>
        </div>
      )}

      {activeTab === 'lab' && (
        <div>
            <div className="flex justify-center mb-8">
                <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm inline-flex">
                    <button onClick={() => { setTestType('t1'); setResult(null); setReportImage(""); }} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${testType === 't1' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>T-Student (1 Muestra)</button>
                    <button onClick={() => { setTestType('t2'); setResult(null); setReportImage(""); }} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${testType === 't2' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>T-Student (2 Muestras)</button>
                    <button onClick={() => { setTestType('anova'); setResult(null); setReportImage(""); }} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${testType === 'anova' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>ANOVA (3+ Grupos)</button>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
                    <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b">Datos de Entrada</h3>
                    {testType === 't1' && (
                        <div className="space-y-4">
                            <div><label className="block text-xs font-bold text-gray-500 mb-1">Datos Muestra</label><textarea className="w-full p-2 border rounded bg-gray-50 h-24 text-sm" value={inputData1} onChange={e => setInputData1(e.target.value)} placeholder="10, 12, 15..." /></div>
                            <div><label className="block text-xs font-bold text-gray-500 mb-1">Valor Hipotético</label><input type="number" className="w-full p-2 border rounded bg-gray-50" value={mu} onChange={e => setMu(e.target.value)} /></div>
                        </div>
                    )}
                    {testType === 't2' && (
                        <div className="space-y-4">
                            <div><label className="block text-xs font-bold text-blue-600 mb-1">Grupo 1</label><textarea className="w-full p-2 border rounded bg-gray-50 h-20 text-sm" value={inputData1} onChange={e => setInputData1(e.target.value)} placeholder="Datos..." /></div>
                            <div><label className="block text-xs font-bold text-green-600 mb-1">Grupo 2</label><textarea className="w-full p-2 border rounded bg-gray-50 h-20 text-sm" value={inputData2} onChange={e => setInputData2(e.target.value)} placeholder="Datos..." /></div>
                        </div>
                    )}
                    {testType === 'anova' && (
                        <div className="space-y-4">
                            <div><label className="block text-xs font-bold text-blue-600 mb-1">Grupo 1</label><input type="text" className="w-full p-2 border rounded bg-gray-50 text-sm" value={inputData1} onChange={e => setInputData1(e.target.value)} /></div>
                            <div><label className="block text-xs font-bold text-green-600 mb-1">Grupo 2</label><input type="text" className="w-full p-2 border rounded bg-gray-50 text-sm" value={inputData2} onChange={e => setInputData2(e.target.value)} /></div>
                            <div><label className="block text-xs font-bold text-red-600 mb-1">Grupo 3</label><input type="text" className="w-full p-2 border rounded bg-gray-50 text-sm" value={inputData3} onChange={e => setInputData3(e.target.value)} /></div>
                        </div>
                    )}
                    {error && <div className="text-red-500 text-xs mt-4 font-bold">{error}</div>}
                    <button onClick={handleCalculate} disabled={loading} className="w-full mt-6 bg-gray-900 text-white py-2 rounded-lg font-bold hover:bg-black transition-colors">{loading ? "Calculando..." : "Ejecutar Prueba"}</button>
                </div>

                <div>
                    {result ? (
                        <div className="animate-fade-in">
                            <div className="flex justify-end mb-4 gap-2">
                                {!reportImage ? (
                                    <button onClick={prepareReport} disabled={preparingPdf} className="px-4 py-2 bg-gray-800 text-white text-xs font-bold rounded-lg">{preparingPdf ? "Procesando..." : "📄 Generar Reporte PDF"}</button>
                                ) : (
                                    <PDFDownloadLink
                                        document={<HypothesisPDF data={result} testType={testType} chartImage={reportImage} />}
                                        fileName={`Reporte_Hipotesis.pdf`}
                                        className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg"
                                    >
                                        {/* @ts-ignore */}
                                        {({ loading }) => (loading ? 'Construyendo...' : '⬇️ Descargar PDF')}
                                    </PDFDownloadLink>
                                )}
                            </div>

                            <div ref={resultsRef} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-purple-500">
                                <h3 className="font-bold text-gray-800 mb-4">Resultados Estadísticos</h3>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <span className="text-xs font-bold text-purple-800 uppercase">Valor P</span>
                                        <div className={`text-2xl font-mono font-bold mt-1 ${result.p_value < 0.05 ? "text-green-600" : "text-red-500"}`}>{result.p_value.toFixed(5)}</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Estadístico {testType === 'anova' ? 'F' : 't'}</span>
                                        <div className="text-2xl font-mono font-bold text-gray-800 mt-1">{result.statistic.toFixed(4)}</div>
                                    </div>
                                </div>

                                <div className="h-64 w-full mb-4 bg-gray-50 rounded-lg flex items-center justify-center">
                                    {/* NUEVO RENDERIZADO UNIFICADO */}
                                    <VictoryChart 
                                        domainPadding={{ x: testType === 't1' ? 150 : 50 }} 
                                        width={450} 
                                        height={350} 
                                        theme={VictoryTheme.material}
                                    >
                                        <VictoryAxis style={{ tickLabels: { fontSize: 10, fontWeight: 'bold' } }} />
                                        <VictoryAxis dependentAxis style={{ tickLabels: { fontSize: 8 } }} />
                                        <VictoryBoxPlot
                                            data={getVictoryData()}
                                            boxWidth={30}
                                            labels
                                            labelOrientation="top"
                                            style={{
                                                min: { stroke: "#3b82f6", strokeWidth: 2 },
                                                max: { stroke: "#3b82f6", strokeWidth: 2 },
                                                q1: { fill: "#3b82f6", fillOpacity: 0.4 },
                                                q3: { fill: "#3b82f6", fillOpacity: 0.4 },
                                                median: { stroke: "#1e40af", strokeWidth: 2 },
                                                whiskers: { stroke: "#3b82f6", strokeDasharray: "4, 4" },
                                                q1Labels: { fontSize: 10, fontWeight: 'bold', fill: "#1e40af" },
                                                q3Labels: { fontSize: 10, fontWeight: 'bold', fill: "#1e40af" },
                                                medianLabels: { fontSize: 10, fontWeight: 'bold', fill: "#1e40af" },
                                                minLabels: { fontSize: 10, fontWeight: 'bold', fill: "#1e40af" },
                                                maxLabels: { fontSize: 10, fontWeight: 'bold', fill: "#1e40af" },
                                            }}
                                        />
                                    </VictoryChart>
                                </div>

                                <div className={`p-3 rounded-lg text-center text-sm font-bold ${result.p_value < 0.05 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                    {result.p_value >= 0.05 ? (
                                        <span>
                                            Dado que el valor p (<span className="font-mono">{result.p_value.toFixed(5)}</span>) es mayor al nivel de significancia de <InlineMath math="\alpha = 0.05" />, no rechazamos <InlineMath math="H_0" />.
                                            Por lo tanto, no existe evidencia estadística para concluir que hay una diferencia significativa entre las medias de estos grupos.
                                        </span>
                                    ) : (
                                        result.interpretation
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
                            <span className="text-4xl mb-2">⚖️</span>
                            <p className="text-sm">Selecciona el tipo de prueba e ingresa los datos.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* SECCIONES DE CÓDIGO CON CONTENIDO ORIGINAL */}
      {activeTab === 'code' && (
        <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto shadow-xl">
            <div className="flex justify-between mb-4">
                <span className="text-gray-400 text-xs font-mono">hipotesis.py</span>
                <button onClick={handleCopy} className="text-white text-xs bg-gray-700 px-2 py-1 rounded">
                    {copied ? "Copiado" : "Copiar"}
                </button>
            </div>
            <pre className="text-gray-300 text-sm font-mono leading-relaxed"><code>{pythonCode}</code></pre>
        </div>
      )}

      {activeTab === 'code2' && (
        <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto shadow-xl">
            <div className="flex justify-between mb-4">
                <span className="text-gray-400 text-xs font-mono">hipotesis.R</span>
                <button onClick={handleCopyR} className="text-white text-xs bg-gray-700 px-2 py-1 rounded">
                    {copied ? "Copiado" : "Copiar"}
                </button>
            </div>
            <pre className="text-gray-300 text-sm font-mono leading-relaxed"><code>{rCode}</code></pre>
        </div>
      )}

      {activeTab === 'pdf' && (
        <div className="w-full h-[600px] bg-white rounded-lg shadow-sm overflow-hidden">
          <iframe 
            src="/Manual_pruebas_de_hipotesis.pdf" 
            className="w-full h-full" 
            title="Visor PDF"
          />
        </div>
      )}

    </div>
  );
}