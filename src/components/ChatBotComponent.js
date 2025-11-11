// ChatBotComponent.js - Versión completamente renovada
import { useState, useEffect, useRef } from "react";
import {
  FaRobot,
  FaUser,
  FaPaperPlane,
  FaTimes,
  FaMinus,
  FaExpand,
  FaCompress,
  FaCopy,
  FaRegCopy
} from "react-icons/fa";

const ChatBotComponent = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForProductConfirmation, setWaitingForProductConfirmation] = useState(false);
  const [lastRecipe, setLastRecipe] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const textAreaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mensaje de bienvenida inicial
    if (messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          text: "¡Hola! Soy tu asistente culinario. Puedo ayudarte a encontrar recetas deliciosas. ¿Qué te gustaría cocinar hoy?",
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // Auto-ajustar altura del textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = Math.min(textAreaRef.current.scrollHeight, 120) + "px";
    }
  }, [inputMessage]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    if (waitingForProductConfirmation) {
      const respuesta = currentMessage.toLowerCase().trim();
      if (esRespuestaAfirmativa(respuesta)) {
        await buscarProductosEnBaseDeDatos();
        setWaitingForProductConfirmation(false);
      } else {
        const botMessage = {
          id: Date.now() + 1,
          text: "¡Perfecto! ¿Te gustaría consultar otra receta? 😊",
          isBot: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setWaitingForProductConfirmation(false);
        setLastRecipe("");
      }
      setIsLoading(false);
      return;
    }

    if (esConsultaDeReceta(currentMessage)) {
      setLastRecipe("");
      await generarRecetaSolo(currentMessage);
    } else {
      await generarRespuestaGeneral(currentMessage);
    }
  };

  const esConsultaDeReceta = (mensaje) => {
    const palabrasReceta = ['receta', 'como hacer', 'tutorial', 'preparar', 'cocinar', 'hacer', 'recetario'];
    return palabrasReceta.some(palabra => mensaje.toLowerCase().includes(palabra));
  };

  const esRespuestaAfirmativa = (respuesta) => {
    const respuestasSi = ['si', 'sí', 'yes', 'vale', 'ok', 'de acuerdo', 'por supuesto', 'quiero ver', 'sí quiero'];
    return respuestasSi.some(resp => respuesta.includes(resp));
  };

  const generarRecetaSolo = async (mensajeUsuario) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:8080/api/chatbot/solo-receta", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ mensaje: mensajeUsuario }),
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const data = await response.json();
      
      // Dividir el texto largo en partes más manejables
      const mensajesDivididos = dividirMensajeLargo(data.respuesta);
      
      // Agregar todos los mensajes divididos
      mensajesDivididos.forEach((texto, index) => {
        const botMessage = {
          id: Date.now() + index,
          text: texto,
          isBot: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      });

      // Solo preguntar por productos en el último mensaje
      const preguntaProductos = {
        id: Date.now() + mensajesDivididos.length,
        text: "🛒 **¿Te gustaría que busque los ingredientes en nuestra base de datos?** (Responde 'sí' para ver productos disponibles)",
        isBot: true,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, preguntaProductos]);
      setLastRecipe(data.respuesta);
      setWaitingForProductConfirmation(true);
      
    } catch (error) {
      console.error("Error al generar receta:", error);
      const errorMessage = {
        id: Date.now(),
        text: "Lo siento, hubo un error al generar la receta. Por favor, intenta de nuevo.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para dividir mensajes largos en partes más pequeñas
  const dividirMensajeLargo = (texto) => {
    const maxLength = 1500; // Caracteres por mensaje
    const partes = [];
    
    if (texto.length <= maxLength) {
      return [texto];
    }

    // Dividir por secciones (###)
    const secciones = texto.split('###');
    
    secciones.forEach((seccion, index) => {
      if (seccion.trim()) {
        const seccionCompleta = index === 0 ? seccion : `###${seccion}`;
        
        if (seccionCompleta.length <= maxLength) {
          partes.push(seccionCompleta);
        } else {
          // Dividir la sección en párrafos más pequeños
          const parrafos = seccionCompleta.split('\n\n');
          let mensajeActual = '';
          
          parrafos.forEach(parrafo => {
            if ((mensajeActual + parrafo).length <= maxLength) {
              mensajeActual += (mensajeActual ? '\n\n' : '') + parrafo;
            } else {
              if (mensajeActual) partes.push(mensajeActual);
              mensajeActual = parrafo;
            }
          });
          
          if (mensajeActual) partes.push(mensajeActual);
        }
      }
    });

    return partes;
  };

  const buscarProductosEnBaseDeDatos = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const consultaParaProductos = lastRecipe || 
        messages.filter(m => !m.isBot).slice(-1)[0]?.text || "";

      if (!consultaParaProductos) {
        throw new Error("No se encontró consulta para buscar productos");
      }

      const response = await fetch("http://localhost:8080/api/chatbot/buscar-productos", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ 
          receta: lastRecipe
        }),
      });

      if (!response.ok) {
        throw new Error("Error al buscar productos");
      }

      const data = await response.json();
      const productosText = formatearSoloProductos(data);
      
      // Dividir también el mensaje de productos si es muy largo
      const mensajesProductos = dividirMensajeLargo(productosText);
      
      mensajesProductos.forEach((texto, index) => {
        const botMessage = {
          id: Date.now() + index,
          text: texto,
          isBot: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      });
      
      setLastRecipe("");
      
    } catch (error) {
      console.error("Error al buscar productos:", error);
      const errorMessage = {
        id: Date.now(),
        text: "Lo siento, no pude buscar los productos en este momento. ¿Te gustaría intentar de nuevo?",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generarRespuestaGeneral = async (mensajeUsuario) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:8080/api/chatbot/solo-receta", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ mensaje: mensajeUsuario }),
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const data = await response.json();
      
      // Dividir respuesta general si es larga
      const mensajesDivididos = dividirMensajeLargo(data.respuesta);
      
      mensajesDivididos.forEach((texto, index) => {
        const botMessage = {
          id: Date.now() + index,
          text: texto,
          isBot: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      });
      
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      const errorMessage = {
        id: Date.now(),
        text: "Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatearSoloProductos = (data) => {
    let respuesta = '🛒 **PRODUCTOS ENCONTRADOS EN NUESTRA BASE DE DATOS:**\n\n';
    
    if (data.productosEncontrados && data.productosEncontrados.length > 0) {
      data.productosEncontrados.forEach(ingrediente => {
        respuesta += `📋 **${ingrediente.nombreIngrediente}:**\n`;
        
        if (ingrediente.productos && ingrediente.productos.length > 0) {
          ingrediente.productos.forEach(producto => {
            respuesta += `• ${producto.descripcion} - ${producto.marca || 'Sin marca'} (${producto.cantidadPresentacion || 'Cantidad no especificada'})\n`;
          });
        } else {
          respuesta += `• No se encontraron productos para este ingrediente\n`;
        }
        respuesta += '\n';
      });
      
      respuesta += '💡 **Tip:** Estos son algunos productos disponibles que podrías usar para esta receta.';
    } else {
      respuesta += 'No se encontraron productos para los ingredientes de esta receta. 🤔';
    }

    return respuesta;
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Error al copiar texto: ', err);
    }
  };

  const formatMessageText = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <h4 key={index} className="message-section-title">{line.replace('### ', '')}</h4>;
      } else if (line.startsWith('* **')) {
        const match = line.match(/\* \*\*(.*?)\*\*: (.*)/);
        if (match) {
          return (
            <div key={index} className="message-ingredient">
              <strong>{match[1]}:</strong> {match[2]}
            </div>
          );
        }
      } else if (line.startsWith('* ')) {
        return <li key={index} className="message-list-item">{line.replace('* ', '')}</li>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else if (line.match(/^\d+\. /)) {
        return <div key={index} className="message-step">{line}</div>;
      } else if (line.includes('**')) {
        // Texto con negritas
        const parts = line.split('**');
        return (
          <p key={index}>
            {parts.map((part, i) => 
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </p>
        );
      }
      return <p key={index}>{line}</p>;
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className={`chatbot-container ${isExpanded ? 'expanded' : ''}`}>
      {/* Botón flotante */}
      {!isOpen && !isMinimized && (
        <button
          className="chatbot-toggle-btn"
          onClick={toggleChat}
          aria-label="Abrir chat de recetas"
        >
          <FaRobot className="chatbot-icon" />
          <span className="notification-dot"></span>
        </button>
      )}

      {/* Chat minimizado */}
      {isMinimized && (
        <div className="chatbot-minimized">
          <button className="minimized-header" onClick={toggleChat}>
            <FaRobot />
            <span>Asistente de Recetas</span>
            <FaExpand onClick={(e) => { e.stopPropagation(); toggleExpand(); }} />
          </button>
        </div>
      )}

      {/* Ventana del chat */}
      {isOpen && (
        <div className={`chatbot-window ${isExpanded ? 'expanded' : ''}`}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-avatar">
                <FaRobot />
              </div>
              <div className="chatbot-info">
                <h5>Asistente de Recetas</h5>
                <div className="status-indicator">
                  <div className="status-dot"></div>
                  <span>En línea</span>
                </div>
              </div>
            </div>
            <div className="chatbot-actions">
              <button
                className="btn-chat-action"
                onClick={toggleExpand}
                title={isExpanded ? "Contraer" : "Expandir"}
              >
                {isExpanded ? <FaCompress /> : <FaExpand />}
              </button>
              <button
                className="btn-chat-action"
                onClick={minimizeChat}
                title="Minimizar"
              >
                <FaMinus />
              </button>
              <button
                className="btn-chat-action"
                onClick={toggleChat}
                title="Cerrar"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.isBot ? "bot-message" : "user-message"}`}
              >
                <div className="message-avatar">
                  {message.isBot ? <FaRobot /> : <FaUser />}
                </div>
                <div className="message-content">
                  <div className="message-bubble">
                    <div className="message-text">
                      {formatMessageText(message.text)}
                    </div>
                    {message.isBot && message.text.length > 100 && (
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(message.text, message.id)}
                        title="Copiar receta"
                      >
                        {copiedMessageId === message.id ? <FaCopy /> : <FaRegCopy />}
                      </button>
                    )}
                  </div>
                  <div className="message-footer">
                    <span className="message-time">
                      {formatTime(message.timestamp)}
                    </span>
                    {copiedMessageId === message.id && (
                      <span className="copied-indicator">¡Copiado!</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message bot-message">
                <div className="message-avatar">
                  <FaRobot />
                </div>
                <div className="message-content">
                  <div className="message-bubble typing-indicator">
                    <span>Escribiendo</span>
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <form onSubmit={handleSendMessage} className="chatbot-input-form">
              <div className="input-group">
                <textarea
                  ref={textAreaRef}
                  className="chat-input"
                  placeholder="Pregúntame sobre recetas..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  rows={1}
                />
                <button
                  type="submit"
                  className="btn-send"
                  disabled={isLoading || !inputMessage.trim()}
                >
                  <FaPaperPlane />
                </button>
              </div>
              <div className="input-suggestions">
                <small>Presiona Enter para enviar, Shift+Enter para nueva línea</small>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBotComponent;