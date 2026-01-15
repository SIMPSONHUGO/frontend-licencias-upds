import { useEffect, useState } from "react";
import { solicitudService } from "../services/SolicitudService";
import { authService } from "../services/AuthService";

const BandejaJefe = ({ alVolver }) => {
  const [lista, setLista] = useState([]);
  const [jefeCarrera, setJefeCarrera] = useState(""); 
  const [loading, setLoading] = useState(true);

  // ⚠️ PUERTO DEL BACKEND (Verifica que sea el 5057)
  const BASE_URL_FOTOS = "http://localhost:5057"; 

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const token = authService.getToken();
      
      // 🛡️ SEGURIDAD 1: Si no hay token, no hacemos nada
      if (!token) {
        console.warn("No hay token, el usuario debe loguearse.");
        setLoading(false);
        return;
      }

      // 🛡️ SEGURIDAD 2: Decodificar con cuidado
      try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          // Buscar el email en todas las etiquetas posibles
          const emailJefe = payload["email"] || 
                            payload["unique_name"] || 
                            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || 
                            "";

          // Filtro visual para el título
          let carreraDelJefe = "General";
          const emailMin = emailJefe.toLowerCase();

          if (emailMin.includes("eiver")) carreraDelJefe = "Sistemas";
          else if (emailMin.includes("vanessa")) carreraDelJefe = "Social";
          else if (emailMin.includes("javier")) carreraDelJefe = "Administrativa";
          else if (emailMin.includes("ana")) carreraDelJefe = "Derecho";
          else if (emailMin.includes("martin")) carreraDelJefe = "Civil";
          
          setJefeCarrera(carreraDelJefe);

      } catch (e) {
          console.error("Error leyendo el token:", e);
      }

      // 4. TRAER DATOS DEL BACKEND
      const datos = await solicitudService.obtenerPendientes(token);
      
      // Filtramos solo las pendientes
      if(datos && Array.isArray(datos)) {
        const soloPendientes = datos.filter(x => x.estado === "Pendiente");
        setLista(soloPendientes);
      }

    } catch (error) { 
      console.error(error);
      // Omitimos el alert si es error de conexión inicial para no molestar
    }
    finally { setLoading(false); }
  };

  // 💬 AQUÍ ESTÁ LA MAGIA DE LOS COMENTARIOS
  const procesar = async (id, decision) => {
    
    // 1. Pedimos el motivo con una cajita
    const texto = prompt(`Escribe una observación para ${decision}:`, "Sin observaciones");
    
    // Si da a "Cancelar", no hacemos nada
    if (texto === null) return; 

    try {
      const token = authService.getToken();

      // 🛡️ Verificamos sesión antes de enviar
      if (!token) {
        alert("⚠️ Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
        return;
      }
      
      // 2. Enviamos la decisión Y el texto al servicio
      await solicitudService.revisar(id, decision, texto, token);
      
      alert("✅ ¡Procesado correctamente!");
      cargarDatos(); // Recargamos la lista
    } catch (error) { 
        alert("❌ Error: " + error.message); 
    }
  };

  return (
    <div className="card shadow mt-4">
      <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">👮‍♂️ Bandeja: {jefeCarrera}</h5>
        <button onClick={alVolver} className="btn btn-sm btn-outline-light">Cerrar</button>
      </div>
      <div className="card-body">
        {loading ? (
            <div className="text-center">Cargando...</div>
        ) : lista.length === 0 ? (
          <div className="alert alert-success text-center">¡Todo limpio! 🧹</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Estudiante</th>
                  <th>Motivo</th>
                  <th>Respaldo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="fw-bold">{item.nombreEstudiante}</div>
                      <span className="badge bg-secondary">{item.carrera || "Estudiante"}</span>
                    </td>
                    <td>
                        {item.motivo}
                        <div className="small text-muted">{item.fechaSolicitud}</div>
                    </td>
                    
                    <td>
                      {item.rutaRespaldo && item.rutaRespaldo !== "Sin respaldo" ? (
                        <a 
                          href={`${BASE_URL_FOTOS}${item.rutaRespaldo}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          👁️ Ver Archivo
                        </a>
                      ) : (
                        <span className="text-muted small">Sin archivo</span>
                      )}
                    </td>

                    <td>
                      <div className="d-flex gap-2">
                        {/* Botones conectados a la nueva función procesar */}
                        <button onClick={() => procesar(item.id, "Aprobada")} className="btn btn-success btn-sm">✔ Aprobar</button>
                        <button onClick={() => procesar(item.id, "Rechazada")} className="btn btn-danger btn-sm">✖ Rechazar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BandejaJefe;