import React, { useState } from 'react';
import axios from 'axios';
import { Modal } from 'bootstrap'; // Importa Modal de Bootstrap


const RegisterComponent = ({ onRegisterSuccess, onClose  }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password
      });

      setSuccess('Registro exitoso. Por favor inicia sesión.');
      setError('');
      
      // Cierra el modal usando la instancia correcta
      setTimeout(() => {
        const modalElement = document.getElementById('registerModal');
        if (modalElement) {
          const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
          modal.hide();
        }
        setSuccess('');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el usuario');
      console.error(err);
    }
  };

  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Crear Cuenta</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form id="registerForm" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">Nombre</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="nombre" 
                  value={formData.nombre}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="mb-3">
                <label htmlFor="apellido" className="form-label">Apellido</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="apellido" 
                  value={formData.apellido}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  id="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <input 
                type="password" 
                className="form-control" 
                id="password" 
                value={formData.password}
                onChange={handleChange}
                required 
                />
              </div>
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
                <input 
                  type="password" 
                  className="form-control" 
                  id="confirmPassword" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="d-grid">
                <button type="submit" className="btn btn-primary">Registrarse</button>
              </div>
            </form>
          </div>
          <div className="modal-footer justify-content-center">
            <span>¿Ya tienes cuenta? <a href="#" className="text-primary" data-bs-toggle="modal" data-bs-target="#loginModal" data-bs-dismiss="modal">Inicia sesión</a></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterComponent;