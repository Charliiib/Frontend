import React from 'react';
import LoginMessage from './LoginMessage';

const HeaderComponent = ({ currentUser, onLogout, onShowLogin, onShowRegister }) => {
  return (
    <header className="py-3">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <div className="logo">
            <img src="/compararlogo.png" alt="comparar logo" />
          </div>
          
          <div>
            {currentUser ? (
              <LoginMessage currentUser={currentUser} onLogout={onLogout} />
            ) : (
              <>
                <button 
                  className="btn btn-outline-primary me-2" 
                  onClick={onShowLogin}
                >
                  Ingresar
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={onShowRegister}
                >
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