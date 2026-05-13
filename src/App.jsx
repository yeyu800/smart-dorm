import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import DevicesPage from './pages/DevicesPage';
import EnvironmentPage from './pages/EnvironmentPage';
import ScenesPage from './pages/ScenesPage';
import EnergyPage from './pages/EnergyPage';
import ProfilePage from './pages/ProfilePage';
import RechargePage from './pages/RechargePage';
import './index.css';

// 路由守卫：未登录自动跳转到登录页
function ProtectedLayout() {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return (
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);

  return (
    <BrowserRouter>
      <Routes>
        {/* 登录页：已登录则跳到首页 */}
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage />}
        />
        {/* 其他所有路由受保护 */}
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
