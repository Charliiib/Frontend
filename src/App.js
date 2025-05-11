import './App.css';
import HeaderComponent from './components/HeaderComponent';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';
import BannerComponent from './components/BannerComponent';
import SearchComponent from './components/SearchComponent';
import SidebarComponent from './components/SidebarComponent';
import ResultsComponent from './components/ResultsComponent';

export const Container = ({ children }) => {
  return <div className="container">{children}</div>;
};

export const Row = ({ children }) => {
  return <div className="row mt-5">{children}</div>;
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
    <SidebarComponent />
    <ResultsComponent />
    </Row>
    </Container>
    </div>
  );
}

export default App;
