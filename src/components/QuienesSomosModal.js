// components/QuienesSomosModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const QuienesSomosModal = ({ show, onClose }) => {
  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Quiénes Somos</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-4">
          <h3 className="text-primary">ComparAR</h3>
          <p className="lead">Tu compañero inteligente para compras más económicas</p>
        </div>
        
        <div className="row">
          <div className="col-md-4 mb-3">
            <h5>🏆 Nuestra Misión</h5>
            <p>
              Ayudar a las familias y personas a optimizar sus compras de supermercado 
              comparando precios entre diferentes cadenas y encontrando las mejores ofertas.
            </p>
          </div>
          <div className="col-md-4 mb-3">
            <h5>👁️ Nuestra Visión</h5>
            <p>
              Ser la plataforma líder en comparación de precios de Argentina, 
              empoderando a los consumidores para tomar decisiones informadas.
            </p>
          </div>
          <div className="col-md-4 mb-3">
            <h5>💎 Nuestros Valores</h5>
            <ul className="list-unstyled small">
              <li>• <strong>Transparencia:</strong> Información clara y veraz</li>
              <li>• <strong>Innovación:</strong> Tecnología al servicio del ahorro</li>
              <li>• <strong>Compromiso:</strong> Con el bienestar de las familias</li>
              <li>• <strong>Accesibilidad:</strong> Servicio gratuito para todos</li>
            </ul>
          </div>
        </div>

        <div className="mt-4">
          <h5>✨ Lo que ofrecemos</h5>
          <div className="row">
            <div className="col-md-6">
              <ul>
                <li>Comparación de precios en tiempo real</li>
                <li>Listas de compras inteligentes</li>
                <li>Sucursales cercanas y favoritas</li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul>
                <li>Chatbot de recetas con IA</li>
                <li>Alertas de ofertas y promociones</li>
                <li>Planificación de compras semanales</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-light p-3 rounded mt-3">
          <h6>📊 Datos que nos respaldan</h6>
          <div className="row text-center">
            <div className="col-4">
              <strong className="text-primary">10K+</strong>
              <p className="small mb-0">Usuarios activos</p>
            </div>
            <div className="col-4">
              <strong className="text-primary">800+</strong>
              <p className="small mb-0">Sucursales</p>
            </div>
            <div className="col-4">
              <strong className="text-primary">70k+</strong>
              <p className="small mb-0">Productos</p>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QuienesSomosModal;