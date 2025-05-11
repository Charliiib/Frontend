import './App.css';
import HeaderComponent from './components/HeaderComponent';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';
import BannerComponent from './components/BannerComponent';
import SearchComponent from './components/SearchComponent';
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



function App() {
  return (
    <div>
    <HeaderComponent />
    <LoginComponent/>
    <RegisterComponent/>
    <BannerComponent />
    <Container>
    <SearchComponent />
    <Row>
    <Collg3>
    <ListasComponent />
    <CercanasComponent />
    <UbicacionComponent />
    </Collg3>
    <ResultsComponent />
    </Row>
    </Container>
    <FooterComponent />
    </div>
  );
}

export default App;
