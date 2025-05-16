import React from 'react'


export const LoginComponent = () => {
  return (
    <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header" >
                <h5 class="modal-title" data-bs-toggle="modal" data-bs-target="#myModal">Iniciar sesión</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="loginForm">
                    <div class="mb-3">
                        <label for="email_usuario" class="form-label">Email</label>
                        <input type="email" class="form-control" id="email_usuario" required/>
                    </div>
                    <div class="mb-3">
                        <label for="pass_usuario" class="form-label">Contraseña</label>
                        <input type="password" class="form-control" id="pass_usuario" required/>
                    </div>
                    <div class="d-grid">
                        <button type="submit" class="btn btn-primary">Ingresar</button>
                    </div>
                </form>
            </div>
            <div class="modal-footer justify-content-center">
                <span>¿No tienes cuenta? <a href="#" class="text-primary" data-bs-toggle="modal" data-bs-target="#registerModal" data-bs-dismiss="modal">Regístrate</a></span>
            </div>
        </div>
    </div>
</div>

  )
}

export default LoginComponent;