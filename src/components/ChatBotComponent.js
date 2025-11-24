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

  const toggleChat = () => {
    console.log("toggleChat - Estado actual:", { isOpen, isMinimized });
    
    if (isMinimized) {
      // Si está minimizado, restaurar a abierto
      setIsMinimized(false);
      setIsOpen(true);
    } else if (isOpen) {
      // Si está abierto, cerrar completamente
      setIsOpen(false);
      setIsMinimized(false);
    } else {
      // Si está cerrado, abrir
      setIsOpen(true);
      setIsMinimized(false);
    }
    
    // Cerrar expansión al cambiar estado
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

    // Llamamos siempre al streaming para el efecto de escritura
    await generarRecetaConStreaming(currentMessage);
  };

  const generarRecetaConStreaming = async (mensajeUsuario) => {
    setIsLoading(true);
    setIsStreaming(true);
    setProgress(0);

    // Creamos el mensaje de "cargando" antes de iniciar el stream
    const loadingMessage = {
      id: Date.now() + 2,
      text: "🤖 Analizando tu consulta y generando receta...",
      isBot: true,
      timestamp: new Date(),
      type: "loading",
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const encodedMessage = encodeURIComponent(mensajeUsuario);
      // ✅ CAMBIO PARA RAILWAY: URL actualizada
      let url = `https://backend-production-4d5a.up.railway.app/api/chatbot/consulta-stream?mensaje=${encodedMessage}`;

      eventSourceRef.current = new EventSource(url);

      eventSourceRef.current.onopen = () => {
        console.log("Conexión SSE establecida");
      };

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Evento recibido:", data);
          handleStreamEvent(data);
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      };

      eventSourceRef.current.addEventListener("inicio", (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Evento inicio:", data);
          handleStreamEvent(data);
        } catch (error) {
          console.error("Error parsing inicio event:", error);
        }
      });

      eventSourceRef.current.addEventListener("receta", (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Evento receta:", data);
          handleStreamEvent(data);
        } catch (error) {
          console.error("Error parsing receta event:", error);
        }
      });

      eventSourceRef.current.addEventListener("completo", (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Evento completo:", data);
          handleStreamEvent(data);
        } catch (error) {
          console.error("Error parsing completo event:", error);
        }
      });

      // Event listener para errores de servicio
      eventSourceRef.current.addEventListener("service_error", (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Evento service_error:", data);
          handleServiceError(data);
        } catch (error) {
          console.error("Error parsing service_error event:", error);
        }
      });

      eventSourceRef.current.addEventListener("error", (event) => {
        if (event.data) {
          try {
            const data = JSON.parse(event.data);
            console.log("Evento error:", data);
            handleStreamEvent(data);
          } catch (error) {
            console.error("Error parsing error event:", error);
          }
        } else {
          handleStreamError();
        }
      });

      eventSourceRef.current.onerror = (error) => {
        console.error("SSE Error:", error);
        handleStreamError();
      };
    } catch (error) {
      console.error("Error al iniciar streaming:", error);
      handleStreamError();
    }
  };

  const handleStreamEvent = (data) => {
    console.log("📨 Evento recibido:", data);

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

      case "receta":
        if (data.linea !== undefined && data.linea !== null) {
          console.log("📝 Procesando fragmento de receta:", {
            linea: data.linea,
            progreso: data.progreso,
            indice: data.indice,
            total: data.total
          });
          handleRecipeLine(data);
        } else {
          console.warn("⚠️ Fragmento de receta vacío o undefined:", data);
        }
        break;

      case "completo":
        console.log("✅ Streaming completado");
        handleStreamComplete();
        break;

      case "error":
        console.log("❌ Error en streaming");
        handleStreamError();
        break;

      default:
        console.log("❓ Tipo de evento no manejado:", data.type);
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
      // Filtramos mensajes de 'loading' y 'streaming' antes de añadir el error
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
      // Buscar mensaje de streaming existente
      const existingStreamingIndex = prev.findIndex(
        (msg) => msg.type === "streaming"
      );

      if (existingStreamingIndex !== -1) {
        // Actualizar mensaje existente - CONCATENAR FRAGMENTO
        const updatedMessages = [...prev];
        const existingMessage = updatedMessages[existingStreamingIndex];

        // MODIFICACIÓN: Asegurar que concatenamos correctamente
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
        // Crear nuevo mensaje de streaming
        console.log("🆕 Creando nuevo mensaje streaming con fragmento:", linea);
        
        const newMessage = {
          id: Date.now() + 3,
          text: linea || '',
          isBot: true,
          timestamp: new Date(),
          type: "streaming",
        };

        // Remover mensaje de loading si existe
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

  const handleStreamError = () => {
    console.log("🔴 Error de streaming - cerrando conexión");
    
    setIsLoading(false);
    setIsStreaming(false);
    setProgress(0);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Solo agregar mensaje de error si no hay mensajes de streaming
    setMessages((prev) => {
      const hasStreaming = prev.some(msg => msg.type === "streaming");
      const hasLoading = prev.some(msg => msg.type === "loading");
      
      if (!hasStreaming && !hasLoading) {
        // Solo mostrar error si no hay contenido
        const errorId = Date.now() + 4;
        return [
          ...prev,
          {
            id: errorId,
            text: "❌ Lo siento, hubo un error al generar la receta. Por favor, intenta de nuevo.",
            isBot: true,
            timestamp: new Date(),
            type: "text",
          },
        ];
      }
      return prev;
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
    // Función auxiliar para convertir \n a <br /> de forma segura
    const processPlaintext = (t) => {
      // Si el texto es nulo o vacío, devolver un fragmento vacío
      if (!t) return null; 

      // Dividir el texto por \n y mapear a elementos, inyectando <br />
      return t.split('\n').map((part, i) => (
        <span key={i}>
          {part}
          {/* Agrega <br /> solo si no es la última parte */}
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
        // Las líneas de pasos (1., 2., 3.)
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
      
      // Fallback final para cualquier línea de texto plano
      return <p key={index}>{processPlaintext(line)}</p>;
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
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
                        // Para todos los demás mensajes (recetas, texto de usuario, etc.), usamos el formateador seguro
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
                    Presiona **Enter** para enviar, **Shift+Enter** para nueva
                    línea
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