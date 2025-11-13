import React from 'react';
import LoginMessage from './LoginMessage';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa'; 

const HeaderComponent = ({ currentUser, onLogout, onShowLogin, onShowRegister }) => {
  return (

    <header className="py-3 border-bottom shadow-sm bg-white"> 
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <div className="logo d-flex align-items-center">
            <h1 className="h4 mb-0 me-3">

              <img src="/compararlogo.png" alt="Comparar Logo"/>
            </h1>
          </div>
          
          <div>
            {currentUser ? (
              <LoginMessage currentUser={currentUser} onLogout={onLogout} />
            ) : (
              <>
                <button 
                  className="btn btn-outline-primary me-2 rounded-3" 
                  onClick={onShowLogin}
                >
                  <FaSignInAlt className="me-1" />
                  Ingresar
                </button>
                <button 
                  className="btn btn-primary rounded-3" 
                  onClick={onShowRegister}
                >
                  <FaUserPlus className="me-1" />
                  Registrarse
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderComponent;