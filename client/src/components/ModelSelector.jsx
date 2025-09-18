import { motion } from "framer-motion";

export default function ModelSelector({ models, onSelect, onShowReport }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-blue-100 to-blue-300 text-center space-y-6">
      
      <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
        Player Scoring App ⚡
      </h1>
      <p className="text-gray-700 text-lg max-w-md">
        Calcula la puntuación de tus jugadores, visualiza estadísticas y consulta
        el historial de cada partido de forma rápida y visual.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mt-6">
        {Object.keys(models).map((key) => (
          <motion.button
            key={key}
            onClick={() => onSelect(key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-blue-600 transition text-lg w-full"
          >
            {models[key].name || key.replace("_", " ")}
          </motion.button>
        ))}

        {/* Botón para informe del jugador, distinto color */}
        <motion.button
          onClick={onShowReport}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-green-600 transition text-lg w-full"
        >
          Informe del jugador
        </motion.button>
      </div>
    </div>
  );
}

