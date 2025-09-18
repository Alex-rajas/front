import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function PlayerStats({ playerHistory }) {
  if (!playerHistory || playerHistory.length === 0) return null;

  // Mapa de nombres legibles corregido
  const readableNames = {
    competition: "Competición",
    date: "Fecha del partido",
    match: "Partido",
    team: "Equipo",
    pos: "Posición",
    pos_role: "Posición específica",
    player: "Jugador",
    rater: "Evaluador",
    is_human: "Evaluador humano",
    original_rating: "Valoración",
    goals: "Goles",
    assists: "Asistencias",
    shots_ontarget: "Tiros a portería",
    shots_offtarget: "Tiros fuera",
    shots_offtarget_blocked: "Tiros bloqueados",
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
    poss_lost: "Posesiones perdidas",
    fouls: "Faltas cometidas",
    wasfouled: "Faltas recibidas",
    clearances: "Despejes",
    stop_shots: "Tiros bloqueados",
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
    goals_ag_otb: "Goles recibidos fuera",
    goals_ag_itb: "Goles recibidos dentro",
    saves_itb: "Paradas dentro",
    saves_otb: "Paradas fuera",
    saved_pen: "Penaltis parados",
    missed_penalties: "Penaltis fallados",
    owngoals: "Goles en propia portería",
    degree_centrality: "Centralidad de grado",
    betweenness_centrality: "Centralidad de intermediación",
    closeness_centrality: "Centralidad de cercanía",
    flow_centrality: "Centralidad de flujo",
    flow_success: "Éxito de flujo",
    betweenness2goals: "Intermediación vs goles",
    win: "Victoria",
    lost: "Derrota",
    result: "Resultado",
    duelos_ganados: "Duelos ganados",
    is_home_team: "Equipo local",
    minutesPlayed: "Minutos jugados",
    game_duration: "Duración del partido",
  };

  // Preparar datos para graficar - AGREGANDO NÚMERO DE PARTIDO
  const chartData = playerHistory.map((item, index) => ({
    partido: `Partido ${index + 1}`, // ✅ Nuevo campo para el eje X
    partidoNumero: index + 1, // ✅ Número del partido como valor numérico
    player_name: item.player_name,
    score: item.score,
    ...item.stats,
  }));

  // Detectar keys numéricas (excluyendo player_name, score, partido y partidoNumero)
  const numericKeys = Object.keys(chartData[0]).filter(
    key => key !== "player_name" && 
          key !== "score" && 
          key !== "partido" && 
          key !== "partidoNumero" && 
          typeof chartData[0][key] === "number"
  );

  // Estado para mostrar/ocultar stats
  const [visibleStats, setVisibleStats] = useState(
    numericKeys.reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );

  const toggleStat = (key) => {
    setVisibleStats(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#a4de6c", "#d0ed57", "#888888"];

  // Tooltip personalizado para mostrar información del partido
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-gray-600">Jugador: {data.player_name}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {readableNames[entry.dataKey] || entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-4xl mt-6">
      {/* Checkboxes */}
      <div className="flex flex-wrap gap-2 mb-4">
        <label className="flex items-center space-x-1">
          <input type="checkbox" checked disabled />
          <span className="font-semibold text-blue-600">Score</span>
        </label>
        {numericKeys.map(key => (
          <label key={key} className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={visibleStats[key]}
              onChange={() => toggleStat(key)}
            />
            <span>{readableNames[key] || key}</span>
          </label>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="partido" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={(name) => readableNames[name] || name} />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke={colors[0]} 
            strokeWidth={3}
            dot={{ r: 4 }}
          />
          {numericKeys.map((key, idx) => (
            visibleStats[key] && (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={colors[(idx + 1) % colors.length]} 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            )
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Información adicional */}
      <div className="mt-4 text-sm text-gray-600">
        <p>📊 Mostrando progresión a lo largo de {playerHistory.length} partido(s)</p>
        <p>💡 Usa los checkboxes para mostrar/ocultar estadísticas específicas</p>
      </div>
    </div>
  );
}

