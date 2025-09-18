export default function ScoreCard({ score }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md my-4 w-full max-w-md text-center">
      <h2 className="text-2xl font-bold mb-2 text-gray-700">Puntuación del jugador</h2>
      <div className="text-5xl font-extrabold text-green-500">{score.toFixed(2)}</div>
    </div>
  );
}



  