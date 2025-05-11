import './App.css';
import HeaderComponent from './components/HeaderComponent';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';
import BannerComponent from './components/BannerComponent';

function App() {
  return (
    <div>
    <HeaderComponent />
    <LoginComponent/>
    <RegisterComponent/>
    <BannerComponent />
    </div>
  );
}

export default App;
