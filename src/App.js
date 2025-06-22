import { useState } from 'react';
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

export const Container = ({ children }) => {
  return <div className="container">{children}</div>;
};

export const Row = ({ children }) => {
  return <div className="row mt-5">{children}</div>;
};

export const Collg3 = ({ children }) => {
  return <aside class="col-lg-3">{children}</aside>;
};

export const Rowpt5 = ({ children }) => {
  return <div class="row justify-content-center pt-5">{children}</div>;
};

export const Coll12 = ({ children }) => {
  return <div class="col-lg-12">{children}</div>;
};

export const CardSearch = ({ children }) => {
  return <div class="card search-card">{children}</div>;
};

export const CardBody = ({ children }) => {
  return <div class="card-body">{children}</div>;
};

export const SearchForm = ({ children }) => {
  return <form id="searchForm">{children}</form>;
};

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSucursales, setSelectedSucursales] = useState([]);

  return (
    
    <div>
    <HeaderComponent />
    <LoginComponent/>
    <RegisterComponent/>
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
    <CercanasComponent />
    <UbicacionComponent />
    </Collg3>
          <ResultsComponent 
            selectedProduct={selectedProduct}
            selectedSucursales={selectedSucursales}
          />
    </Row>
    </Container>
    <FooterComponent />
    </div>
  );
}

export default App;
