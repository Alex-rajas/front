import { useEffect, useState } from "react";
import * as api from "./api/api";

import DynamicForm from "./components/DynamicForm";
import ScoreCard from "./components/ScoreCard";
import ReportScreen from "./components/ReportScreen";
import PlayerStats from "./components/PlayerStats";

// Pantalla de inicio
function HomeScreen({ onContinue }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-blue-100 to-blue-300 text-center">
      <h1 className="text-4xl font-bold mb-4">MyMatch ⚡</h1>
      <p className="mb-6 text-lg max-w-md">
        Calcula la puntuación de los jugadores, visualiza su historial y gráficos de rendimiento en cada partido.
      </p>
      <button
        onClick={onContinue}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg transition"
      >
        Entrar al menú
      </button>
    </div>
  );
}

export default function App() {
  const [models, setModels] = useState(null); // Cambiado a null para mejor control
  const [categoricalFields, setCategoricalFields] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [history, setHistory] = useState([]);
  const [score, setScore] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [playerHistory, setPlayerHistory] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [loadingModels, setLoadingModels] = useState(true);
  const [error, setError] = useState(null); // Estado para errores

  // Cargar modelos e historial al inicio
  useEffect(() => {
    const init = async () => {
      try {
        setError(null);
        const data = await api.fetchModels();
        console.log("📦 Datos recibidos de fetchModels:", data);
        
        // Verificación robusta de la estructura de datos
        if (data && typeof data === 'object') {
          setModels(data.models || {});
          setCategoricalFields(data.categorical_fields || []);
        } else {
          console.warn("Estructura de datos inesperada:", data);
          setModels({});
        }
      } catch (err) {
        console.error("Error cargando modelos:", err);
        setError("Error al cargar los modelos. Verifica la conexión con el backend.");
        setModels({});
      } finally {
        setLoadingModels(false);
      }

      try {
        const hist = await api.fetchHistory();
        setHistory(hist.data || []);
      } catch (err) {
        console.error("Error cargando historial:", err);
      }
    };
    init();
  }, []);

  // Traer historial de un jugador específico
  const fetchPlayerHistory = async (player_name) => {
    try {
      const data = await api.fetchHistory();
      const filtered = data.data?.filter((item) => item.player_name === player_name) || [];
      setPlayerHistory(filtered);
    } catch (err) {
      console.error("Error cargando historial del jugador:", err);
    }
  };

  // Predicción
  const handlePredict = async (payload) => {
    try {
      const data = await api.predictPlayer(payload);
      setScore(data.score);

      const player_name = payload.player_name || "UNKNOWN";
      setPlayerData({ ...payload.stats, player_name });

      // Esperar un poco para que Supabase procese la inserción
      await new Promise(resolve => setTimeout(resolve, 500));

      // Historial completo del jugador
      await fetchPlayerHistory(player_name);

      // Actualizar historial general
      const hist = await api.fetchHistory();
      setHistory(hist.data || []);
    } catch (err) {
      console.error("Error prediciendo:", err);
      alert(err.message || "Error durante la predicción");
    }
  };

  // Pantalla de informe
  if (showReport) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col items-center">
        <button
          onClick={() => setShowReport(false)}
          className="mb-4 text-blue-500 hover:text-blue-700 transition-colors font-medium self-start"
        >
          ← Volver al menú
        </button>
        <ReportScreen />
      </div>
    );
  }

  // Pantalla de inicio
  if (showHome) return <HomeScreen onContinue={() => setShowHome(false)} />;

  // Menú de selección de modelo - CORREGIDO
  if (!selectedModel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        <h2 className="text-2xl font-bold mb-4">Selecciona un modelo</h2>

        {loadingModels ? (
          <div className="flex flex-col items-center">
            <p className="mb-4">Cargando modelos...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 mb-4">
            <p className="font-bold">{error}</p>
            <p className="text-sm">Verifica que el backend esté ejecutándose en {import.meta.env.VITE_API_URL || "http://localhost:8000"}</p>
          </div>
        ) : !models || Object.keys(models).length === 0 ? (
          <p>No hay modelos disponibles</p>
        ) : (
          <div className="flex flex-col space-y-3 w-full max-w-md">
            {Object.keys(models).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedModel(key)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition transform hover:scale-105"
              >
                {models[key]?.display_name || key}
              </button>
            ))}
            <button
              onClick={() => setShowReport(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition transform hover:scale-105"
            >
              Informe del jugador
            </button>
          </div>
        )}

        {/* Botón para recargar en caso de error */}
        {error && (
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  // Pantalla de predicción
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col items-center">
      <button
        onClick={() => {
          setSelectedModel("");
          setScore(null);
          setPlayerData(null);
          setPlayerHistory([]);
        }}
        className="mb-4 text-blue-500 hover:text-blue-700 transition-colors font-medium self-start"
      >
        ← Cambiar modelo
      </button>

      <DynamicForm
        modelKey={selectedModel}
        fields={models[selectedModel]?.fields || []}
        categoricalFields={categoricalFields}
        onSubmit={handlePredict}
      />

      {score !== null && (
        <>
          <ScoreCard score={score} />
          <PlayerStats
            playerHistory={
              playerHistory.length
                ? [...playerHistory, { ...playerData, score }]
                : [playerData]
            }
          />
        </>
      )}
    </div>
  );
}