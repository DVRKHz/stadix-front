"use client";
import { API_URL } from '@/config/api';
import { useState } from "react";

export default function VariableAnalyzer() {
  const [inputData, setInputData] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    // Lógica de limpieza (array de strings o números)
    const rawArray = inputData.split(",").map((item) => {
        const trimmed = item.trim();
        const asNumber = Number(trimmed);
        return isNaN(asNumber) || trimmed === "" ? trimmed : asNumber;
    }).filter(item => item !== "");

    try {
      // Llamada a API (Solo endpoint de inferencia)
      const response = await fetch(`${API_URL}/api/v1/variables/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sample_data: rawArray }),
      });

      if (!response.ok) throw new Error("Error en el servidor");
      const data = await response.json();
      setResult(data);

    } catch (err) {
      setError("Error al conectar con el backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ingresa tus datos para clasificarlos (separados por coma):
        </label>
        <textarea
          className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 h-32 text-gray-900 font-mono text-sm bg-gray-50"
          placeholder="Ejemplo Cualitativo: Rojo, Verde, Azul&#10;Ejemplo Cuantitativo: 10.5, 20.1, 15.3"
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
        />
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading || !inputData.trim()}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
      >
        {loading ? "Analizando..." : "Identificar Tipo de Variable"}
      </button>

      {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}

      {/* Resultados: Solo Clasificación (Módulo 1) */}
      {result && (
        <div className="mt-8 animate-fade-in">
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Diagnóstico del Sistema</h3>
            
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-3xl font-black ${result.variable_type === 'quantitative' ? 'text-green-600' : 'text-purple-600'}`}>
                {result.variable_type === 'quantitative' ? 'Cuantitativa' : 'Cualitativa'}
              </span>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500">
              <p className="text-blue-900 text-sm leading-relaxed">
                <strong>Análisis:</strong> {result.message} <br/>
                <span className="block mt-2 opacity-80">{result.educational_info.explanation}</span>
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Gráficos sugeridos para el Módulo 2: <span className="text-gray-600 font-medium">{result.educational_info.suggested_charts.join(", ")}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}