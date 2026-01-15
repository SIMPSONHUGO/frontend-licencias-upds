import { useState, useEffect } from "react";
import { authService } from "../services/AuthService";
import SolicitudForm from "./SolicitudForm";
import MisSolicitudes from "./MisSolicitudes";
import BandejaJefe from "./BandejaJefe";

const Dashboard = ({ onLogout }) => {
  const [vista, setVista] = useState("menu");
  const [rol, setRol] = useState("");

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userRole = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload["role"];
        setRol(userRole); 
      } catch (e) {
        console.error("Error leyendo token", e);
      }
    }
  }, []);

  const handleLogout = () => { authService.logout(); onLogout(); };

  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary">🎓 Sistema de Licencias UPDS</h2>
        <p className="text-muted">Bienvenido: <span className="fw-bold">{rol}</span></p>
      </div>

      {vista === "menu" && (
        <div className="card text-center shadow">
          <div className="card-body p-5">
            <h4 className="card-title mb-4">Panel de Control</h4>
            <div className="d-grid gap-3 col-md-6 mx-auto">
              
              {rol === "Estudiante" && (
                <>
                  <button onClick={() => setVista("formulario")} className="btn btn-success btn-lg">
                    ➕ Nueva Solicitud
                  </button>
                  <button onClick={() => setVista("lista")} className="btn btn-outline-primary btn-lg">
                    📂 Ver Mis Trámites
                  </button>
                </>
              )}

              {(rol === "Jefe" || rol === "Coordinador") && (
                <button onClick={() => setVista("bandejaJefe")} className="btn btn-dark btn-lg">
                  👮‍♂️ Revisar Pendientes
                </button>
              )}

            </div>
          </div>
          <div className="card-footer">
            <button onClick={handleLogout} className="btn btn-danger btn-sm">Cerrar Sesión</button>
          </div>
        </div>
      )}

      {vista === "formulario" && (
        <div className="row justify-content-center">
          <div className="col-md-8">
            <SolicitudForm alCancelar={() => setVista("menu")} alTerminar={() => setVista("menu")} />
          </div>
        </div>
      )}

      {vista === "lista" && (
        <div className="row justify-content-center">
          <div className="col-md-10">
            <MisSolicitudes alVolver={() => setVista("menu")} />
          </div>
        </div>
      )}
      
      {vista === "bandejaJefe" && (
        <div className="row justify-content-center">
          <div className="col-md-10">
            <BandejaJefe alVolver={() => setVista("menu")} />
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;