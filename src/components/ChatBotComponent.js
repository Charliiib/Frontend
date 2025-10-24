import React, { useState, useRef, useEffect } from 'react';
import { Modal, Form, Button, ListGroup, Spinner, Badge } from 'react-bootstrap';
import { FaComments, FaRobot, FaPaperPlane, FaDollarSign, FaStore } from 'react-icons/fa';
import api from '../api';

const Chatbot = ({ currentUser }) => {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar mensaje de bienvenida cuando se abre el chat
  useEffect(() => {
    if (showChat && !initialized) {
      loadWelcomeMessage();
    }
  }, [showChat, initialized]);

  const loadWelcomeMessage = async () => {
    setLoading(true);
    try {
      const response = await api.get('/chat/welcome');
      const welcomeMessage = { 
        text: response.data.response, 
        sender: 'bot',
        productos: response.data.productos,
        precios: response.data.precios,
        isWelcome: true
      };
      
      setMessages([welcomeMessage]);
      setInitialized(true);
    } catch (err) {
      console.error('Error loading welcome message:', err);
      const errorMessage = { 
        text: '¡Hola! 👋 Soy tu asistente de Comparar. ¿En qué puedo ayudarte?', 
        sender: 'bot' 
      };
      setMessages([errorMessage]);
      setInitialized(true);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { text: inputMessage, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInputMessage('');

    try {
      const response = await api.post('/chat', {
        message: inputMessage
      });

      const botMessage = { 
        text: response.data.response, 
        sender: 'bot',
        productos: response.data.productos,
        precios: response.data.precios
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = { 
        text: '⚠️ Error de conexión. Intenta nuevamente.', 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleShowChat = () => {
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    // No resetear mensajes para mantener historial
  };

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
      <Modal show={showChat} onHide={handleCloseChat} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaRobot className="me-2" />
            Asistente de Compras
            {currentUser && (
              <Badge bg="light" text="dark" className="ms-2">
                Hola, {currentUser.nombreUsuario}
              </Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body style={{ height: '500px', overflowY: 'auto' }}>
          {messages.map((msg, index) => (
            <div key={index} className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : ''}`}>
              <div className={`p-3 rounded ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-light'} ${msg.isWelcome ? 'border border-success' : ''}`} 
                   style={{ maxWidth: '80%' }}>
                
                {/* Mensaje de texto con formato */}
                <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                
                {/* Productos encontrados */}
                {msg.productos && msg.productos.length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">📦 Productos encontrados:</small>
                    <ListGroup variant="flush" className="small">
                      {msg.productos.slice(0, 5).map((producto, idx) => (
                        <ListGroup.Item key={idx} className="p-1 bg-transparent d-flex justify-content-between align-items-center">
                          <span>{producto.descripcion}</span>
                          {producto.marca && <Badge bg="secondary" className="ms-2">{producto.marca}</Badge>}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}
                
                {/* Precios encontrados */}
                {msg.precios && msg.precios.length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">💰 Precios disponibles:</small>
                    <ListGroup variant="flush" className="small">
                      {msg.precios.slice(0, 5).map((precio, idx) => (
                        <ListGroup.Item key={idx} className="p-1 bg-transparent d-flex justify-content-between">
                          <span>
                            <FaStore size={12} className="me-1" />
                            {precio.sucursal}
                          </span>
                          <Badge bg="success">
                            <FaDollarSign size={10} /> {precio.precio}
                          </Badge>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="d-flex justify-content-start mb-3">
              <div className="p-3 rounded bg-light">
                <Spinner animation="border" size="sm" className="me-2" />
                Pensando...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </Modal.Body>
        
        <Modal.Footer>
          <Form.Control
            type="text"
            placeholder="Escribe tu mensaje..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <Button 
            variant="primary" 
            onClick={sendMessage}
            disabled={loading || !inputMessage.trim()}
          >
            <FaPaperPlane />
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Chatbot;