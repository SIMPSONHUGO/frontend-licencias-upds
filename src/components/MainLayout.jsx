import React from 'react';
import { authService } from "../services/AuthService";
import './Dashboard.css';

const MainLayout = ({ children, role, onLogout }) => {
  // Extraemos la información del usuario autenticado
  const user = authService.getUser();
  
  // Sincronización del nombre para mostrar: prioriza el nombre real guardado en el login
  const nombreMostrar = user?.nombre || "Usuario";

  return (
    <div className="dashboard-container">
      
      {/* 🟦 HEADER SUPERIOR PREMIUM (Colores Institucionales) */}
      <header className="top-bar">
        <div className="logo-area">
            <img 
                src="https://www.datec.com.bo/wp-content/uploads/2025/04/logo.png" 
                alt="Logo UPDS" 
                className="logo-img"
            />
            <span className="brand-text">UPDS</span>
        </div>
        
        <div className="user-area">
            <div className="user-info text-end">
                {/* Nombre y Rol extraídos dinámicamente */}
                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{nombreMostrar}</div>
                <div className="user-role" style={{ fontSize: '0.8rem', opacity: 0.8 }}>{role}</div>
            </div>
            
            {/* Avatar circular sólido con inicial dinámica */}
            <div style={{
                width: '40px', 
                height: '40px', 
                background: '#FFCC00', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#003366', 
                fontWeight: '900',
                fontSize: '1.2rem',
                margin: '0 15px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
                {nombreMostrar.charAt(0).toUpperCase()}
            </div>

            {/* BOTÓN FORMAL: Texto "Salir" con diseño de relieve físico configurado en Dashboard.css */}
            <button onClick={onLogout} className="logout-btn">
                Salir
            </button>
        </div>
      </header>

      {/* ⬜ SIDEBAR MINIMALISTA: Enfocado únicamente en el acceso principal */}
      <aside className="sidebar">
        <nav>
            <ul className="sidebar-menu">
                <li>
                    <a href="#" className="sidebar-link active">
                        <span className="sidebar-icon">📊</span>
                        Dashboard
                    </a>
                </li>
                {/* Apartados adicionales de configuración eliminados para limpieza visual */}
            </ul>
        </nav>
      </aside>

      {/* 📄 ÁREA DE CONTENIDO DINÁMICO */}
      <main className="main-content">
        {children}
      </main>

    </div>
  );
};

export default MainLayout;