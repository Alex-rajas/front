// Configuración dinámica de URL base
const BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? "https://football-backend-latest-2.onrender.com"  // Cambiarás esta URL después del deploy
    : "https://football-backend-latest-2.onrender.com"
  );

console.log("🔧 API Base URL:", BASE_URL, "| Modo:", import.meta.env.MODE);

export async function fetchModels() {
  console.log("📡 Llamando a /models en:", BASE_URL);
  try {
    const res = await fetch(`${BASE_URL}/models`);
    if (!res.ok) {
      console.error("❌ Error cargando modelos:", res.status, res.statusText);
      throw new Error(`Error cargando modelos: ${res.status}`);
    }
    const data = await res.json();
    console.log("✅ Datos recibidos de /models:", data);
    return data;
  } catch (error) {
    console.error("❌ Error de red en fetchModels:", error);
    throw new Error("Error de conexión al servidor");
  }
}

export async function predictPlayer(payload) {
  console.log("📡 Llamando a /predict con payload:", payload);
  try {
    const res = await fetch(`${BASE_URL}/predict`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      let errorMsg = "Error en la predicción";
      try {
        const err = await res.json();
        errorMsg = err.detail || errorMsg;
      } catch {
        errorMsg = `Error ${res.status}: ${res.statusText}`;
      }
      console.error("❌ Error en predict:", errorMsg);
      throw new Error(errorMsg);
    }
    
    const data = await res.json();
    console.log("✅ Respuesta de predict:", data);
    return data;
  } catch (error) {
    console.error("❌ Error de red en predictPlayer:", error);
    throw error;
  }
}

export async function fetchHistory(model_key) {
  const url = model_key ? `${BASE_URL}/history?model_key=${model_key}` : `${BASE_URL}/history`;
  console.log("📡 Llamando a /history en:", url);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("❌ Error cargando historial:", res.status, res.statusText);
      throw new Error(`Error cargando historial: ${res.status}`);
    }
    const data = await res.json();
    console.log("✅ Datos recibidos de /history:", data);
    return data;
  } catch (error) {
    console.error("❌ Error de red en fetchHistory:", error);
    throw new Error("Error de conexión al servidor");
  }
}
