// components/Chatbot.js
import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FaComments, FaTimes, FaRobot } from 'react-icons/fa';

const Chatbot = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      {/* Botón flotante del chatbot */}
      <div 
        className="position-fixed"
        style={{
          bottom: '20px',
          right: '20px',
          zIndex: 1050,
          cursor: 'pointer'
        }}
        onClick={() => setShowChat(true)}
      >
        <div 
          className="bg-primary rounded-circle d-flex align-items-center justify-content-center shadow"
          style={{
            width: '60px',
            height: '60px'
          }}
        >
          <img 
            src="/chatbot-icon.png" 
            alt="Chatbot" 
            style={{
              width: '80px',
              height: '80px',
              
            }}
            onError={(e) => {
              // Si la imagen no carga, mostrar un icono por defecto
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <FaComments 
            size={30} 
            color="white" 
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Modal del chatbot */}
      <Modal 
        show={showChat} 
        onHide={() => setShowChat(false)}
        centered
        dialogClassName="modal-dialog-bottom-right"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="d-flex align-items-center">
            <FaRobot className="me-2" />
            Asistente Virtual
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          <div className="mb-3">
            <FaRobot size={50} className="text-primary" />
          </div>
          <h5>¡Hola! 👋</h5>
          <p className="mb-0">Todavía me están construyendo, pero pronto podré ayudarte con todas tus consultas.</p>
          <p>¡Vuelve pronto para charlar!</p>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Chatbot;