import { useState } from "react";
import { authService } from "../services/AuthService";
import { useNavigate } from "react-router-dom";
import "./Login.css"; 

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false); 
  
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [carrera, setCarrera] = useState(""); // 👈 NUEVO: Estado para la carrera
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  // LISTA DE CARRERAS (Exactamente como las escribimos en el Backend)
  const carrerasDisponibles = [
    // Área Sistemas (Eiver)
    "Ingeniería de Sistemas", "Ingeniería en Redes", "Telecomunicaciones",
    // Área Derecho (Ana)
    "Derecho",
    // Área Empresarial (Javier)
    "Contaduría Pública", "Administración de Empresas", "Marketing", "Ingeniería Comercial",
    // Área Social (Vanessa)
    "Psicología", "Comunicación Social", "Trabajo Social",
    // Área Industrial (Martín)
    "Ingeniería Civil", "Ingeniería Industrial", "Ingeniería Petrolera"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isRegistering) {
        // --- REGISTRO CON CARRERA ---
        if (!carrera) {
            setError("Por favor selecciona tu carrera.");
            setLoading(false);
            return;
        }
        // Enviamos nombre, email, password Y CARRERA
        // (Nota: authService.register debe estar listo para recibir 4 argumentos, lo revisaremos abajo)
        await authService.register(nombre, email, password, carrera);
        
        setSuccessMsg("¡Cuenta creada con éxito! Por favor inicia sesión.");
        setIsRegistering(false); 
        setNombre(""); 
        setPassword("");
        setCarrera("");
      } else {
        // --- LOGIN NORMAL ---
        console.log("Enviando credenciales...");
        const data = await authService.login(email, password);
        
        if (data.token) {
          const user = authService.getUser();
          console.log("Usuario logueado:", user);

          if (user.rol === "Estudiante") navigate("/estudiante");
          else if (user.rol === "Jefe") navigate("/jefe");
          else if (user.rol === "Coordinador") navigate("/coordinador");
          else if (user.rol === "Decano") navigate("/decano"); // Futuro
          else navigate("/");
        } else {
          setError("Credenciales incorrectas.");
        }
      }
    } catch (err) {
        console.log("Error:", err);
        let msg = "Ocurrió un error inesperado.";
        if (err.message === "Network Error") msg = "No hay conexión con el servidor.";
        else if (err.error) msg = err.error; 
        else if (typeof err === 'string') msg = err;
        
        setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="bg-carousel">
          <div className="bg-image"></div>
          <div className="bg-image"></div>
          <div className="bg-image"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🎓</div>
          <h1>UPDS Licencias</h1>
          <p style={{color: 'var(--upds-gold)', fontWeight: 'bold'}}>
            {isRegistering ? "Crear Nueva Cuenta" : "Acceso Institucional"}
          </p>
        </div>

        {error && <div className="error-box">⚠️ {error}</div>}
        {successMsg && <div className="success-box">✅ {successMsg}</div>}

        <form onSubmit={handleSubmit}>
          
          {/* CAMPOS DE REGISTRO */}
          {isRegistering && (
            <div className="slide-in">
                <div className="form-group">
                    <label className="form-label">Nombre Completo</label>
                    <div className="input-wrapper">
                    <input type="text" className="form-control-aesthetic" placeholder="Ej. Juan Perez"
                        value={nombre} onChange={(e) => setNombre(e.target.value)} required={isRegistering} />
                    </div>
                </div>

                {/* SELECTOR DE CARRERA */}
                <div className="form-group">
                    <label className="form-label">Carrera</label>
                    <div className="input-wrapper">
                        <select 
                            className="form-control-aesthetic" 
                            value={carrera} 
                            onChange={(e) => setCarrera(e.target.value)}
                            required={isRegistering}
                            style={{background: 'white'}}
                        >
                            <option value="">-- Selecciona tu Carrera --</option>
                            {carrerasDisponibles.sort().map((c, index) => (
                                <option key={index} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <div className="input-wrapper">
              <input type="email" className="form-control-aesthetic" placeholder="ejemplo@upds.edu.bo"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="input-wrapper">
              <input type={showPassword ? "text" : "password"} className="form-control-aesthetic" placeholder="••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
              <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "👁️" : "🔒"}
              </span>
            </div>
          </div>

          <button type="submit" className="btn-login-aesthetic" disabled={loading}>
            {loading ? "Procesando..." : (isRegistering ? "Registrarse" : "Ingresar")}
          </button>
        </form>

        <div className="toggle-mode">
            {isRegistering ? (
                <p>¿Ya tienes cuenta? <span onClick={() => setIsRegistering(false)}>Inicia Sesión</span></p>
            ) : (
                <p>¿Eres nuevo? <span onClick={() => setIsRegistering(true)}>Regístrate aquí</span></p>
            )}
        </div>

      </div>
    </div>
  );
};

export default Login;