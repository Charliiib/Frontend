import api from '../api';

export const direccionService = {
    // Obtener direcciones del usuario
    getDireccionesByUsuario: async (idUsuario) => {
        try {
            console.log('Buscando direcciones para usuario:', idUsuario);
            const response = await api.get(`/direcciones/usuario/${idUsuario}`);
            console.log('Direcciones encontradas:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo direcciones:', error);
            if (error.response?.status === 404) {
                console.log('No hay direcciones para este usuario');
                return [];
            }
            throw error;
        }
    },

    // Obtener última dirección usada
    getUltimaDireccion: async (idUsuario) => {
        try {
            console.log('Buscando última dirección para usuario:', idUsuario);
            const response = await api.get(`/direcciones/usuario/${idUsuario}/ultima`);
            console.log('Última dirección encontrada:', response.data);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('No hay última dirección para este usuario');
                return null;
            }
            console.error('Error obteniendo última dirección:', error);
            throw error;
        }
    },

    // Guardar nueva dirección
saveDireccion: async (direccionData) => {
    try {
        console.log('Guardando dirección:', direccionData);
        
        // Validar que los datos requeridos estén presentes
        if (!direccionData.idUsuario || !direccionData.nombreDireccion) {
            throw new Error('Datos incompletos para guardar dirección');
        }

        const response = await api.post('/direcciones', direccionData);
        console.log('Dirección guardada:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error guardando dirección:', error);
        
        // Mostrar más detalles del error
        if (error.response) {
            console.error('Detalles del error:', error.response.data);
            console.error('Status:', error.response.status);
        }
        
        throw error;
    }
},

    // Actualizar dirección existente
    updateDireccion: async (id, direccionData) => {
        try {
            const response = await api.put(`/direcciones/${id}`, direccionData);
            return response.data;
        } catch (error) {
            console.error('Error actualizando dirección:', error);
            throw error;
        }
    },

    // Eliminar dirección
    deleteDireccion: async (id) => {
        try {
            await api.delete(`/direcciones/${id}`);
        } catch (error) {
            console.error('Error eliminando dirección:', error);
            throw error;
        }
    }
};