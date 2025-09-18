import { useState } from "react";

// Mapeo de nombres legibles
const keyNames = {
  player_name: "Nombre del jugador",
  competition: "Competición",
  date: "Fecha",
  match: "Partido",
  team: "Equipo",
  pos: "Posición",
  pos_role: "Posición específica",
  rater: "Evaluador",
  is_human: "Evaluador humano",
  original_rating: "Valoración",
  goals: "Goles",
  assists: "Asistencias",
  shots_ontarget: "Tiros a portería",
  shots_offtarget: "Tiros fuera",
  shotsblocked: "Tiros bloqueados",
  shots_offtarget_blocked: "Tiros fuera bloqueados",
  chances2score: "Ocasiones de gol",
  drib_success: "Regates exitosos",
  drib_unsuccess: "Regates fallidos",
  keypasses: "Pases clave",
  touches: "Toques",
  passes_acc: "Pases exitosos",
  passes_inacc: "Pases fallidos",
  crosses_acc: "Centros exitosos",
  crosses_inacc: "Centros fallidos",
  lballs_acc: "Pases largos exitosos",
  lballs_inacc: "Pases largos fallidos",
  grduels_w: "Duelos terrestres ganados",
  grduels_l: "Duelos terrestres perdidos",
  aerials_w: "Duelos aéreos ganados",
  aerials_l: "Duelos aéreos perdidos",
  duelos_ganados: "Duelos ganados",
  poss_lost: "Posesiones perdidas",
  fouls: "Faltas cometidas",
  wasfouled: "Faltas recibidas",
  clearances: "Despejes",
  stop_shots: "Tiros bloqueados defensivo",
  interceptions: "Interceptaciones",
  tackles: "Entradas",
  dribbled_past: "Veces regateado",
  tballs_acc: "Pases entre líneas exitosos",
  tballs_inacc: "Pases entre líneas fallidos",
  ycards: "Tarjetas amarillas",
  rcards: "Tarjeta roja",
  dangmistakes: "Errores graves",
  countattack: "Contraataques iniciados",
  offsides: "Fueras de juego",
  goals_ag_otb: "Goles recibidos fuera del área",
  goals_ag_itb: "Goles recibidos dentro del área",
  saves_itb: "Paradas dentro del área",
  saves_otb: "Paradas fuera del área",
  saved_pen: "Penaltis parados",
  missed_penalties: "Penaltis fallados",
  owngoals: "Goles en propia portería",
  degree_centrality: "Centralidad (grado)",
  betweenness_centrality: "Centralidad (betweenness)",
  closeness_centrality: "Centralidad (closeness)",
  flow_centrality: "Centralidad (flow)",
  flow_success: "Éxito en flow",
  betweenness2goals: "Betweenness/Goles",
  win: "Victoria",
  lost: "Derrota",
  result: "Resultado",
  is_home_team: "Equipo local",
  minutesPlayed: "Minutos jugados",
  game_duration: "Duración partido"
};

// Opciones categóricas
const categoricalOptions = {
  result: [
    { value: "victory", label: "Victoria" },
    { value: "draw", label: "Empate" },
    { value: "defeat", label: "Derrota" }
  ],
  pos: [
    
    { value: "DF", label: "Defensa" },
    { value: "MF", label: "Centrocampista" },
    { value: "FW", label: "Delantero" }
  ]
};

export default function DynamicForm({ 
  fields = [], 
  categoricalFields = ["result", "pos"], 
  modelKey, // ← AÑADIDO: recibir el model_key
  onSubmit 
}) {
  const [stats, setStats] = useState(
    { player_name: "", ...fields.reduce((acc, key) => {
      acc[key] = categoricalFields.includes(key) ? "" : 0;
      return acc;
    }, {})}
  );

  const [error, setError] = useState("");

  const handleChange = (key, value) => {
    setStats(prev => ({ ...prev, [key]: value }));
  };

  const increment = (key) => handleChange(key, (stats[key] || 0) + 1);
  const decrement = (key) => handleChange(key, Math.max(0, (stats[key] || 0) - 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stats.player_name.trim()) {
      setError("El nombre del jugador es obligatorio.");
      return;
    }
    if (!modelKey) {
      setError("No se ha seleccionado un modelo.");
      return;
    }
    setError("");
    
    // 🔧 CORREGIDO: enviar payload completo que espera el backend
    const payload = {
      player_name: stats.player_name,
      model_key: modelKey,
      stats: Object.fromEntries(
        Object.entries(stats).filter(([key]) => key !== "player_name")
      )
    };
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
      {/* Campo obligatorio de nombre */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <label className="w-full sm:w-48 font-semibold text-gray-700">
          {keyNames["player_name"]}
        </label>
        <input
          type="text"
          value={stats.player_name}
          onChange={(e) => handleChange("player_name", e.target.value)}
          className="flex-1 border px-2 py-1 rounded-lg"
          placeholder="Introduce el nombre del jugador"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {fields.map((key) => (
        <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="w-full sm:w-48 font-semibold text-gray-700">
            {keyNames[key] || key}
          </label>

          {categoricalFields.includes(key) ? (
            <select
              className="flex-1 border px-2 py-1 rounded-lg"
              value={stats[key]}
              onChange={(e) => handleChange(key, e.target.value)}
            >
              <option value="">Selecciona...</option>
              {categoricalOptions[key].map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => decrement(key)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
              >
                -
              </button>
              <input
                type="number"
                className="border px-2 py-1 w-20 text-center rounded-lg"
                value={stats[key]}
                onChange={(e) => handleChange(key, Math.max(0, Number(e.target.value)))}
              />
              <button
                type="button"
                onClick={() => increment(key)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg"
              >
                +
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-2xl mt-4"
      >
        Predecir
      </button>
    </form>
  );
}

