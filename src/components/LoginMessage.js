import React from 'react';

const LoginMessage = ({ currentUser, onLogout }) => {

  const getUserName = () => {

    if (currentUser.nombreUsuario) {
      return currentUser.nombreUsuario;
    }

    if (currentUser.nombre) {
      return currentUser.nombre;
    }

    if (currentUser.emailUsuario || currentUser.email) {
      return currentUser.emailUsuario || currentUser.email;
    }
    return 'Usuario';
  };


  const getUserFullName = () => {
    const nombre = getUserName();
    const apellido = currentUser.apellidoUsuario || currentUser.apellido;
    
    if (apellido) {
      return `${nombre} ${apellido}`;
    }
    return nombre;
  };

  return (
    <div className="d-flex align-items-center">
      <span className="me-3">Bienvenido, {getUserFullName()}</span>
      <button className="btn btn-outline-danger btn-sm" onClick={onLogout}>
        <i className="fas fa-sign-out-alt me-1"></i>
        Cerrar sesión
      </button>
    </div>
  );
};

export default LoginMessage;