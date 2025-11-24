import { useState, useEffect, useRef } from "react";
import api from "../api";
import {
  FaRobot,
  FaUser,
  FaPaperPlane,
  FaTimes,
  FaMinus,
  FaExpand,
  FaCompress,
  FaCopy,
  FaRegCopy,
  FaSpinner,
} from "react-icons/fa";

const ChatBotComponent = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const textAreaRef = useRef(null);
  const eventSourceRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          text: "¡Hola! Soy tu asistente culinario. Puedo ayudarte a encontrar recetas deliciosas. ¿Qué te gustaría cocinar hoy?",
          isBot: true,
          timestamp: new Date(),
          type: "text",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height =
        Math.min(textAreaRef.current.scrollHeight, 120) + "px";
    }
  }, [inputMessage]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // 🔧 FUNCIÓN MEJORADA PARA RAILWAY
  const getBackendUrl = () => {
    // 1. Variable de entorno (PRIORIDAD MÁXIMA)
    if (process.env.REACT_APP_API_URL) {
      console.log("🌐 Usando REACT_APP_API_URL:", process.env.REACT_APP_API_URL);
      return process.env.REACT_APP_API_URL;
    }
    
    // 2. Railway en producción
    if (window.location.hostname.includes('vercel.app')) {
      const railwayUrl = 'https://backend-production-4d5a.up.railway.app';
      console.log("🌐 Usando Railway URL:", railwayUrl);
      return railwayUrl;
    }
    
    // 3. Fallback local
    const localUrl = 'http://localhost:8080';
    console.log("🌐 Usando Local URL:", localUrl);
    return localUrl;
  };

  const toggleChat = () => {
    console.log("toggleChat - Estado actual:", { isOpen, isMinimized });
    
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    } else if (isOpen) {
      setIsOpen(false);
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
    
    if (isExpanded) {
      setIsExpanded(false);
    }
  };

  const minimizeChat = () => {
    console.log("minimizeChat");
    setIsMinimized(true);
    setIsOpen(false);
    if (isExpanded) {
      setIsExpanded(false);
    }
  };

  const toggleExpand = () => {
    console.log("toggleExpand - Estado actual:", { isOpen, isExpanded });
    if (isOpen) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || isStreaming) return;

    const userMessage = {
      id: Date.now() + 1,
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");

    await generarRecetaConStreaming(currentMessage);
  };

  // 🔥 FUNCIÓN STREAMING OPTIMIZADA PARA RAILWAY
  const generarRecetaConStreaming = async (mensajeUsuario) => {
    setIsLoading(true);
    setIsStreaming(true);
    setProgress(0);

    const loadingMessage = {
      id: Date.now() + 2,
      text: "🤖 Conectando con servidor Railway...",
      isBot: true,
      timestamp: new Date(),
      type: "loading",
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const encodedMessage = encodeURIComponent(mensajeUsuario);
      const backendUrl = getBackendUrl();
      const url = `${backendUrl}/api/chatbot/consulta-stream?mensaje=${encodedMessage}`;
      
      console.log("🌐 Conectando SSE a Railway:", url);

      // Cerrar conexión anterior
      if (eventSourceRef.current) {
        console.log("🔒 Cerrando conexión SSE anterior");
        eventSourceRef.current.close();
      }

      // 🔥 CONFIGURACIÓN ESPECÍFICA PARA RAILWAY
      eventSourceRef.current = new EventSource(url, {
        withCredentials: false // 🔥 IMPORTANTE para Railway
      });

      eventSourceRef.current.onopen = (event) => {
        console.log("✅ Conexión SSE establecida con Railway", event);
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.type === "loading") {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              ...lastMessage,
              text: "✅ Conectado - Generando tu receta..."
            };
            return newMessages;
          }
          return prev;
        });
      };

      // 🔥 MANEJADOR GENÉRICO MEJORADO
      eventSourceRef.current.onmessage = (event) => {
        console.log("📨 Mensaje genérico Railway:", event.data);
        try {
          const data = JSON.parse(event.data);
          handleStreamEvent(data);
        } catch (error) {
          console.log("📨 Datos raw recibidos:", event.data);
          // Intentar manejar como texto plano
          handleStreamEvent({
            type: "receta",
            linea: event.data,
            progreso: progress + 5
          });
        }
      };

      // 🔥 CONFIGURAR LISTENERS ESPECÍFICOS
      const eventTypes = ['heartbeat', 'inicio', 'empezando', 'receta', 'completo', 'error', 'error_fatal'];
      eventTypes.forEach(eventType => {
        eventSourceRef.current.addEventListener(eventType, (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log(`🎯 Evento ${eventType}:`, data);
            handleStreamEvent(data);
          } catch (error) {
            console.error(`❌ Error parsing ${eventType}:`, error);
            console.log("📄 Datos raw:", event.data);
          }
        });
      });

      eventSourceRef.current.onerror = (error) => {
        console.error("🚨 SSE Error en Railway:", error);
        console.log("📊 ReadyState:", eventSourceRef.current?.readyState);
        
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          handleStreamError("Conexión cerrada por el servidor Railway");
        } else {
          handleStreamError("Error de conexión con Railway");
        }
      };

      // TIMEOUT 2.5 minutos (más generoso)
      setTimeout(() => {
        if (eventSourceRef.current && isStreaming) {
          console.log("⏰ Timeout de streaming - cerrando conexión");
          handleStreamError("Timeout: El proceso tardó demasiado");
        }
      }, 150000);

    } catch (error) {
      console.error("❌ Error al iniciar streaming con Railway:", error);
      handleStreamError("No se pudo conectar con el servidor Railway: " + error.message);
    }
  };

  // 🔧 FUNCIÓN MEJORADA PARA MANEJAR EVENTOS DE STREAM
  const handleStreamEvent = (data) => {
    console.log("📨 Procesando evento Railway:", data);

    switch (data.type) {
      case "inicio":
      case "empezando":
        console.log("🔄 Actualizando mensaje de estado:", data.data);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.type === "loading"
              ? { ...msg, text: data.data, type: "text" }
              : msg
          )
        );
        break;

      case "heartbeat":
        console.log("💓 Heartbeat recibido:", data.data);
        // Solo actualizar si es un mensaje de loading
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.type === "loading") {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              ...lastMessage,
              text: data.data
            };
            return newMessages;
          }
          return prev;
        });
        break;

      case "receta":
        if (data.linea !== undefined && data.linea !== null) {
          console.log("📝 Procesando fragmento de receta:", {
            linea: data.linea,
            progreso: data.progreso
          });
          handleRecipeLine(data);
        }
        break;

      case "completo":
        console.log("✅ Streaming completado en Railway");
        handleStreamComplete();
        break;

      case "error":
      case "error_fatal":
        console.log("❌ Error en streaming:", data.data);
        handleStreamError(data.data || "Error del servidor");
        break;

      default:
        console.log("❓ Tipo de evento no manejado:", data.type, data);
    }
  };

  // Función para manejar errores de servicio específicos
  const handleServiceError = (data) => {
    console.log("🔴 Error de servicio recibido:", data);
    
    setIsLoading(false);
    setIsStreaming(false);
    setProgress(0);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setMessages((prev) => {
      const filteredMessages = prev.filter(
        (msg) => msg.type !== "loading" && msg.type !== "streaming"
      );

      return [
        ...filteredMessages,
        {
          id: Date.now() + 4,
          text: data.data || "❌ Lo sentimos, estamos experimentando una alta demanda en este momento. Por favor, vuelve a probar en unos minutos. 🕒",
          isBot: true,
          timestamp: new Date(),
          type: "text",
        },
      ];
    });
  };

  const handleRecipeLine = (data) => {
    const { linea, progreso } = data;

    if (progreso !== undefined) {
      setProgress(progreso);
    }

    setMessages((prev) => {
      const existingStreamingIndex = prev.findIndex(
        (msg) => msg.type === "streaming"
      );

      if (existingStreamingIndex !== -1) {
        const updatedMessages = [...prev];
        const existingMessage = updatedMessages[existingStreamingIndex];

        const newText = existingMessage.text + (linea || '');

        console.log("🔄 Actualizando mensaje streaming:", {
          fragmento: linea,
          longitudActual: existingMessage.text.length,
          nuevaLongitud: newText.length
        });

        updatedMessages[existingStreamingIndex] = {
          ...existingMessage,
          text: newText,
          timestamp: new Date(),
        };

        return updatedMessages;
      } else {
        console.log("🆕 Creando nuevo mensaje streaming con fragmento:", linea);
        
        const newMessage = {
          id: Date.now() + 3,
          text: linea || '',
          isBot: true,
          timestamp: new Date(),
          type: "streaming",
        };

        const filteredMessages = prev.filter((msg) => msg.type !== "loading");
        return [...filteredMessages, newMessage];
      }
    });
  };

  const handleStreamComplete = () => {
    setIsLoading(false);
    setIsStreaming(false);
    setProgress(100);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.type === "streaming" ? { ...msg, type: "text" } : msg
      )
    );
  };

  const handleStreamError = (customMessage = null) => {
    console.log("🔴 Error de streaming - cerrando conexión");
    
    setIsLoading(false);
    setIsStreaming(false);
    setProgress(0);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setMessages((prev) => {
      const hasStreaming = prev.some(msg => msg.type === "streaming");
      const hasLoading = prev.some(msg => msg.type === "loading");
      
      if (!hasStreaming && !hasLoading) {
        const errorId = Date.now() + 4;
        return [
          ...prev,
          {
            id: errorId,
            text: customMessage || "❌ Lo siento, hubo un error al generar la receta. Por favor, intenta de nuevo.",
            isBot: true,
            timestamp: new Date(),
            type: "text",
          },
        ];
      }
      
      // Si hay contenido de streaming, convertirlo a texto normal
      return prev.map(msg => 
        msg.type === "streaming" ? { ...msg, type: "text" } : msg
      );
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Error al copiar texto: ", err);
    }
  };

  const formatMessageText = (text) => {
    const processPlaintext = (t) => {
      if (!t) return null; 

      return t.split('\n').map((part, i) => (
        <span key={i}>
          {part}
          {i < t.split('\n').length - 1 && <br />}
        </span>
      ));
    };

    return text.split("\n").map((line, index) => {
      if (line.startsWith("### ")) {
        return (
          <h4 key={index} className="message-section-title">
            {processPlaintext(line.replace("### ", ""))}
          </h4>
        );
      } else if (line.startsWith("* **")) {
        const match = line.match(/\* \*\*(.*?)\*\*: (.*)/);
        if (match) {
          return (
            <div key={index} className="message-ingredient">
              <strong>{match[1]}:</strong> {processPlaintext(match[2])}
            </div>
          );
        }
      } else if (line.startsWith("- ")) {
        return (
          <li key={index} className="message-list-item">
            {processPlaintext(line.replace("- ", ""))}
          </li>
        );
      } else if (line.startsWith("* ")) {
        return (
          <li key={index} className="message-list-item">
            {processPlaintext(line.replace("* ", ""))}
          </li>
        );
      } else if (line.trim() === "") {
        return <br key={index} />;
      } else if (line.match(/^\d+\. /)) {
        const stepContent = line.replace(/^\d+\. /, '');
        return (
          <div key={index} className="message-step">
            {line.match(/^\d+\. /)[0]} {processPlaintext(stepContent)}
          </div>
        );
      } else if (line.includes("**")) {
        const parts = line.split("**");
        return (
          <p key={index}>
            {parts.map((part, i) =>
              i % 2 === 1 
                ? <strong key={i}>{part}</strong> 
                : processPlaintext(part)
            )}
          </p>
        );
      }
      
      return <p key={index}>{processPlaintext(line)}</p>;
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // 🔥 BOTÓN DE PRUEBA TEMPORAL - Eliminar después de las pruebas
  const testConnection = async () => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/chatbot/health`);
      const data = await response.json();
      console.log("✅ Health Check:", data);
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `✅ Health Check: ${data.status} - ${data.service}`,
        isBot: true,
        timestamp: new Date(),
        type: "text",
      }]);
    } catch (error) {
      console.error("❌ Health Check failed:", error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `❌ Health Check failed: ${error.message}`,
        isBot: true,
        timestamp: new Date(),
        type: "text",
      }]);
    }
  };

  return (
    <div className={`chatbot-container ${isExpanded ? "expanded" : ""}`}>
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

      {isMinimized && (
        <div className="chatbot-minimized">
          <button className="minimized-header" onClick={toggleChat}>
            <FaRobot />
            <span>Asistente de Recetas</span>
            <FaExpand
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand();
              }}
            />
          </button>
        </div>
      )}

      {isOpen && (
        <div className={`chatbot-window ${isExpanded ? "expanded" : ""}`}>
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-avatar">
                <FaRobot />
              </div>
              <div className="chatbot-info">
                <h5>Asistente de Recetas</h5>
                <div className="status-indicator">
                  <div className="status-dot"></div>
                  <span>
                    {isStreaming ? "Escribiendo receta..." : "En línea"}
                  </span>
                </div>
              </div>
            </div>
            <div className="chatbot-actions">
              {/* 🔥 BOTÓN DE PRUEBA TEMPORAL - Eliminar después */}
              <button
                className="btn-chat-action test-btn"
                onClick={testConnection}
                title="Probar conexión"
                style={{ fontSize: '12px', padding: '4px 8px' }}
              >
                Test
              </button>
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

          {isStreaming && (
            <div className="streaming-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="progress-text">{progress}%</span>
            </div>
          )}

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${
                  message.isBot ? "bot-message" : "user-message"
                } ${message.type === "streaming" ? "streaming-message" : ""}`}
              >
                <div className="message-avatar">
                  {message.isBot ? <FaRobot /> : <FaUser />}
                </div>
                <div className="message-content">
                  <div className="message-bubble">
                    <div className="message-text">
                      {message.text.includes("<span class='dot-animation'>") ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: message.text }}
                        />
                      ) : (
                        formatMessageText(message.text)
                      )}

                      {message.type === "streaming" && (
                        <span className="typing-cursor">|</span>
                      )}
                    </div>
                    {message.isBot &&
                      message.type === "text" &&
                      message.text.length > 100 && (
                        <button
                          className="copy-btn"
                          onClick={() =>
                            copyToClipboard(message.text, message.id)
                          }
                          title="Copiar receta"
                        >
                          {copiedMessageId === message.id ? (
                            <FaCopy />
                          ) : (
                            <FaRegCopy />
                          )}
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

            {isLoading && !isStreaming && (
              <div className="message bot-message">
                <div className="message-avatar">
                  <FaRobot />
                </div>
                <div className="message-content">
                  <div className="message-bubble typing-indicator">
                    <span>Procesando</span>
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
                  disabled={isLoading || isStreaming}
                  rows={1}
                />
                <button
                  type="submit"
                  className="btn-send"
                  disabled={isLoading || isStreaming || !inputMessage.trim()}
                >
                  {isLoading || isStreaming ? (
                    <FaSpinner className="spinner" />
                  ) : (
                    <FaPaperPlane />
                  )}
                </button>
              </div>
              <div className="input-suggestions">
                {isStreaming ? (
                  <small className="streaming-notice">
                    <FaSpinner className="spinner" /> Generando receta...
                  </small>
                ) : (
                  <small>
                    Presiona **Enter** para enviar, **Shift+Enter** para nueva línea
                  </small>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBotComponent;