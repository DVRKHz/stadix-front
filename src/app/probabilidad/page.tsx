"use client";
import { API_URL } from '@/config/api';
import { useState, useRef } from "react";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine, Cell } from 'recharts';

// --- IMPORTACIONES PDF ---
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ProbabilityPDF } from '@/components/reports/ProbabilityPDF';
import { toPng } from 'html-to-image';

export default function ProbabilityPage() {
  const [activeTab, setActiveTab] = useState<'concepts' | 'lab' | 'code' | 'code2' | 'pdf'>('concepts');
  const [distType, setDistType] = useState<'binomial' | 'poisson' | 'normal'>('binomial');
  const [copied, setCopied] = useState(false);
  
  // ESTADOS COMO STRING (Para permitir escritura libre de decimales)
  const [n, setN] = useState("10");
  const [p, setP] = useState("0.5");
  const [k, setK] = useState("5");
  const [lam, setLam] = useState("3");
  const [mean, setMean] = useState("0");
  const [std, setStd] = useState("1");
  const [xVal, setXVal] = useState("0");

  const [result, setResult] = useState<any>(null);

  // --- LÓGICA PDF ---
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
            fontEmbedCSS: '', // IMPORTANTE: Evita error de fuentes en Next.js
        });
        setReportImage(dataUrl);
    } catch (err) {
        console.error("Error capturando imagen", err);
    } finally {
        setPreparingPdf(false);
    }
  };

  // --- FUNCIONES GRÁFICAS AUXILIARES ---
  const factorial = (num: number): number => { if (num < 0) return -1; if (num === 0) return 1; return (num * factorial(num - 1)); }
  const combinations = (n: number, r: number) => factorial(n) / (factorial(r) * factorial(n - r));

  const generateNormalData = (mu: number, sigma: number, limitX: number) => {
    const data = [];
    const start = mu - 4 * sigma;
    const end = mu + 4 * sigma;
    const step = (end - start) / 100;
    for (let i = start; i <= end; i += step) {
      const y = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((i - mu) / sigma, 2));
      data.push({ x: i, y: y, isShaded: i <= limitX });
    }
    return data;
  };

  const generateBinomialData = (n: number, p: number, targetK: number) => {
    const data = [];
    for (let i = 0; i <= n; i++) {
        const prob = combinations(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i);
        data.push({ k: i, prob: prob, isTarget: i === targetK });
    }
    return data;
  };

  const generatePoissonData = (lam: number, targetK: number) => {
    const data = [];
    const limit = Math.max(15, Math.ceil(lam * 3)); 
    for (let i = 0; i <= limit; i++) {
        const prob = (Math.pow(lam, i) * Math.exp(-lam)) / factorial(i);
        data.push({ k: i, prob: prob, isTarget: i === targetK });
    }
    return data;
  };

  // --- CÁLCULO ---
  const handleCalculate = async () => {
    let endpoint = "";
    let payload = {};
    
    // Limpieza de datos (Convierte "5,2" a 5.2)
    const clean = (val: string | number) => { 
        if (typeof val === 'number') return val;
        if (!val) return 0; 
        return Number(val.replace(',', '.')); 
    };

    if (distType === 'binomial') { endpoint = "binomial"; payload = { n: clean(n), p: clean(p), k: clean(k) }; }
    else if (distType === 'poisson') { endpoint = "poisson"; payload = { lam: clean(lam), k: clean(k) }; }
    else { endpoint = "normal"; payload = { mean: clean(mean), std: clean(std), x: clean(xVal) }; }

    try {
        const res = await fetch(`${API_URL}/api/v1/probability/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            const data = await res.json();
            if (distType === 'normal') data.chartData = generateNormalData(clean(mean), clean(std), clean(xVal));
            else if (distType === 'binomial') data.chartData = generateBinomialData(clean(n), clean(p), clean(k));
            else if (distType === 'poisson') data.chartData = generatePoissonData(clean(lam), clean(k));
            
            setResult(data);
            setReportImage(""); // Limpiamos reporte previo
        }
    } catch (e) { console.error(e); }
  };

  // --- CÓDIGO PYTHON DIDÁCTICO ---
  const pythonCode = `# Cálculo de Probabilidades con Scipy
from scipy import stats

# 1. Distribución Binomial (n=10, p=0.5, k=5)
# pmf = Probability Mass Function (Probabilidad Exacta)
prob_binom = stats.binom.pmf(5, 10, 0.5)
print(f"P(X=5) Binomial: {prob_binom:.4f}")

# 2. Distribución Poisson (lambda=3, k=2)
prob_poisson = stats.poisson.pmf(2, 3)
print(f"P(X=2) Poisson: {prob_poisson:.4f}")

# 3. Distribución Normal (media=0, std=1, x=1.96)
# cdf = Cumulative Density Function (Área a la izquierda)
prob_normal = stats.norm.cdf(1.96, loc=0, scale=1)
print(f"P(Z < 1.96) Normal: {prob_normal:.4f}")`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

   // --- CÓDIGO R DIDÁCTICO ---
   const rCode = `# Cálculo de Probabilidades con R

# 1. Distribución Binomial (n=10, p=0.5, k=5)
# 'd' significa Densidad/Probabilidad puntual (PMF)
prob_binom <- dbinom(5, size = 10, prob = 0.5)
cat(sprintf("P(X=5) Binomial: %.4f\n", prob_binom))

# 2. Distribución Poisson (lambda=3, k=2)
# 'd' para la probabilidad exacta de un evento
prob_poisson <- dpois(2, lambda = 3)
cat(sprintf("P(X=2) Poisson: %.4f\n", prob_poisson))

# 3. Distribución Normal (media=0, std=1, x=1.96)
# 'p' significa Probabilidad acumulada (CDF)
prob_normal <- pnorm(1.96, mean = 0, sd = 1)
cat(sprintf("P(Z < 1.96) Normal: %.4f\n", prob_normal))`;

   const handleCopyR = () => {
    navigator.clipboard.writeText(rCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
   };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Distribuciones de Probabilidad</h1>
        <p className="text-gray-500 mt-2">Modelos matemáticos para calcular la incertidumbre.</p>
      </header>

      

      {/* Navegación Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button onClick={() => setActiveTab('concepts')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'concepts' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>📖 Conceptos Teóricos</button>
        <button onClick={() => setActiveTab('lab')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'lab' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>🧪 Laboratorio Interactivo</button>
        <button onClick={() => setActiveTab('code')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'code' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>💻 Código Python</button>
        <button onClick={() => setActiveTab('code2')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'code2' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>💻 Código R</button>
        <button onClick={() => setActiveTab('pdf')} className={`pb-3 px-6 text-sm font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${ activeTab === 'pdf' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600" }`}><span>📄</span> Guía Breve</button>
      </div>

      {/* --- TAB 1: CONCEPTOS (TEORÍA COMPLETA CON LATEX) --- */}
      {activeTab === 'concepts' && (
        <div className="space-y-8 animate-fade-in">
            
            {/* Distribución Binomial */}
            <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <span>🪙</span> Distribución Binomial
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Modela el número de éxitos en una secuencia de <InlineMath math="n" /> ensayos independientes entre sí, con una probabilidad fija <InlineMath math="p" /> de ocurrencia del éxito.
                </p>
                <div className="bg-blue-50 p-4 rounded-xl mb-4 text-center">
                    <BlockMath math="P(X=k) = \binom{n}{k} p^k (1-p)^{n-k}" />
                </div>
                <ul className="text-xs text-gray-500 space-y-1 list-disc pl-5">
                    <li><strong>Experimento Bernoulli:</strong> Solo dos resultados posibles (éxito/fracaso).</li>
                    <li><strong>Independencia:</strong> El resultado de un ensayo no afecta al siguiente.</li>
                </ul>
            </section>

            {/* Distribución Poisson */}
            <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                    <span>📞</span> Distribución de Poisson
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Expresa la probabilidad de que ocurra un número determinado de eventos durante cierto período de tiempo (o espacio), dada una tasa promedio de ocurrencia (<InlineMath math="\lambda" />).
                </p>
                <div className="bg-green-50 p-4 rounded-xl mb-4 text-center">
                    <BlockMath math="P(X=k) = \frac{e^{-\lambda} \lambda^k}{k!}" />
                </div>
                <ul className="text-xs text-gray-500 space-y-1 list-disc pl-5">
                    <li><strong>Eventos raros:</strong> Útil para sucesos poco frecuentes.</li>
                    <li><strong>Continuidad:</strong> El tiempo o espacio es continuo, pero el evento es discreto.</li>
                </ul>
            </section>

            {/* Distribución Normal */}
            <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <span>🔔</span> Distribución Normal (Gaussiana)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Es la distribución continua más importante. Tiene forma de campana y es simétrica respecto a su media (<InlineMath math="\mu" />).
                </p>
                <div className="bg-purple-50 p-4 rounded-xl mb-4 text-center">
                    <p className="text-xs text-purple-800 mb-2 font-bold">Fórmula de Estandarización (Z)</p>
                    <BlockMath math="Z = \frac{X - \mu}{\sigma}" />
                </div>
                <ul className="text-xs text-gray-500 space-y-1 list-disc pl-5">
                    <li><strong>Simetría:</strong> Media = Mediana = Moda.</li>
                    <li><strong>Regla Empírica:</strong> El 68% de los datos está a <InlineMath math="\pm 1\sigma" />, el 95% a <InlineMath math="\pm 2\sigma" />.</li>
                </ul>
            </section>
        </div>
      )}

      {/* --- TAB 2: LABORATORIO (CALCULADORA) --- */}
      {activeTab === 'lab' && (
        <div className="space-y-8 animate-fade-in">
            
            
            <div className="flex justify-center">
                <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm inline-flex">
                    {['binomial', 'poisson', 'normal'].map((type) => (
                        <button
                            key={type}
                            onClick={() => { setDistType(type as any); setResult(null); setReportImage(""); }}
                            className={`px-6 py-2 text-sm font-bold rounded-lg capitalize transition-all ${distType === type ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* INPUTS */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Parámetros</h3>
                        {distType === 'binomial' && (
                            <div className="space-y-4">
                                <div><label className="text-xs font-bold text-gray-500">n (Ensayos)</label><input type="text" inputMode="numeric" value={n} onChange={e => setN(e.target.value)} className="w-full p-2 border rounded bg-gray-50" /></div>
                                <div><label className="text-xs font-bold text-gray-500">p (Probabilidad)</label><input type="text" inputMode="decimal" value={p} onChange={e => setP(e.target.value)} className="w-full p-2 border rounded bg-gray-50" /></div>
                                <div><label className="text-xs font-bold text-gray-500">k (Éxitos)</label><input type="text" inputMode="numeric" value={k} onChange={e => setK(e.target.value)} className="w-full p-2 border rounded bg-gray-50" /></div>
                            </div>
                        )}
                        {distType === 'poisson' && (
                            <div className="space-y-4">
                                <div><label className="text-xs font-bold text-gray-500">Lambda</label><input type="text" inputMode="decimal" value={lam} onChange={e => setLam(e.target.value)} className="w-full p-2 border rounded bg-gray-50" /></div>
                                <div><label className="text-xs font-bold text-gray-500">k</label><input type="text" inputMode="numeric" value={k} onChange={e => setK(e.target.value)} className="w-full p-2 border rounded bg-gray-50" /></div>
                            </div>
                        )}
                        {distType === 'normal' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div><label className="text-xs font-bold text-gray-500">Media</label><input type="text" inputMode="decimal" value={mean} onChange={e => setMean(e.target.value)} className="w-full p-2 border rounded bg-gray-50" /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Desv. Est</label><input type="text" inputMode="decimal" value={std} onChange={e => setStd(e.target.value)} className="w-full p-2 border rounded bg-gray-50" /></div>
                                </div>
                                <div><label className="text-xs font-bold text-gray-500">Valor X</label><input type="text" inputMode="decimal" value={xVal} onChange={e => setXVal(e.target.value)} className="w-full p-2 border rounded bg-gray-50" /></div>
                            </div>
                        )}
                        <button onClick={handleCalculate} className="w-full mt-6 bg-gray-900 text-white py-2 rounded-lg font-bold hover:bg-black transition-colors">Calcular Probabilidad</button>
                    </div>
                </div>

                {/* RESULTADOS */}
                <div className="lg:col-span-2 space-y-6">
                    {result ? (
                        <div className="animate-fade-in">
                        
                        {/* BOTONES REPORTE */}
                        <div className="flex justify-end mb-4 gap-2">
                            {!reportImage ? (
                                <button 
                                    onClick={prepareReport}
                                    disabled={preparingPdf}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-xs font-bold rounded-lg hover:bg-gray-900 transition-all"
                                >
                                    {preparingPdf ? "Preparando..." : "📄 Generar Reporte PDF"}
                                </button>
                            ) : (
                                <PDFDownloadLink
                                    document={
                                        <ProbabilityPDF 
                                            data={result} 
                                            inputs={{ n, p, k, lam, mean, std, xVal }}
                                            distType={distType}
                                            chartImage={reportImage} 
                                        />
                                    }
                                    fileName={`Reporte_Probabilidad_${new Date().toISOString().split('T')[0]}.pdf`}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all shadow-md"
                                >
                                    {/* @ts-ignore */}
                                    {({ loading }) => (loading ? 'Construyendo...' : '⬇️ Descargar PDF')}
                                </PDFDownloadLink>
                            )}
                        </div>

                        {/* ÁREA DE CAPTURA */}
                        <div ref={resultsRef} className="p-4 bg-white rounded-xl border border-gray-100">
                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                                    <span className="text-xs font-bold text-green-800 uppercase">Probabilidad Resultado</span>
                                    <div className="text-3xl font-bold text-green-900 mt-2">
                                        {distType === 'normal' 
                                            ? (result.prob_left * 100).toFixed(2) + "%" 
                                            : (result.prob_exact * 100).toFixed(4) + "%"
                                        }
                                    </div>
                                    <div className="text-xs text-green-700 mt-1">
                                        {distType === 'normal' ? `Área a la izquierda de X=${xVal}` : `Probabilidad exacta de k=${k}`}
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                    {distType === 'normal' ? (
                                        <>
                                            <span className="text-xs font-bold text-gray-500 uppercase">Puntaje Z</span>
                                            <div className="text-2xl font-bold text-gray-800 mt-2">{result.z_score.toFixed(4)}</div>
                                            <div className="text-xs text-gray-500 mt-1">Desviaciones estándar desde la media</div>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xs font-bold text-gray-500 uppercase">Esperanza (Media)</span>
                                            <div className="text-2xl font-bold text-gray-800 mt-2">{result.expected_value.toFixed(2)}</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Gráfica */}
                            <div className="bg-white rounded-2xl border border-gray-200 h-96 p-4">
                                <h4 className="font-bold text-gray-700 mb-4 text-center">Visualización de la Distribución</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    {distType === 'normal' ? (
                                        <AreaChart data={result.chartData}>
                                            <defs>
                                                <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="x" type="number" domain={['auto', 'auto']} tickFormatter={(v) => v.toFixed(1)} />
                                            <YAxis hide />
                                            <Area type="monotone" dataKey="y" stroke="#3b82f6" fill="url(#colorNormal)" strokeWidth={2} />
                                            <ReferenceLine x={Number(xVal)} stroke="red" label={{ value: "X", position: 'top', fill: 'red', fontSize: 12 }} />
                                            <ReferenceLine x={Number(mean)} stroke="#ccc" strokeDasharray="3 3" />
                                        </AreaChart>
                                    ) : (
                                        <BarChart data={result.chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="k" />
                                            <YAxis />
                                            <Bar dataKey="prob" name="Probabilidad" radius={[4, 4, 0, 0]}>
                                                {result.chartData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.isTarget ? '#16a34a' : '#bfdbfe'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="text-center text-gray-400">
                                <p className="text-4xl mb-2">📉</p>
                                <p>Ingresa los parámetros y calcula para ver la gráfica.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
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
                <span className="ml-3 text-gray-400 font-mono text-sm">probabilidad.py</span>
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
               <h4 className="font-bold text-blue-900 text-sm">Nota sobre Scipy Stats</h4>
               <div className="text-blue-800 text-xs mt-1">
                 En Python, usamos la librería <strong>scipy.stats</strong> para acceder a estas funciones:
                 <ul className="list-disc pl-4 mt-2 space-y-1">
                   <li><code>pmf</code> (Probability Mass Function): Para distribuciones discretas (Binomial, Poisson). Da la probabilidad exacta.</li>
                   <li><code>cdf</code> (Cumulative Density Function): Para distribuciones continuas (Normal). Da el área acumulada a la izquierda.</li>
                 </ul>
               </div>
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
                <span className="ml-3 text-gray-400 font-mono text-sm">probabilidad.R</span>
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
               <h4 className="font-bold text-blue-900 text-sm">Nota sobre R Stats</h4>
               <div className="text-blue-800 text-xs mt-1">
                 En R, usamos funciones con prefijos:
                 <ul className="list-disc pl-4 mt-2 space-y-1">
                   <li><code>d</code> (Density): Probabilidad puntual (PMF) o acumulada (CDF)</li>
                   <li><code>p</code> (Probability): Probabilidad acumulada (CDF)</li>
                   <li><code>q</code> (Quantile): Valor de la variable dado un percentil</li>
                   <li><code>r</code> (Random): Genera valores aleatorios de una distribución</li>
                 </ul>
               </div>
             </div>
          </div>

        </div>
      )}

      {activeTab === 'pdf' && (
        <div className="w-full h-[600px] bg-white rounded-lg shadow-sm overflow-hidden">
          <iframe 
            src="/Manual_probabilidad.pdf" 
            className="w-full h-full" 
            title="Visor PDF"
          />
        </div>
      )}

    </div>
  );
}