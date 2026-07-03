"use client";
import { API_URL } from '@/config/api';
import { useState } from "react";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { SamplingPDF } from '@/components/reports/SamplingPDF';

export default function SamplingPage() {
  const [activeTab, setActiveTab] = useState<'concepts' | 'lab' | 'code' | 'code2' | 'pdf'>('concepts');
  
  // Estados (Texto para inputs decimales)
  const [confidence, setConfidence] = useState("95"); // %
  const [error, setError] = useState("5"); // %
  const [p, setP] = useState("0.5");
  const [population, setPopulation] = useState(""); // Vacío = Infinita

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    
    // Limpieza
    const clean = (val: string) => Number(val.replace(',', '.'));
    
    // Convertimos % a decimal para el backend
    const payload = {
        confidence_level: clean(confidence) / 100,
        margin_error: clean(error) / 100,
        p: clean(p),
        population: population ? clean(population) : null
    };

    try {
        const res = await fetch(`${API_URL}/api/v1/sampling/calculate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            setResult(await res.json());
        } else {
            alert("Error en los parámetros. Verifica que los valores sean lógicos.");
        }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const pythonCode = `# Cálculo de Tamaño de Muestra (n)
from scipy import stats
import math

confianza = 0.95
error = 0.05
p = 0.5
N = 1000  # Población (None si es infinita)

# Valor Z
alpha = 1 - confianza
z = stats.norm.ppf(1 - alpha/2)

numerador = (z**2) * p * (1-p)

if N:
    # Finita
    denominador = (error**2 * (N-1)) + numerador
    n = (N * numerador) / denominador
else:
    # Infinita
    n = numerador / error**2

print(f"Muestra necesaria: {math.ceil(n)}")`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rCode = `# Cálculo de Tamaño de Muestra (n)
confianza <- 0.95
error     <- 0.05
p         <- 0.5
N         <- 1000  # Población (NULL si es infinita)

# 1. Valor Z (Equivalente a stats.norm.ppf)
# qnorm devuelve el cuantil para una probabilidad dada
alpha <- 1 - confianza
z     <- qnorm(1 - alpha/2)

# 2. Cálculo del numerador
numerador <- (z^2) * p * (1 - p)

# 3. Lógica para población finita o infinita
if (!is.null(N)) {
    # Población Finita
    denominador <- (error^2 * (N - 1)) + numerador
    n <- (N * numerador) / denominador
} else {
    # Población Infinita
    n <- numerador / error^2
}

# ceiling() es el equivalente a math.ceil()
cat(sprintf("Muestra necesaria: %d\n", ceiling(n)))`;

const handleCopyR = () => {
    navigator.clipboard.writeText(rCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Cálculo de Tamaño de Muestra</h1>
        <p className="text-gray-500 mt-2">Planificación estadística para determinar cuántos datos recolectar.</p>
      </header>

      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button onClick={() => setActiveTab('concepts')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'concepts' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>📖 Conceptos Teóricos</button>
        <button onClick={() => setActiveTab('lab')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'lab' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>🧪 Laboratorio Interactivo</button>
        <button onClick={() => setActiveTab('code')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'code' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>💻 Código Python</button>
        <button onClick={() => setActiveTab('code2')} className={`pb-3 px-6 text-sm font-bold border-b-2 ${activeTab === 'code2' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>💻 Código R</button>
        <button onClick={() => setActiveTab('pdf')} className={`pb-3 px-6 text-sm font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${ activeTab === 'pdf' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600" }`}><span>📄</span> Guía Breve</button>
      </div>

      {/* CONCEPTOS */}
      {activeTab === 'concepts' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* 1. Introducción y Fórmulas */}
          <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span>🎯</span> ¿Por qué calcular el tamaño de muestra?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Estudiar a toda una población (hacer un censo) casi siempre es imposible de hacer, ya sea por dinero o tiempo. El muestreo nos permite entrevistar solo a una fracción (<InlineMath math="n" />) para obtener conclusiones científicamente válidas sobre la población total (<InlineMath math="N" />).
            </p>

            {/* Diccionario de símbolos con InlineMath */}
            <div className="bg-slate-900 text-slate-200 p-5 rounded-xl mb-6 shadow-md">
              <p className="font-bold text-amber-400 mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
                <span>📖</span> Diccionario para fórmulas de muestreo:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                <div><span className="text-blue-400 font-bold"><InlineMath math="n" /></span> = Tamaño de muestra (El resultado)</div>
                <div><span className="text-green-400 font-bold"><InlineMath math="N" /></span> = Población total (El universo)</div>
                <div><span className="text-yellow-400 font-bold"><InlineMath math="Z" /></span> = Nivel de confianza (Estándar: <InlineMath math="1.96" />)</div>
                <div><span className="text-purple-400 font-bold"><InlineMath math="p" /></span> = Prob. de éxito (Estándar: <InlineMath math="0.5" />)</div>
                <div><span className="text-pink-400 font-bold"><InlineMath math="q" /></span> = Prob. de fracaso (<InlineMath math="1 - p = 0.5" />)</div>
                <div><span className="text-orange-400 font-bold"><InlineMath math="e" /></span> = Error máximo aceptado (Ej. <InlineMath math="0.05" />)</div>
              </div>
            </div>

            {/* Las dos fórmulas */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 text-center flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-900 mb-1 uppercase tracking-wide">Población Infinita (Desconocida)</p>
                  <p className="text-[11px] text-gray-500 mb-3">Cuando no existe una lista total de sujetos (ej. conteo de turistas que visitan el parque central al año).</p>
                </div>
                <div className="bg-white py-2 rounded shadow-sm text-blue-900">
                  <BlockMath math="n = \frac{Z^2 p q}{e^2}" />
                </div>
              </div>

              <div className="bg-green-50/50 p-5 rounded-xl border border-green-100 text-center flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-green-900 mb-1 uppercase tracking-wide">Población Finita (Conocida)</p>
                  <p className="text-[11px] text-gray-500 mb-3">Cuando sabes exactamente cuántos sujetos son en total (ej. los 30,000 alumnos de la UNACH).</p>
                </div>
                <div className="bg-white py-2 rounded shadow-sm text-green-900">
                  <BlockMath math="n = \frac{N Z^2 p q}{e^2(N-1) + Z^2 p q}" />
                </div>
              </div>
            </div>
          </section>

          {/* 2. Cuadro comparativo: Tipos de Muestreo */}
          <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span>📋</span> Clasificación de los Tipos de Muestreo
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Una vez que la fórmula te dice cuántos sujetos necesitas, debes decidir a quiénes elegir. Existen dos grandes caminos en la estadística:
            </p>

            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3 border-b">Familia</th>
                    <th className="p-3 border-b">Técnica</th>
                    <th className="p-3 border-b">¿Cómo funciona?</th>
                    <th className="p-3 border-b">Ejemplo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  
                  {/* Probabilísticos */}
                  <tr className="bg-blue-50/20">
                    <td className="p-3 font-bold text-blue-800 border-r border-gray-100" rowSpan={4}>
                      Probabilístico<br/><span className="text-[9px] font-normal text-gray-400 block mt-1">Todos tienen la misma probabilidad de salir</span>
                    </td>
                    <td className="p-3 font-bold text-gray-800">Aleatorio Simple</td>
                    <td className="p-3">Es una tómbola. Le asignas un número a cada sujeto y rifas quién entra.</td>
                    <td className="p-3 italic text-gray-500">Rifar matrículas de la UNACH en Excel usando la función ALEATORIO().</td>
                  </tr>
                  <tr className="bg-blue-50/20">
                    <td className="p-3 font-bold text-gray-800">Sistemático</td>
                    <td className="p-3">Eliges un punto al azar y vas dando saltos fijos de tamaño <InlineMath math="k" />.</td>
                    <td className="p-3 italic text-gray-500">Pararte en la entrada de la facultad y encuestar a cada 10° alumno que pase.</td>
                  </tr>
                  <tr className="bg-blue-50/20">
                    <td className="p-3 font-bold text-gray-800">Estratificado</td>
                    <td className="p-3">Divides en subgrupos naturales (estratos) y sacas una muestra proporcional de cada uno.</td>
                    <td className="p-3 italic text-gray-500">Encuestar alumnos garantizando 20% de Medicina, 20% de Ingeniería, etc.</td>
                  </tr>
                  <tr className="bg-blue-50/20">
                    <td className="p-3 font-bold text-gray-800">Por Conglomerados</td>
                    <td className="p-3">La población ya viene en bloques. Eliges bloques al azar y estudias a todos adentro.</td>
                    <td className="p-3 italic text-gray-500">Rifar 4 salones completos de la prepa y encuestar a absolutamente todos sus alumnos.</td>
                  </tr>

                  {/* No probabilísticos */}
                  <tr className="bg-amber-50/10">
                    <td className="p-3 font-bold text-amber-800 border-r border-gray-100" rowSpan={2}>
                      No Probabilístico<br/><span className="text-[9px] font-normal text-gray-400 block mt-1">Selección a criterio del investigador</span>
                    </td>
                    <td className="p-3 font-bold text-gray-800">Por Conveniencia</td>
                    <td className="p-3">Entrevistas a los sujetos que tienes más accesibles o cerca de ti.</td>
                    <td className="p-3 italic text-gray-500">Hacer tu encuesta de tesis mandando el formulario únicamente a tus grupos de WhatsApp.</td>
                  </tr>
                  <tr className="bg-amber-50/10">
                    <td className="p-3 font-bold text-gray-800">Bola de Nieve</td>
                    <td className="p-3">Un sujeto que encuentras te lleva a otro con sus mismas características.</td>
                    <td className="p-3 italic text-gray-500">Buscar pacientes con una enfermedad rara en Tuxtla; uno te da el teléfono del siguiente.</td>
                  </tr>

                </tbody>
              </table>
            </div>
            
            <p className="text-[10px] text-gray-400 mt-3 text-right italic">
              *Nota pedagógica: En estadística estricta, solo el muestreo probabilístico permite calcular márgenes de error reales.
            </p>
          </section>

        </div>
      )}

      {/* LABORATORIO */}
      {activeTab === 'lab' && (
        <div className="grid lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Parámetros</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Nivel de Confianza (%)</label>
                            <input type="text" inputMode="decimal" value={confidence} onChange={e => setConfidence(e.target.value)} className="w-full p-2 border rounded bg-gray-50" placeholder="95" />
                            <p className="text-[10px] text-gray-400 mt-1">Estándar: 95% (Z=1.96) o 99% (Z=2.58)</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Margen de Error (%)</label>
                            <input type="text" inputMode="decimal" value={error} onChange={e => setError(e.target.value)} className="w-full p-2 border rounded bg-gray-50" placeholder="5" />
                            <p className="text-[10px] text-gray-400 mt-1">Error máximo aceptable (Estándar: 5%)</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Probabilidad de Éxito (p)</label>
                            <input type="text" inputMode="decimal" value={p} onChange={e => setP(e.target.value)} className="w-full p-2 border rounded bg-gray-50" placeholder="0.5" />
                            <p className="text-[10px] text-gray-400 mt-1">Si se desconoce, usar 0.5 (máxima incertidumbre)</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Población Total (N) - Opcional</label>
                            <input type="text" inputMode="numeric" value={population} onChange={e => setPopulation(e.target.value)} className="w-full p-2 border rounded bg-gray-50" placeholder="Dejar vacío si es infinita" />
                        </div>
                    </div>
                    <button onClick={handleCalculate} className="w-full mt-6 bg-gray-900 text-white py-2 rounded-lg font-bold hover:bg-black transition-colors">Calcular Muestra</button>
                </div>
            </div>

            <div className="lg:col-span-2">
                {result ? (
                    <div className="space-y-6">
                        {/* Botón PDF */}
                        <div className="flex justify-end">
                            <PDFDownloadLink
                                document={<SamplingPDF data={result} inputs={{ confidence, error, p, population: population || "Infinita" }} />}
                                fileName="Reporte_Muestreo.pdf"
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 shadow-md"
                            >
                                {/* @ts-ignore */}
                                {({ loading }) => (loading ? 'Construyendo...' : '⬇️ Descargar Reporte PDF')}
                            </PDFDownloadLink>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-blue-500 text-center">
                            <h4 className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-4">Tamaño de Muestra Requerido</h4>
                            <div className="text-6xl font-black text-blue-600 mb-2">
                                {result.sample_size}
                            </div>
                            <p className="text-gray-400 text-sm">Unidades / Personas a encuestar</p>
                            
                            <div className="mt-8 grid grid-cols-3 gap-4 text-left border-t pt-6">
                                <div>
                                    <span className="block text-xs text-gray-400 font-bold">Población</span>
                                    <span className="text-sm font-bold text-gray-700">{result.is_finite ? population : "Infinita"}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-400 font-bold">Valor Z</span>
                                    <span className="text-sm font-bold text-gray-700">{result.z_score.toFixed(3)}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-400 font-bold">Fórmula</span>
                                    <span className="text-sm font-bold text-gray-700">{result.formula.split(" ")[0]}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">Ingresa los parámetros para calcular n.</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* CÓDIGO PYTHON */}
      {activeTab === 'code' && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-3 text-gray-400 font-mono text-sm">muestreo.py</span>
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
        {/* CÓDIGO R */}
        {activeTab === 'code2' && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-3 text-gray-400 font-mono text-sm">muestreo.R</span>
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