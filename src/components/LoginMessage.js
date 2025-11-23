import React from 'react';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa'; 

const LoginMessage = ({ currentUser, onLogout }) => {
  // 🔍 AGREGAR LOGS PARA DEBUG
  console.log('🔍 currentUser en LoginMessage:', currentUser);
  console.log('🔍 nombreUsuario:', currentUser.nombreUsuario);
  console.log('🔍 apellidoUsuario:', currentUser.apellidoUsuario);
  console.log('🔍 emailUsuario:', currentUser.emailUsuario);

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
      <FaUserCircle className="text-primary me-2" size={20} />
      <span className="me-3 text-muted fw-medium"> 
        Bienvenido, <strong className="text-dark">{getUserFullName()}</strong>
      </span>
      <button 
        className="btn btn-outline-danger btn-sm rounded-3" 
        onClick={onLogout}
        title="Cerrar Sesión" 
      >
        <FaSignOutAlt className="me-1" />
        Cerrar sesión
      </button>
    </div>
  );
};

export default LoginMessage;