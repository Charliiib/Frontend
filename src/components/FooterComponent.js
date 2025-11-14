import React, { useState } from 'react';
import PreguntasFrecuentesModal from './PreguntasFrecuentesModal';
import QuienesSomosModal from './QuienesSomosModal';
import ContactanosModal from './ContactanosModal';

export const FooterComponent = () => {
  const [showQuienesSomos, setShowQuienesSomos] = useState(false);
  const [showPreguntasFrecuentes, setShowPreguntasFrecuentes] = useState(false);
  const [showContactanos, setShowContactanos] = useState(false);

  const handleShowContactanos = () => {
    setShowContactanos(true);
  };

  return (
    <>
      <footer className="bg-light text-black">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-5 py-3 mt-2">
              <h5 className="text-uppercase">Enlaces</h5>
              <ul className="list-unstyled">
                <li>
                  <a 
                    href="#about" 
                    className="text-black text-decoration-none"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowQuienesSomos(true);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    Quiénes Somos
                  </a>
                </li>
                <li>
                  <a 
                    href="#faq" 
                    className="text-black text-decoration-none"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPreguntasFrecuentes(true);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    Preguntas Frecuentes
                  </a>
                </li>
                <li>
                  <a 
                    href="#contact" 
                    className="text-black text-decoration-none"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowContactanos(true);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    Contáctanos
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-md-5 py-3 mt-2">
              <h5 className="text-uppercase">Información de Contacto</h5>
              <p>Correo electrónico: contacto@comparar.com</p>
              <p>Teléfono: +54 9 11 1234-5678</p>
            </div>
          </div>
        </div>

        <div className="text-center py-3">
          <p className="mb-0">© 2025 ComparAR. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Modales */}
      <QuienesSomosModal 
        show={showQuienesSomos} 
        onClose={() => setShowQuienesSomos(false)} 
      />
      
      <PreguntasFrecuentesModal 
        show={showPreguntasFrecuentes} 
        onClose={() => setShowPreguntasFrecuentes(false)}
        onShowContactanos={handleShowContactanos}
      />
      
      <ContactanosModal 
        show={showContactanos} 
        onClose={() => setShowContactanos(false)} 
      />
    </>
  );
};

export default FooterComponent;