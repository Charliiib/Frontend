import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUserPlus, FaUser, FaEnvelope, FaLock, FaChevronRight } from 'react-icons/fa';

// Se pasa `onShowLogin` como prop desde App.js para manejar el cambio de modal
const RegisterComponent = ({ onRegisterSuccess, onClose, onShowLogin }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleLinkToLogin = (e) => {
    e.preventDefault();
    onClose(); // Cerrar el modal de registro
    onShowLogin(); // Abrir el modal de login
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password
      });

      setSuccess('Registro exitoso. Serás redirigido para iniciar sesión.');
      setError('');
      
      // Esperar un momento y redirigir al login
      setTimeout(() => {
        onClose();
        onShowLogin();
      }, 1500);

    } catch (error) {
      console.error('Error de registro:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || 'Error al registrar. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // USANDO EL COMPONENTE MODAL DE REACT-BOOTSTRAP
    <Modal show={true} onHide={onClose} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold text-primary">
          <FaUserPlus className="me-2" />
          Registrarse
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        {error && <Alert variant="danger" className="small">{error}</Alert>}
        {success && <Alert variant="success" className="small">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          {/* Nombre */}
          <Form.Group className="mb-3" controlId="nombre">
            <Form.Label className="fw-medium">
              <FaUser className="me-1 text-muted" /> Nombre
            </Form.Label>
            <Form.Control type="text" value={formData.nombre} onChange={handleChange} required className="rounded-3" />
          </Form.Group>
          
          {/* Apellido */}
          <Form.Group className="mb-3" controlId="apellido">
            <Form.Label className="fw-medium">
              <FaUser className="me-1 text-muted" /> Apellido
            </Form.Label>
            <Form.Control type="text" value={formData.apellido} onChange={handleChange} required className="rounded-3" />
          </Form.Group>
          
          {/* Email */}
          <Form.Group className="mb-3" controlId="email">
            <Form.Label className="fw-medium">
              <FaEnvelope className="me-1 text-muted" /> Email
            </Form.Label>
            <Form.Control type="email" value={formData.email} onChange={handleChange} required className="rounded-3" />
          </Form.Group>
          
          {/* Contraseña */}
          <Form.Group className="mb-3" controlId="password">
            <Form.Label className="fw-medium">
              <FaLock className="me-1 text-muted" /> Contraseña
            </Form.Label>
            <Form.Control type="password" value={formData.password} onChange={handleChange} required className="rounded-3" />
          </Form.Group>
          
          {/* Confirmar Contraseña */}
          <Form.Group className="mb-4" controlId="confirmPassword">
            <Form.Label className="fw-medium">
              <FaLock className="me-1 text-muted" /> Confirmar Contraseña
            </Form.Label>
            <Form.Control type="password" value={formData.confirmPassword} onChange={handleChange} required className="rounded-3" />
          </Form.Group>
          
          <div className="d-grid">
            <Button type="submit" variant="primary" disabled={loading} className="py-2 rounded-3">
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Registrando...
                </>
              ) : (
                <>
                  <FaUserPlus className="me-1" />
                  Registrarse
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer className="justify-content-center border-0 pt-0">
        <small>
          ¿Ya tienes cuenta? 
          <a href="#" className="text-primary fw-bold ms-1" onClick={handleLinkToLogin}>
            Inicia sesión <FaChevronRight size={10} className="ms-1" />
          </a>
        </small>
      </Modal.Footer>
    </Modal>
  );
};

export default RegisterComponent;