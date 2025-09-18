import { useState, useRef } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ReportScreen() {
  const [playerName, setPlayerName] = useState("");
  const [history, setHistory] = useState([]);
  const [numericKeys, setNumericKeys] = useState([]);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [loading, setLoading] = useState(false);

  const chartRefs = useRef({});

  // Nombres legibles
  const readableNames = {
    score: "Puntuación",
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
    duelos_ganados: "Duelos ganados",
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
    is_home_team: "Equipo local",
    minutesPlayed: "Minutos jugados",
    game_duration: "Duración del partido",
  };

  const categoricalDisplayToModel = {
    result: { "Victoria": "victory", "Empate": "draw", "Derrota": "defeat" },
    pos: { "Portero": "GK", "Defensa": "DF", "Medio": "MF", "Delantero": "FW" }
  };

  const categoryLabelMap = {
    result: { victory: "Victoria", draw: "Empate", defeat: "Derrota" },
    pos: { GK: "Portero", DF: "Defensa", MF: "Centrocampista", FW: "Delantero" }
  };

  const fetchPlayerHistory = async () => {
    if (!playerName.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`/history?limit=50&player_name=${encodeURIComponent(playerName)}`);
      const playerHistory = (res.data.data || []).reverse();
      setHistory(playerHistory);

      if (playerHistory.length > 0) {
        const sampleStats = playerHistory[0].stats || {};
        const numeric = Object.keys(sampleStats).filter(key => typeof sampleStats[key] === "number");
        setNumericKeys(numeric);

        const visibility = { score: true };
        numeric.forEach(k => { visibility[k] = false }); // Ocultar por defecto para mejor UX
        setVisibleKeys(visibility);
      } else {
        setNumericKeys([]);
        setVisibleKeys({});
      }
    } catch (err) {
      console.error("Error cargando historial del jugador:", err);
      setHistory([]);
      setNumericKeys([]);
      setVisibleKeys({});
    }
    setLoading(false);
  };

  const toggleKey = (key) => {
    setVisibleKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Datos para gráficas con numeración de partidos como en PlayerStats
  const chartData = history.map((h, idx) => ({
    partido: `Partido ${idx + 1}`,
    partidoNumero: idx + 1,
    match: h.match_id || `Partido ${idx + 1}`,
    score: h.score,
    ...h.stats
  }));

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#a4de6c", "#d0ed57", "#888888"];

  // Tooltip personalizado mejorado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-gray-600">Jugador: {playerName}</p>
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

  const downloadPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    let yOffset = 10;

    // Título del PDF
    pdf.setFontSize(16);
    pdf.text(`Informe de ${playerName}`, 10, yOffset);
    yOffset += 10;

    for (const key of ["score", ...numericKeys.filter(k => visibleKeys[k])]) {
      const chartDiv = chartRefs.current[key];
      if (!chartDiv) continue;
      
      const canvas = await html2canvas(chartDiv);
      const imgData = canvas.toDataURL("image/png");

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = 180;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.setFontSize(12);
      pdf.text(readableNames[key] || key, 10, yOffset);
      yOffset += 5;
      pdf.addImage(imgData, "PNG", 10, yOffset, pdfWidth, pdfHeight);
      yOffset += pdfHeight + 10;

      if (yOffset + pdfHeight > 280) {
        pdf.addPage();
        yOffset = 10;
      }
    }

    pdf.save(`${playerName || "player"}_stats.pdf`);
  };

  // Contar categorías para gráficas de barras
  const getCategoryCounts = (key) => {
    const counts = {};
    history.forEach(h => {
      const val = h.stats[key];
      if (val && categoryLabelMap[key] && categoryLabelMap[key][val]) {
        counts[val] = (counts[val] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([cat, count]) => ({
      category: categoryLabelMap[key][cat],
      count
    }));
  };

  return (
    <div className="w-full max-w-5xl flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">📊 Informe de jugador</h2>

      {/* Barra de búsqueda mejorada */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6 w-full max-w-md">
        <input
          type="text"
          placeholder="Nombre del jugador"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchPlayerHistory()}
          className="border border-gray-300 px-4 py-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={fetchPlayerHistory}
          disabled={!playerName.trim() || loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {!loading && history.length === 0 && playerName && (
        <p className="text-gray-600 mt-2">❌ No se encontraron datos para este jugador.</p>
      )}

      {history.length > 0 && (
        <>
          <div className="w-full mb-6 text-center">
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              Historial de {playerName} ({history.length} partidos)
            </h3>
            <button
              onClick={downloadPDF}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              📄 Descargar PDF
            </button>
          </div>

          {/* Checkboxes mejorados */}
          <div className="w-full mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3 text-gray-700">Seleccionar estadísticas a mostrar:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked disabled className="accent-blue-500" />
                <span className="font-semibold text-blue-600">{readableNames.score}</span>
              </label>
              {numericKeys.map((key) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={visibleKeys[key] ?? false}
                    onChange={() => toggleKey(key)}
                    className="accent-blue-500"
                  />
                  <span className="text-gray-700 text-sm">{readableNames[key] || key}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Gráfica principal combinada (como PlayerStats) */}
          <div className="w-full mb-8 p-4 bg-white border rounded-lg shadow-sm">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">📈 Progresión general</h4>
            <ResponsiveContainer width="100%" height={400}>
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
                
                {/* Score siempre visible con estilo destacado */}
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke={colors[0]} 
                  strokeWidth={3}
                  dot={{ r: 4, fill: colors[0] }}
                  name="score"
                />
                
                {/* Otras estadísticas */}
                {numericKeys.map((key, idx) => (
                  visibleKeys[key] && (
                    <Line 
                      key={key} 
                      type="monotone" 
                      dataKey={key} 
                      stroke={colors[(idx + 1) % colors.length]} 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name={key}
                    />
                  )
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráficas individuales */}
          {["score", ...numericKeys].map((key, idx) => visibleKeys[key] && key !== "score" && (
            <div
              key={key}
              ref={(el) => (chartRefs.current[key] = el)}
              className="w-full mb-6 p-4 bg-white border rounded-lg shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 text-gray-800">{readableNames[key]}</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="partido"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey={key} 
                    stroke={colors[idx % colors.length]} 
                    strokeWidth={3}
                    dot={{ r: 4, fill: colors[idx % colors.length] }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}

          {/* Gráficas de barras para campos categóricos */}
          {["result", "pos"].map((key, idx) => {
            const barData = getCategoryCounts(key);
            if (barData.length === 0) return null;
            
            return (
              <div key={key} className="w-full mb-6 p-4 bg-white border rounded-lg shadow-sm">
                <h4 className="text-lg font-semibold mb-3 text-gray-800">📊 {readableNames[key]}</h4>

                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={colors[idx % colors.length]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Tabla compacta */}
                <div className="mt-4 max-h-32 overflow-y-auto">
                  <table className="w-full text-sm border-collapse border border-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="border border-gray-200 px-2 py-1 text-left">Partido</th>
                        <th className="border border-gray-200 px-2 py-1 text-left">{readableNames[key]}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-2 py-1">{`Partido ${i + 1}`}</td>
                          <td className="border border-gray-200 px-2 py-1">
                            {categoryLabelMap[key] && categoryLabelMap[key][h.stats[key]] || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* Información adicional */}
          <div className="w-full mt-4 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
            <p>📊 Mostrando progresión a lo largo de {history.length} partido(s)</p>
            <p>💡 Usa los checkboxes para mostrar/ocultar estadísticas específicas</p>
            <p>📄 Descarga el PDF para obtener un informe completo</p>
          </div>
        </>
      )}
    </div>
  );
}



