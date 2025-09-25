import React, { useState } from 'react';
import axios from 'axios';

export const LoginComponent = ({ onLoginSuccess, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Intentando login con:', { email, password });
      
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email: email,
        password: password
      });
      
      console.log('✅ Respuesta del servidor:', response.data);
      
      const token = response.data.token;
      const userFromBackend = response.data.user;
      
      console.log('👤 Usuario del backend:', userFromBackend);
      
      // ADAPTAR la estructura del usuario para que coincida con lo que espera el frontend
      const adaptedUser = {
        idUsuario: userFromBackend.id, // ← Convertir 'id' a 'idUsuario'
        nombreUsuario: userFromBackend.nombre, // ← 'nombre' a 'nombreUsuario'
        apellidoUsuario: userFromBackend.apellido, // ← 'apellido' a 'apellidoUsuario'
        emailUsuario: userFromBackend.email // ← 'email' a 'emailUsuario'
      };
      
      console.log('👤 Usuario adaptado:', adaptedUser);
      
      if (token && adaptedUser.idUsuario) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(adaptedUser));
        
        console.log('💾 Guardado en localStorage - token:', localStorage.getItem('token'));
        console.log('💾 Guardado en localStorage - user:', localStorage.getItem('user'));
        
        onLoginSuccess(adaptedUser);
        onClose();
      } else {
        throw new Error('Formato de respuesta incorrecto');
      }
    } catch (err) {
      console.error('❌ Error completo:', err);
      setError(
        err.response?.data?.message || 
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
    }
  };

  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Iniciar sesión</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="d-grid">
                <button type="submit" className="btn btn-primary">Ingresar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;