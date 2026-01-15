import { useEffect, useState, useCallback } from "react";
import { solicitudService } from "../services/SolicitudService";
import { authService } from "../services/AuthService";
import MainLayout from "./MainLayout";
import "./Dashboard.css"; 

const JefeDashboard = ({ onLogout }) => {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioNombre, setUsuarioNombre] = useState("Jefe de Carrera");
  const [stats, setStats] = useState({ pendientes: 0, procesadas: 0, total: 0 });

  const BASE_URL_IMAGENES = "http://localhost:5057/respaldos"; 

  const [modal, setModal] = useState({ abierto: false, tipo: "", id: null, obs: "" });
  const [visor, setVisor] = useState({ abierto: false, ruta: "" });
  const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "success" });

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const token = authService.getToken();
      
      const [pendientes, procesadas] = await Promise.all([
        solicitudService.obtenerPendientes(token),
        solicitudService.obtenerProcesadas(token)
      ]);
      
      setLista(pendientes);
      
      setStats({
        pendientes: pendientes.length,
        procesadas: procesadas.length,
        total: pendientes.length + procesadas.length
      });
    } catch (error) {
      console.error("Error al sincronizar con el historial:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = authService.getUser();
    if (user?.nombre) setUsuarioNombre(user.nombre);
    cargarDatos();
  }, [cargarDatos]);

  const mostrarNotificacion = (mensaje, tipo = "success") => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast({ visible: false, mensaje: "", tipo: "success" }), 4000);
  };

  const confirmarAccion = async () => {
    try {
      const token = authService.getToken();
      
      await solicitudService.revisar(modal.id, modal.tipo, modal.obs, token);
      
      setModal({ abierto: false, tipo: "", id: null, obs: "" });
      cargarDatos(); 
      mostrarNotificacion(`¡Solicitud ${modal.tipo} con éxito!`, "success");
    } catch (error) {
      console.error(error);
      mostrarNotificacion("Error al procesar la revisión.", "error");
    }
  };

  return (
    <MainLayout role="Jefe de Carrera" onLogout={onLogout}>
        
        <div className="welcome-banner-jefe">
            <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>¡Bienvenido, {usuarioNombre}! 🎓</h1>
            <p style={{ opacity: 0.9, marginTop: '0.4rem' }}>Panel de revisión y control académico de licencias.</p>
        </div>

        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-label">Pendientes</div>
                <div className="stat-number">{stats.pendientes}</div>
            </div>
            <div className="stat-card" style={{ borderBottom: '6px solid var(--success)' }}>
                <div className="stat-label">Procesadas</div>
                <div className="stat-number" style={{ color: 'var(--success)' }}>{stats.procesadas}</div>
            </div>
            <div className="stat-card" style={{ borderBottom: '6px solid #333' }}>
                <div className="stat-label">Total Histórico</div>
                <div className="stat-number" style={{ color: '#333' }}>{stats.total}</div>
            </div>
        </div>

        <div className="table-container">
            <div style={{ padding: '18px 25px', borderBottom: '1px solid #edf2f7' }}>
                <h3 style={{ color: 'var(--upds-blue)', margin: 0, fontWeight: 800 }}>📥 BANDEJA DE ENTRADA</h3>
            </div>
            
            <div className="scrollable-table">
                {loading ? <p className="text-center p-5 fw-bold">Sincronizando con el servidor...</p> : 
                 lista.length === 0 ? <p className="text-center p-5">✨ No hay licencias pendientes por revisar.</p> : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Estudiante / Carrera</th>
                                <th>Motivo Justificado</th>
                                <th style={{ textAlign: 'center' }}>Respaldo</th>
                                <th style={{ textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lista.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="fw-bold">{item.nombreEstudiante}</div>
                                        <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{item.carrera}</div>
                                    </td>
                                    <td>{item.motivo}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button className="btn-action-jefe btn-view-photo" onClick={() => setVisor({abierto: true, ruta: item.rutaRespaldo})}>
                                            👁️ Foto
                                        </button>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{display: 'flex', justifyContent: 'center', gap: '8px'}}>
                                            <button className="btn-action-jefe btn-approve" onClick={() => setModal({abierto: true, tipo: "Aprobada", id: item.id, obs: "Solicitud revisada y aceptada"})}>
                                                ✔ Aprobar
                                            </button>
                                            <button className="btn-action-jefe btn-reject" onClick={() => setModal({abierto: true, tipo: "Rechazada", id: item.id, obs: ""})}>
                                                ✖ Rechazar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>

        {visor.abierto && (
            <div className="modal-overlay" onClick={() => setVisor({abierto: false, ruta: ""})}>
                <div className="modal-image-box" onClick={(e) => e.stopPropagation()}>
                    <img 
                        src={`${BASE_URL_IMAGENES}/${visor.ruta}`} 
                        alt="Respaldo Digital" 
                        className="modal-image-preview"
                        onError={(e) => {e.target.src = "https://via.placeholder.com/400x300?text=Documento+no+encontrado"}}
                    />
                    <button className="btn-secondary w-100" style={{marginTop: '15px'}} onClick={() => setVisor({abierto: false, ruta: ""})}>Cerrar Vista</button>
                </div>
            </div>
        )}

        {modal.abierto && (
            <div className="modal-overlay">
                <div className="modal-content" style={{maxWidth: '420px'}}>
                    <div className="modal-header-custom">
                        <h3 className="mb-0">
                            {modal.tipo === 'Aprobada' ? '✅ Aprobar' : '❌ Rechazar'} Trámite
                        </h3>
                        <button onClick={() => setModal({abierto: false, tipo: "", id: null, obs: ""})} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                    </div>
                    <div className="modal-body-custom">
                        <label className="fw-bold mb-2">OBSERVACIÓN PARA EL ESTUDIANTE:</label>
                        <textarea 
                            className="form-control-aesthetic" 
                            rows="3"
                            value={modal.obs}
                            onChange={(e) => setModal({...modal, obs: e.target.value})}
                            placeholder="Escribe el motivo de tu decisión..."
                        ></textarea>
                        <div className="d-flex justify-content-end gap-3 mt-3">
                            <button className="btn-secondary" style={{padding: '8px 15px', borderRadius: '8px'}} onClick={() => setModal({abierto: false, tipo: "", id: null, obs: ""})}>Cancelar</button>
                            <button className={`btn-primary ${modal.tipo === 'Aprobada' ? 'btn-approve' : 'btn-reject'}`} 
                                    onClick={confirmarAccion}
                                    style={{ padding: '8px 20px', borderRadius: '8px', color: 'white', border: 'none', fontWeight: 'bold' }}>
                                Confirmar {modal.tipo}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {toast.visible && (
            <div className="custom-toast">
                <span className="toast-icon">{toast.tipo === 'success' ? '🚀' : '⚠️'}</span>
                <div className="toast-text">{toast.mensaje}</div>
            </div>
        )}

    </MainLayout>
  );
};

export default JefeDashboard;