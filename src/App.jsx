import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
// ❌ ANTES IMPORTABAS: import StudentDashboard from "./components/MisSolicitudes"; 
// ✅ AHORA IMPORTA ESTE:
import StudentDashboard from "./components/StudentDashboard"; 
import JefeDashboard from "./components/JefeDashboard";

function App() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Cargar el dashboard correcto que tiene el botón + Nueva Solicitud */}
        <Route 
          path="/estudiante" 
          element={<StudentDashboard onLogout={handleLogout} />} 
        />

        <Route 
          path="/jefe" 
          element={<JefeDashboard onLogout={handleLogout} />} 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;