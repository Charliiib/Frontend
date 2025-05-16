import React from 'react'

export const FooterComponent = () => {


    return (
      <footer class="bg-light text-black">
      <div class="container">
        <div class="row text-center">

          <div class="col-md-5 py-3 mt-2">
            <h5 class="text-uppercase">Enlaces</h5>
            <ul class="list-unstyled">
              <li><a href="#about" class="text-black">Quiénes Somos</a></li>
              <li>
                <a href="#faq" class="text-black">Preguntas Frecuentes</a>
              </li>
              <li><a href="#contact" class="text-black">Contáctanos</a></li>
            </ul>
          </div>

          <div class="col-md-5 py-3 mt-2">
            <h5 class="text-uppercase">Información de Contacto</h5>
            <p>Correo electrónico: contacto@comparar.com</p>
            <p>Teléfono: +54 9 11 1234-5678</p>
          </div>
        </div>
      </div>

      <div class="text-center py-3">
        <p class="mb-0">© 2025 ComparAR. Todos los derechos reservados.</p>
      </div>
    </footer>
       
    )
}

export default FooterComponent;








