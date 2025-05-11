import './App.css';
import HeaderComponent from './components/HeaderComponent';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';
import BannerComponent from './components/BannerComponent';
import SearchComponent from './components/SearchComponent';
import SidebarComponent from './components/SidebarComponent';

export const Container = ({ children }) => {
  return <div className="container">{children}</div>;
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
    <SidebarComponent />
    </Container>
    </div>
  );
}

export default App;
