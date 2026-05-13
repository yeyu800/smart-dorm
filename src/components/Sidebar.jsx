import { NavLink } from 'react-router-dom';
import { useSmartStore } from '../store/useSmartStore';
import { useAuthStore } from '../store/useAuthStore';

const navItems = [
  { path: '/', icon: '🏠', label: '首页概览' },
  { path: '/devices', icon: '🎛️', label: '设备控制' },
  { path: '/environment', icon: '🌡️', label: '环境监测' },
  { path: '/scenes', icon: '✨', label: '场景模式' },
  { path: '/energy', icon: '⚡', label: '能耗统计' },
  { path: '/recharge', icon: '💡', label: '电费充值' },
  { path: '/profile', icon: '👤', label: '个人中心' },
];

export default function Sidebar() {
  const { unreadCount, electricAccount } = useSmartStore();
  const { currentUser } = useAuthStore();
  const lowBalance = electricAccount.balance < 20;

  const displayUser = currentUser || { nickname: '未登录', avatar: '👤', role: '-', dormLabel: '-' };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>🏡 宿舍智能家居</h2>
        <p>Smart Dorm System</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.path === '/profile' && unreadCount > 0 && (
              <span className="nav-badge">{unreadCount}</span>
            )}
            {item.path === '/recharge' && lowBalance && (
              <span className="nav-badge" style={{ background: '#f85149' }}>低</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {/* 电费余额快速查看 */}
        <div style={{
          padding: '10px 12px', borderRadius: 10, marginBottom: 10,
          background: lowBalance ? 'rgba(248,81,73,0.1)' : 'rgba(63,185,80,0.08)',
          border: `1px solid ${lowBalance ? 'rgba(248,81,73,0.25)' : 'rgba(63,185,80,0.2)'}`,
        }}>
          <div style={{ fontSize: 11, color: '#6e7681', marginBottom: 3 }}>💡 电费余额</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: lowBalance ? '#f85149' : '#3fb950' }}>
            ¥{electricAccount.balance.toFixed(2)}
          </div>
          {lowBalance && (
            <div style={{ fontSize: 10, color: '#f85149', marginTop: 2 }}>⚠️ 余额不足，请充值</div>
          )}
        </div>

        <div className="user-mini">
          <div className="user-mini-avatar">{displayUser.avatar}</div>
          <div className="user-mini-info">
            <p>{displayUser.nickname}</p>
            <span style={{ fontSize: 10, opacity: 0.7 }}>{displayUser.dormLabel || displayUser.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
