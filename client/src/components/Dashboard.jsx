import HistoryTable from "./HistoryTable";
import StatsGraph from "./StatsGraph";

export default function Dashboard({ history }) {
  return (
    <div className="space-y-6 mt-6 w-full max-w-md">
      {/* Gráfico de evolución */}
      <StatsGraph history={history} />

      {/* Tabla de histórico */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-md p-4">
        <HistoryTable history={history} />
      </div>
    </div>
  );
}

