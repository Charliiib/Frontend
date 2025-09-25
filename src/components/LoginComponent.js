import React, { useState } from 'react';
import api from '../api'; // Importa la instancia de api

export const LoginComponent = ({ onLoginSuccess, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', {
        email: email,
        password: password
      });
      
      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onLoginSuccess(response.data.user);
        onClose(); // Cierra el modal
      } else {
        throw new Error('Formato de respuesta incorrecto');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
      console.error('Login error:', err);
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
          <div className="modal-footer justify-content-center">
            <span>¿No tienes cuenta? <button className="btn btn-link p-0" onClick={() => { onClose(); /* Lógica para mostrar registro */ }}>Regístrate</button></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;