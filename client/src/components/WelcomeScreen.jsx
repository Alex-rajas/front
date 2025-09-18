import logo from '../assets/logo.png';

export default function WelcomeScreen({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-green-300 p-6">
      
      {/* Logo */}
      <img src={logo} alt="Logo MyStats" className="w-24 h-24 mb-4" />

      <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-4">
        MyStats ⚡
      </h1>
      <p className="text-lg md:text-xl text-white text-center mb-8">
        Calculo de valoración objetiva de rendimiento
      </p>
      
      {/* Botón principal */}
      <button
        onClick={onStart}
        className="bg-white text-blue-500 font-bold px-8 py-4 rounded-full shadow-lg text-lg md:text-xl hover:bg-gray-100 transition"
      >
        Empezar
      </button>
    </div>
  );
}


  