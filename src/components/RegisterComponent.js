import React from 'react'

const RegisterComponent = () => {
  return (
    <div class="modal fade" id="registerModal" tabindex="-1" aria-labelledby="registerModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="registerModalLabel">Crear cuenta</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="registerForm">
                    <div class="mb-3">
                        <label for="nombre_usuario" class="form-label">Nombre</label>
                        <input type="text" class="form-control" id="nombre_usuario" required />
                    </div>
                    <div class="mb-3">
                        <label for="apellido_usuario" class="form-label">Apellido</label>
                        <input type="text" class="form-control" id="apellido_usuario" required />
                    </div>
                    <div class="mb-3">
                        <label for="email_usuario" class="form-label">Email</label>
                        <input type="email" class="form-control" id="email_usuario" required />
                    </div>
                    <div class="mb-3">
                        <label for="pass_usuario" class="form-label">Contraseña</label>
                        <input type="password" class="form-control" id="pass_usuario" required />
                    </div>
                    <div class="mb-3">
                        <label for="pass_usuario" class="form-label">Confirmar contraseña</label>
                        <input type="password" class="form-control" id="pass_usuario" required />
                    </div>
                    <div class="d-grid">
                        <button type="submit" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#myModal">Registrarse</button>
                    </div>
                </form>
            </div>
            <div class="modal-footer justify-content-center">
                <span>¿Ya tienes cuenta? <a href="#" class="text-primary" data-bs-toggle="modal" data-bs-target="#loginModal" data-bs-dismiss="modal">Inicia sesión</a></span>
            </div>
        </div>
    </div>
</div>
  )
}

export default RegisterComponent;