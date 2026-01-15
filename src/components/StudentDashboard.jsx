import { useEffect, useState, useCallback } from "react";
import { solicitudService } from "../services/SolicitudService";
import { authService } from "../services/AuthService";
import MainLayout from "./MainLayout";
import "./Dashboard.css"; 

const SolicitudesTable = ({ solicitudes, loading }) => {
  if (loading) return <div className="text-center p-5 fw-bold">Sincronizando información...</div>;
  
  if (solicitudes.length === 0) {
    return (
      <div className="text-center p-5" style={{ color: '#718096' }}>
        <span style={{ fontSize: '3rem' }}>📭</span>
        <p className="fw-bold">No hay trámites registrados en tu historial.</p>
      </div>
    );
  }

  return (
    <div className="scrollable-table">
      <table className="table">
        <thead>
          <tr>
            <th>Materia / Docente</th>
            <th>Fecha Inicio</th>
            <th style={{ textAlign: 'center' }}>Estado y Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.map((item) => (
            <tr key={item.id}>
              <td style={{ padding: '15px' }}>
                <div className="fw-bold" style={{ color: 'var(--upds-blue)' }}>{item.materia}</div>
                <div style={{ fontSize: '0.8rem', color: '#718096' }}>{item.docente}</div>
              </td>
              <td style={{ padding: '15px' }}>{new Date(item.fechaInicio).toLocaleDateString()}</td>
              <td style={{ padding: '15px', textAlign: 'center' }}>
                <span style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
                    display: 'inline-block', marginBottom: '5px',
                    background: item.estado === 'Aprobada' ? '#d4edda' : (item.estado === 'Rechazada' ? '#f8d7da' : '#fff3cd'),
                    color: item.estado === 'Aprobada' ? '#155724' : (item.estado === 'Rechazada' ? '#721c24' : '#856404')
                }}>
                  {item.estado}
                </span>
                {item.observacionJefe && item.observacionJefe !== "Sin observaciones" && (
                  <div style={{ 
                      fontSize: '0.7rem', color: '#444', fontStyle: 'italic', marginTop: '5px',
                      padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '8px',
                      borderLeft: item.estado === 'Rechazada' ? '4px solid #dc3545' : '4px solid #28a745'
                  }}>
                    "{item.observacionJefe}"
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StudentDashboard = ({ onLogout }) => {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [usuarioNombre, setUsuarioNombre] = useState("Estudiante");
  const [formData, setFormData] = useState({ materia: "", docente: "", fechaInicio: "", fechaFin: "", motivo: "", archivo: null });

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const token = authService.getToken();
      const misSolicitudes = await solicitudService.obtenerMisSolicitudes(token);
      setLista(misSolicitudes);
    } catch (error) {
      console.error("Error al sincronizar:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = authService.getUser();
    if (user?.nombre) setUsuarioNombre(user.nombre);
    cargarDatos();
  }, [cargarDatos]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.archivo) return; 

    try {
      const token = authService.getToken();
      const data = new FormData();
      
      data.append("Materia", formData.materia);
      data.append("Docente", formData.docente);
      data.append("FechaInicio", formData.fechaInicio);
      data.append("FechaFin", formData.fechaFin);
      data.append("Motivo", formData.motivo);
      data.append("Archivo", formData.archivo); 

      await solicitudService.crear(data, token);
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);

      setShowModal(false);
      setFormData({ materia: "", docente: "", fechaInicio: "", fechaFin: "", motivo: "", archivo: null });
      cargarDatos();
    } catch (error) {
      console.error("Error al enviar la solicitud.");
    }
  };

  return (
    <MainLayout role="Estudiante" onLogout={onLogout}>
      
      {showToast && (
        <div className="custom-toast">
            <span className="toast-icon">🚀</span>
            <div className="toast-text">¡Tu trámite ha sido enviado con éxito!</div>
        </div>
      )}

      <div className="welcome-banner-estudiante">
        <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>¡Hola, {usuarioNombre}! 👋</h1>
        <p style={{ opacity: 0.9, marginTop: '0.4rem', fontSize: '1rem' }}>Panel oficial para la gestión de licencias académicas.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
        
        <div className="table-container">
          <div style={{ padding: '18px 25px', borderBottom: '1px solid #edf2f7' }}>
            <h3 style={{ color: 'var(--upds-blue)', margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>📊 HISTORIAL DE TRÁMITES</h3>
          </div>
          <SolicitudesTable solicitudes={lista} loading={loading} />
        </div>

        <div className="stat-card" style={{ padding: '25px', borderBottom: '8px solid var(--upds-gold)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🚀</div>
          <h4 style={{ color: 'var(--upds-blue)', fontWeight: 800 }}>¿NUEVA SOLICITUD?</h4>
          <p style={{ color: '#718096', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.4' }}>
              Inicia un trámite formal adjuntando tus respaldos digitales correspondientes.
          </p>
          <button className="logout-btn w-100" style={{ padding: '12px' }} onClick={() => setShowModal(true)}>
            + CREAR SOLICITUD
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-custom">
                <h3 className="mb-0">📝 FORMULARIO DE LICENCIA</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.8rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
            </div>
            
            <div className="modal-body-custom">
              <form onSubmit={handleSubmit}>
                <div className="row g-2">
                  <div className="col-md-6 mb-2">
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>ASIGNATURA</label>
                    <input name="materia" className="form-control-aesthetic" required value={formData.materia} onChange={handleInputChange} placeholder="Materia" />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>DOCENTE</label>
                    <input name="docente" className="form-control-aesthetic" required value={formData.docente} onChange={handleInputChange} placeholder="Nombre completo" />
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-md-6 mb-2">
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>FECHA INICIO</label>
                    <input type="date" name="fechaInicio" className="form-control-aesthetic" required onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>FECHA FINAL</label>
                    <input type="date" name="fechaFin" className="form-control-aesthetic" required onChange={handleInputChange} />
                  </div>
                </div>

                <div className="mb-2">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>JUSTIFICACIÓN DEL MOTIVO</label>
                  <textarea name="motivo" className="form-control-aesthetic" rows="2" required onChange={handleInputChange} placeholder="Describa el motivo..."></textarea>
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>RESPALDO DIGITAL</label>
                  <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '10px', border: '1px dashed #ced4da', textAlign: 'center' }}>
                      <input type="file" onChange={(e) => setFormData(prev => ({ ...prev, archivo: e.target.files[0] }))} required style={{ cursor: 'pointer', fontSize: '0.8rem' }} />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 pt-2" style={{ borderTop: '1px solid #eee' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem' }}>Cerrar</button>
                  <button type="submit" className="btn-primary" style={{ padding: '10px 25px', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem' }}>Enviar Trámite 🚀</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default StudentDashboard;