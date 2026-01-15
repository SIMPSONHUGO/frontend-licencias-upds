// src/components/MisSolicitudes.jsx (Nuevo StudentDashboard)
import { useEffect, useState } from "react";
import { solicitudService } from "../services/SolicitudService";
import { authService } from "../services/AuthService";
import MainLayout from "./MainLayout"; // Importamos el layout

const colors = {
  cardBg: "#FFFFFF", primary: "#E78052", textDark: "#3E3227", 
  textLight: "#8A8176", success: "#4CAF50", danger: "#F44336", accent: "#F0C48F"
};

const StudentDashboard = ({ alVolver }) => {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estudianteNombre, setEstudianteNombre] = useState("");

  useEffect(() => {
    cargarMisSolicitudes();
  }, []);

  const cargarMisSolicitudes = async () => {
    try {
      const user = authService.getUser();
      const token = authService.getToken();
      if (user && user.estudianteId) {
        setEstudianteNombre(user.nombre.split(" ")[0]); // Usar solo el primer nombre
        const datos = await solicitudService.obtenerMisSolicitudes(user.estudianteId, token);
        setLista(datos);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // Función auxiliar para estilos de estado
  const getBadgeDetails = (estado) => {
    switch (estado) {
      case "Aprobada": return { icono: "✅", texto: "Aprobada", color: colors.success };
      case "Rechazada": return { icono: "❌", texto: "Rechazada", color: colors.danger };
      default: return { icono: "⏳", texto: "Pendiente", color: colors.textDark };
    }
  };

  return (
    <MainLayout role="Estudiante" onLogout={alVolver}>
        {/* --- Tarjeta de Bienvenida --- */}
        <div style={{ backgroundColor: colors.primary, padding: '3rem', borderRadius: '24px', color: 'white', marginBottom: '3rem', boxShadow: '0 20px 30px -15px rgba(231, 128, 82, 0.6)', backgroundImage: 'linear-gradient(45deg, #E78052, #F0C48F)' }}>
            <h1 style={{ fontSize: '2.5rem', margin: 0 }}>¡Hola, {estudianteNombre}! 👋</h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, marginTop: '0.5rem' }}>Bienvenido a tu panel. Aquí puedes ver el estado de tus trámites.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '3rem' }}>
            {/* --- Lista de Solicitudes Recientes --- */}
            <div style={{ backgroundColor: colors.cardBg, padding: '2.5rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <h2 style={{ marginBottom: '2rem', color: colors.textDark }}>Mis Solicitudes Recientes</h2>
                {loading ? <p>Cargando tus trámites...</p> : lista.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: colors.textLight }}>
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📭</span>
                        No tienes ninguna solicitud registrada.
                    </div>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {lista.map(item => {
                            const badge = getBadgeDetails(item.estado);
                            return (
                                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0', borderBottom: `2px solid #F5F5F5` }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{ backgroundColor: badge.color + '20', padding: '1rem', borderRadius: '16px', marginRight: '1.5rem', fontSize: '1.5rem' }}>
                                            {badge.icono}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{item.motivo}</h4>
                                            <small style={{ color: colors.textLight, fontWeight: '500' }}>📅 {new Date(item.fechaSolicitud).toLocaleDateString()}</small>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', color: badge.color, padding: '0.5rem 1rem', backgroundColor: badge.color + '20', borderRadius: '10px', display: 'inline-block' }}>
                                            {badge.texto}
                                        </div>
                                        {item.observacionJefe && item.observacionJefe !== "Sin observaciones" && (
                                            <div style={{ fontSize: '0.85rem', color: colors.textDark, marginTop: '0.8rem', padding: '0.8rem', backgroundColor: '#FFF8E1', borderRadius: '10px', maxWidth: '250px', borderLeft: `4px solid ${colors.primary}` }}>
                                                💬 <i>"{item.observacionJefe}"</i>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* --- Tarjeta de Acción Rápida --- */}
            <div style={{ backgroundColor: colors.cardBg, padding: '2.5rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', height: 'fit-content', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                <h2 style={{ marginBottom: '1rem', color: colors.textDark, fontSize: '1.5rem' }}>¿Nuevo Trámite?</h2>
                <p style={{ color: colors.textLight, marginBottom: '2rem' }}>Inicia una nueva solicitud de licencia fácilmente.</p>
                {/* Aquí iría la lógica para abrir el formulario de nueva solicitud */}
                <button style={{ width: '100%', padding: '1.2rem', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 10px 20px -10px rgba(231, 128, 82, 0.6)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
                    + Crear Solicitud
                </button>
            </div>
        </div>
    </MainLayout>
  );
};

export default StudentDashboard;