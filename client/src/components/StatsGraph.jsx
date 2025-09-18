import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const positionColors = {
  delantero: "#f97316",
  centrocampista: "#3b82f6",
  defensa: "#10b981",
  portero: "#ef4444",
  UNKNOWN: "#6b7280"
};

export default function StatsGraph({ history }) {
  if (!history.length) return null;

  const data = history.map(h => ({
    name: h.player_name,
    score: Number(h.score),
    position: h.stats.pos || h.position || "UNKNOWN"
  }));

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h3 className="text-xl font-bold mb-4 text-center">Evolución de puntuaciones</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
          <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px", color: "white", padding: "10px" }} labelStyle={{ color: "white" }} />
          <Legend />
          {Object.keys(positionColors).map(pos => (
            <Line
              key={pos}
              type="monotone"
              dataKey="score"
              data={data.filter(d => d.position.toLowerCase() === pos)}
              name={pos.charAt(0).toUpperCase() + pos.slice(1)}
              stroke={positionColors[pos]}
              dot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


