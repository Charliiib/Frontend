import './App.css';
import HeaderComponent from './components/HeaderComponent';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';
import BannerComponent from './components/BannerComponent';
import SearchComponent from './components/SearchComponent';

function App() {
  return (
    <div>
    <HeaderComponent />
    <LoginComponent/>
    <RegisterComponent/>
    <BannerComponent />
    <SearchComponent />
    </div>
  );
}

export default App;
