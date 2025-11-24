// components/ContactanosModal.js - VERSIÓN CON COPIA AL USUARIO
import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import emailjs from '@emailjs/browser';

const ContactanosModal = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // REEMPLAZA CON TUS DATOS REALES DE EMAILJS
  const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_akkydrf',
    TEMPLATE_ID_ADMIN: 'template_bck0a3p', // Para ti
    TEMPLATE_ID_USER: 'template_7x5bzq5',   // Para el usuario
    PUBLIC_KEY: 'D5gYkYF1RdNiwetsh'
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.email || !formData.asunto || !formData.mensaje) {
      alert('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);

    try {
    const templateParams = {
      from_name: formData.nombre,
      from_email: formData.email,
      subject: formData.asunto,
      message: formData.mensaje,
      reply_to: formData.email
    };

      // Enviar email al ADMIN (tú)
      const adminResult = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID_ADMIN,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

           // Enviar email de confirmación al USUARIO
      const userResult = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID_USER,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

           
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setIsLoading(false);
        setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
        onClose();
      }, 4000);

    } catch (error) {
      console.error('❌ Error EmailJS:', error);
      
      let errorMessage = 'Error al enviar el mensaje. Intenta nuevamente.';
      
      if (error.text) {
        errorMessage = `Error: ${error.text}`;
      } else if (error.status) {
        errorMessage = `Error ${error.status}: ${error.text || 'Verifica tu configuración'}`;
      }
      
      alert(errorMessage);
      setIsLoading(false);
    }
  };

  const openWhatsApp = () => {
    const phoneNumber = '5491112345678';
    const message = 'Hola, me gustaría obtener más información sobre ComparAR';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email',
      detail: 'contacto@comparar.com',
      description: 'Respondemos en 24 horas'
    },
    {
      icon: '📞',
      title: 'Teléfono',
      detail: '+54 9 11 1234-5678',
      description: 'Lun a Vie de 9:00 a 18:00'
    },
    {
      icon: '💬',
      title: 'WhatsApp',
      detail: '+54 9 11 8765-4321',
      description: 'Chat en tiempo real',
      action: openWhatsApp,
      isClickable: true
    }
  ];

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Contáctanos</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {showAlert && (
          <Alert variant="success" className="mb-3">
            <strong>¡Mensaje enviado correctamente!</strong><br />
            Te hemos enviado una copia a tu email. Te contactaremos dentro de las próximas 24 horas.
          </Alert>
        )}

        <div className="row">
          <div className="col-md-6">
            <h5 className="text-primary">📞 Formas de Contacto</h5>
            {contactMethods.map((method, index) => (
              <div 
                key={index} 
                className={`mb-3 p-3 border rounded ${method.isClickable ? 'hover-card' : ''}`}
                style={{ 
                  cursor: method.isClickable ? 'pointer' : 'default', 
                  transition: 'all 0.3s ease',
                  backgroundColor: method.isClickable ? '#f8f9fa' : 'white'
                }}
                onClick={method.action || undefined}
              >
                <div className="d-flex align-items-center">
                  <span className="fs-4 me-3">{method.icon}</span>
                  <div>
                    <h6 className="mb-1 text-primary">{method.title}</h6>
                    <strong>{method.detail}</strong>
                    <p className="small text-muted mb-0">{method.description}</p>
                    {method.isClickable && (
                      <p className="small text-primary mb-0 mt-1">
                        <strong>← Haz clic para chatear</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-4 p-3 bg-light rounded">
              <h6 className="text-primary">📍 Oficina Central</h6>
              <p className="mb-1">
                <strong>Dirección:</strong> Av. Corrientes 1234, CABA
              </p>
              <p className="mb-1">
                <strong>Horario:</strong> Lunes a Viernes 9:00 - 18:00
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <h5 className="text-primary">✉️ Envíanos un Mensaje</h5>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre completo *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Tu nombre"
                  disabled={isLoading}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com"
                  disabled={isLoading}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Asunto *</Form.Label>
                <Form.Select
                  name="asunto"
                  value={formData.asunto}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                >
                  <option value="">Selecciona un asunto</option>
                  <option value="soporte">Soporte técnico</option>
                  <option value="sugerencia">Sugerencia</option>
                  <option value="reporte">Reportar error</option>
                  <option value="colaboracion">Colaboración</option>
                  <option value="otro">Otro</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mensaje *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  required
                  placeholder="Describe tu consulta o sugerencia..."
                  disabled={isLoading}
                />
              </Form.Group>

              <div className="d-grid">
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Mensaje'
                  )}
                </Button>
              </div>
              <div className="text-center mt-2">
                <small className="text-muted">
                  * Campos obligatorios. Recibirás una copia en tu email.
                </small>
              </div>
            </Form>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ContactanosModal;