export default function HistoryTable({ history }) {
  if (!history.length) return <p className="text-gray-500 text-center">No hay predicciones todavía.</p>;

  return (
    <table className="min-w-full bg-white rounded-lg shadow-md">
      <thead className="bg-gray-200">
        <tr>
          <th className="px-4 py-2 text-left">Jugador</th>
          <th className="px-4 py-2">Modelo</th>
          <th className="px-4 py-2">Posición</th>
          <th className="px-4 py-2">Score</th>
          <th className="px-4 py-2">Fecha</th>
        </tr>
      </thead>
      <tbody>
        {history.map((h, i) => (
          <tr key={i} className="border-b hover:bg-gray-50">
            <td className="px-4 py-2">{h.player_name}</td>
            <td className="px-4 py-2">{h.model_key.replace("_", " ")}</td>
            <td className="px-4 py-2">{h.stats.pos || h.position || "N/A"}</td>
            <td className="px-4 py-2 font-bold">{Number(h.score).toFixed(2)}</td>
            <td className="px-4 py-2">{new Date(h.created_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
