import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DevicesPage from './pages/DevicesPage';
import EnvironmentPage from './pages/EnvironmentPage';
import ScenesPage from './pages/ScenesPage';
import EnergyPage from './pages/EnergyPage';
import ProfilePage from './pages/ProfilePage';
import RechargePage from './pages/RechargePage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/devices" element={<DevicesPage />} />
            <Route path="/environment" element={<EnvironmentPage />} />
            <Route path="/scenes" element={<ScenesPage />} />
            <Route path="/energy" element={<EnergyPage />} />
            <Route path="/recharge" element={<RechargePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
