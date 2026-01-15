import axios from 'axios';

const API_URL = "http://localhost:5057/api/auth";

export const authService = {
  
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      
      if (response.data.token) {
        const token = response.data.token;
        localStorage.setItem("token", token);

        const payload = JSON.parse(atob(token.split('.')[1]));
        
        const nombreReal = payload["unique_name"] || 
                           payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || 
                           payload["name"] || 
                           "Usuario";

        const userRole = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 
                         payload["role"] || 
                         "Estudiante";

        const userObj = { 
            nombre: nombreReal, 
            rol: userRole 
        };
        
        localStorage.setItem("user", JSON.stringify(userObj));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (nombre, email, password, carrera) => {
    try {
      const response = await axios.post(`${API_URL}/register`, { 
        nombreCompleto: nombre, 
        email, 
        password,
        carrera 
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Error de conexión");
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getToken: () => localStorage.getItem("token"),

  getUser: () => {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
  }
};