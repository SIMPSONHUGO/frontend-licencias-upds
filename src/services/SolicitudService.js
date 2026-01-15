import axios from 'axios';

// ⚠️ Asegúrate de que este puerto coincida con el de tu terminal de .NET (5057)
const API_URL = "http://localhost:5057/api/solicitud"; 

export const solicitudService = {

    // 1. CREAR SOLICITUD (Estudiante)
    // Se mantiene POST y el envío de FormData para los archivos de respaldo
    crear: async (formData, token) => {
        try {
            const response = await axios.post(API_URL, formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`
                    // Axios configura automáticamente el 'Content-Type' para FormData
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error en crear solicitud:", error);
            throw error;
        }
    },

    // 2. OBTENER MIS SOLICITUDES (Estudiante)
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

    // 3. OBTENER PENDIENTES (Jefe de Carrera)
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

    // 4. REVISAR SOLICITUD (Aprobar/Rechazar - Jefe de Carrera)
    // CORRECCIÓN: Se usa POST según tu SolicitudController
    revisar: async (id, estado, observacion, token) => {
        try {
            const response = await axios.post(`${API_URL}/revisar/${id}`, 
            { 
                Estado: estado,       // Sincronizado con RevisarDTO en C#
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

    // 5. OBTENER PROCESADAS (Jefe de Carrera - Historial)
    // Vital para que los contadores del Dashboard no se queden en 0
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

    // 6. DERIVAR AL DECANO
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