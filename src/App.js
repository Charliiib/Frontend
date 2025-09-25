import { useState, useEffect } from 'react';
import './App.css';
import HeaderComponent from './components/HeaderComponent';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';
import BannerComponent from './components/BannerComponent';
import SearchComponent from './components/SearchComponent';
import SucursalComponent from './components/SucursalComponent';
import ListasComponent from './components/ListasComponent';
import CercanasComponent from './components/CercanasComponent';
import UbicacionComponent from './components/UbicacionComponent';
import ResultsComponent from './components/ResultsComponent';
import FooterComponent from './components/FooterComponent';
import Chatbot from './components/ChatBotComponent';
import LoginMessage from './components/LoginMessage';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

export const Container = ({ children }) => {
  return <div className="container">{children}</div>;
};

export const Row = ({ children }) => {
  return <div className="row mt-5">{children}</div>;
};

export const Collg3 = ({ children }) => {
  return <aside className="col-lg-3">{children}</aside>;
};

export const Rowpt5 = ({ children }) => {
  return <div className="row justify-content-center pt-5">{children}</div>;
};

export const Coll12 = ({ children }) => {
  return <div className="col-lg-12">{children}</div>;
};

export const CardSearch = ({ children }) => {
  return <div className="card search-card">{children}</div>;
};

export const CardBody = ({ children }) => {
  return <div className="card-body">{children}</div>;
};

export const SearchForm = ({ children }) => {
  return <form id="searchForm">{children}</form>;
};

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSucursales, setSelectedSucursales] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setShowLogin(false);
  };

  const handleRegisterSuccess = (user) => {
    setCurrentUser(user);
    setShowRegister(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const handleShowLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
  };

  const handleShowRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
  };

  useEffect(() => {
    console.log("Ubicación del usuario actualizada:", userLocation);
  }, [userLocation]);

  return (
    <div>
      <HeaderComponent 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onShowLogin={handleShowLogin}
        onShowRegister={handleShowRegister}
      />
      
      {showLogin && (
        <LoginComponent 
          onLoginSuccess={handleLoginSuccess} 
          onClose={() => setShowLogin(false)}
        />
      )}
      
      {showRegister && (
        <RegisterComponent 
          onRegisterSuccess={handleRegisterSuccess} 
          onClose={() => setShowRegister(false)}
        />
      )}
      
      <BannerComponent />
      <Container>
        <Rowpt5>
          <Coll12>
            <CardSearch>
              <CardBody>  
                <SearchForm>
                  <SearchComponent 
                    onProductSelect={setSelectedProduct} 
                  />
                  <SucursalComponent 
                    onSucursalesChange={setSelectedSucursales} 
                  />
                </SearchForm>
              </CardBody>
            </CardSearch>
          </Coll12>
        </Rowpt5>

        <Row>
          <Collg3>
            <ListasComponent />
            <UbicacionComponent 
              onLocationChange={(coords) => {
                console.log("Nueva ubicación recibida:", coords);
                setUserLocation(coords);
              }} 
            />
            <CercanasComponent userLocation={userLocation} />
          </Collg3>
          <ResultsComponent 
            selectedProduct={selectedProduct}
            selectedSucursales={selectedSucursales}
            userLocation={userLocation}
          />
        </Row>
      </Container>
      <FooterComponent />
       <Chatbot />
    </div>
  );
}

export default App;