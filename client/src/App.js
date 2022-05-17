import './App.css';
import LandingPage from './components/LandingPage/LandingPage';
import AddWard from './components/AddWard/AddWard';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="add" element={<AddWard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
