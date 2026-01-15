import axios from 'axios';

const API_URL = "http://localhost:5057/api/solicitud"; 

export const solicitudService = {

    crear: async (formData, token) => {
        try {
            const response = await axios.post(API_URL, formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error en crear solicitud:", error);
            throw error;
        }
    },
    obtenerMisSolicitudes: async (token) => {
        try {
            const response = await axios.get(`${API_URL}/mis-solicitudes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener mis solicitudes:", error);
            return []; 
        }
    },

    obtenerPendientes: async (token) => {
        try {
            const response = await axios.get(`${API_URL}/pendientes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener pendientes:", error);
            throw error;
        }
    },
    revisar: async (id, estado, observacion, token) => {
        try {
            const response = await axios.post(`${API_URL}/revisar/${id}`, 
            { 
                Estado: estado,      
                Observacion: observacion 
            }, 
            {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Error al revisar solicitud:", error);
            throw error;
        }
    },

    obtenerProcesadas: async (token) => {
        try {
            const response = await axios.get(`${API_URL}/procesadas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener procesadas:", error);
            throw error;
        }
    },
    derivar: async (id, token) => {
        try {
            const response = await axios.post(`${API_URL}/derivar/${id}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Error al derivar solicitud:", error);
            throw error;
        }
    }
};