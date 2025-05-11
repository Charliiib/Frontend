

export const HeaderComponent = () => {


    return (
      <header class="py-3">
      <div class="container">
          <div class="d-flex justify-content-between align-items-center">
              <div class="logo">
                <img src="/compararlogo.png" alt="comparar logo" />
              </div>
              
              <div>
                  <button class="btn btn-outline-primary me-2 modal-trigger" data-bs-toggle="modal" data-bs-target="#loginModal">
                      Ingresar
                  </button>
                  <button class="btn btn-primary modal-trigger" data-bs-toggle="modal" data-bs-target="#registerModal">
                      Registrarse
                  </button>
              </div>
          </div>
      </div>
  </header>
    )
}

export default HeaderComponent;
