import React, { useState } from 'react';
import { Modal, Button, Accordion } from 'react-bootstrap';

const PreguntasFrecuentesModal = ({ show, onClose, onShowContactanos }) => {
  const [activeKey, setActiveKey] = useState('0');

  const faqs = [
    {
      pregunta: "¿Cómo funciona la comparación de precios?",
      respuesta: "Nuestra plataforma recopila información de precios de múltiples supermercados en tiempo real y los compara para mostrarte las mejores opciones disponibles en tu zona."
    },
    {
      pregunta: "¿Los precios son exactos?",
      respuesta: "Actualizamos los precios constantemente, pero pueden haber variaciones. Te recomendamos verificar el precio final en la sucursal, ya que pueden existir promociones no publicadas."
    },
    {
      pregunta: "¿Es gratuito el servicio?",
      respuesta: "¡Sí! ComparAR es completamente gratuito para todos los usuarios. Nuestro objetivo es ayudarte a ahorrar sin costos adicionales."
    },
    {
      pregunta: "¿Cómo agrego productos a mis listas?",
      respuesta: "Simplemente busca un producto, haz clic en él y selecciona 'Agregar a lista'. Puedes crear múltiples listas para diferentes tipos de compras."
    },
    {
      pregunta: "¿El chatbot de recetas es realmente inteligente?",
      respuesta: "Sí, nuestro chatbot utiliza inteligencia artificial para sugerir recetas basadas en los ingredientes que tienes disponibles, tus preferencias y restricciones dietéticas."
    },
    {
      pregunta: "¿Puedo usar la app sin registrarme?",
      respuesta: "Puedes buscar productos y comparar precios sin registro, pero necesitarás una cuenta para guardar listas, favoritos y direcciones."
    },
    {
      pregunta: "¿Qué supermercados incluyen?",
      respuesta: "Trabajamos con las principales cadenas de supermercados de Argentina como Carrefour, Coto, Dia, Disco, Jumbo, y Vea. Con proyeccion de agregar nuevos colaboradores."
    }
  ];

  const handleContactanosClick = () => {
    onClose(); // Cierra el modal actual
    onShowContactanos(); // Abre el modal de Contactanos
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Preguntas Frecuentes</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <div className="text-center mb-4">
          <h4 className="text-primary">¿Tienes dudas? Aquí las respuestas</h4>
          <p className="text-muted">Encuentra soluciones a las preguntas más comunes</p>
        </div>

        <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
          {faqs.map((faq, index) => (
            <Accordion.Item key={index} eventKey={index.toString()} className="mb-2">
              <Accordion.Header>
                <strong>{faq.pregunta}</strong>
              </Accordion.Header>
              <Accordion.Body>
                {faq.respuesta}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>

        <div className="mt-4 p-3 bg-light rounded">
          <h6>¿No encontraste tu respuesta?</h6>
          <p className="mb-2">Contáctanos directamente y te ayudaremos</p>
          <Button variant="primary" size="sm" onClick={handleContactanosClick}>
            Ir a Contáctanos
          </Button>
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

export default PreguntasFrecuentesModal;