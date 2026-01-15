import { useState, useEffect } from "react"; // <--- Agregamos useEffect
import { solicitudService } from "../services/SolicitudService";
import { authService } from "../services/AuthService";

const SolicitudForm = ({ alCancelar, alTerminar }) => {
  const [motivo, setMotivo] = useState("");
  const [tipoSolicitud, setTipoSolicitud] = useState("Salud");
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [estudianteId, setEstudianteId] = useState(null); // Estado para el ID real

  // AL CARGAR: Desciframos el token para sacar el ID verdadero
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // El ID suele venir en 'nameid' o 'sub' dependiendo de la configuración
        const idReal = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload["nameid"];
        setEstudianteId(idReal);
      } catch (e) {
        console.error("Error leyendo ID del token", e);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!estudianteId) {
      alert("Error: No se pudo identificar al usuario. Recarga la página.");
      return;
    }

    setLoading(true);

    try {
      const token = authService.getToken();
      
      const formData = new FormData();
      // ¡AQUÍ ESTÁ LA MAGIA! Usamos el ID real, no el 1 fijo.
      formData.append("EstudianteId", estudianteId); 
      formData.append("TipoSolicitud", tipoSolicitud);
      formData.append("Motivo", motivo);
      if (archivo) {
        formData.append("Archivo", archivo);
      }

      await solicitudService.crear(formData, token);
      
      alert("✅ ¡Solicitud Enviada Correctamente!");
      alTerminar(); 

    } catch (error) {
      alert("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-success text-white">
        <h5 className="mb-0">📝 Nueva Solicitud de Licencia</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          
          <div className="mb-3">
            <label className="form-label">Tipo de Licencia</label>
            <select 
              className="form-select"
              value={tipoSolicitud}
              onChange={(e) => setTipoSolicitud(e.target.value)}
            >
              <option value="Salud">🏥 Salud (Médica)</option>
              <option value="Trabajo">💼 Motivos Laborales</option>
              <option value="Personal">🏠 Asuntos Personales</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Motivo (Detalle)</label>
            <textarea 
              className="form-control" 
              rows="3" 
              required
              placeholder="Explica brevemente..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Adjuntar Respaldo (Opcional)</label>
            <input 
              type="file" 
              className="form-control"
              accept=".jpg,.png,.pdf"
              onChange={(e) => setArchivo(e.target.files[0])}
            />
          </div>

          {/* Mensaje de depuración (opcional, para que veas tu ID) */}
          <div className="text-muted small mb-3">
             Tu ID de usuario detectado es: <strong>{estudianteId || "Cargando..."}</strong>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" onClick={alCancelar} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-success" disabled={loading || !estudianteId}>
              {loading ? "Enviando..." : "Enviar Solicitud"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SolicitudForm;