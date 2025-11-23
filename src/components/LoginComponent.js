import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaSignInAlt, FaEnvelope, FaLock } from 'react-icons/fa';

export const LoginComponent = ({ onLoginSuccess, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    console.log('Intentando login con:', { email, password });
    
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL || "http://localhost:8080"}/api/auth/login`, 
      {
        email: email,        // ✅ Esto está BIEN (coincide con LoginRequest)
        password: password   // ✅ Esto está BIEN (coincide con LoginRequest)
      },
      {
        withCredentials: true
      }
    );
    
    console.log('✅ Respuesta del servidor:', response.data);
    
    const token = response.data.token;
    const userFromBackend = response.data.user;
    
    // ✅ Mapeo CORREGIDO - usar los nombres exactos del backend
    const adaptedUser = {
       idUsuario: userFromBackend.id,
      nombreUsuario: userFromBackend.nombre, 
      apellidoUsuario: userFromBackend.apellido, 
      emailUsuario: userFromBackend.email 
    };
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(adaptedUser));

    onLoginSuccess(adaptedUser);
    onClose();

  } catch (error) {
    console.error('❌ Error completo:', error);
    console.error('❌ Response data:', error.response?.data);
    console.error('❌ Response status:', error.response?.status);
    
    // Mejorar el mensaje de error
    if (error.response?.status === 401) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
    } else {
      setError(error.response?.data || 'Error al iniciar sesión. Intenta nuevamente.');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <Modal show={true} onHide={onClose} centered> 
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold text-primary">
          <FaSignInAlt className="me-2" />
          Iniciar Sesión
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        {error && <Alert variant="danger" className="small">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          
          <Form.Group className="mb-3" controlId="email">
            <Form.Label className="fw-medium">
              <FaEnvelope className="me-1 text-muted" /> Email
            </Form.Label>
            <Form.Control
              type="email"
              placeholder="Ingresa tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-3"
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="password">
            <Form.Label className="fw-medium">
              <FaLock className="me-1 text-muted" /> Contraseña
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-3"
            />
          </Form.Group>

          <div className="d-grid">
            <Button type="submit" variant="primary" disabled={loading} className="py-2 rounded-3">
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Ingresando...
                </>
              ) : (
                <>
                  <FaSignInAlt className="me-1" />
                  Ingresar
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default LoginComponent;