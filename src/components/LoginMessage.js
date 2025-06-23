import React from 'react';

const LoginMessage = ({ currentUser, onLogout }) => {
  return (
    <div className="d-flex align-items-center">
      <span className="me-3">Bienvenido, {currentUser.nombre}</span>
      <button className="btn btn-outline-danger" onClick={onLogout}>
        Cerrar sesión
      </button>
    </div>
  );
};

export default LoginMessage;