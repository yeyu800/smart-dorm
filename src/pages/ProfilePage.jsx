import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartStore } from '../store/useSmartStore';
import { useAuthStore, BUILDINGS, getRooms } from '../store/useAuthStore';

const settingGroups = [
  {
    title: '通知设置',
    items: [
      { label: '设备异常提醒', sub: '设备故障时推送通知', value: true },
      { label: '环境超标提醒', sub: 'CO₂、温度超标时提醒', value: true },
      { label: '节能建议推送', sub: '每日发送节能报告', value: false },
    ],
  },
  {
    title: '自动化设置',
    items: [
      { label: '智能场景切换', sub: '根据时间自动切换场景', value: true },
      { label: '离开自动关灯', sub: '检测无人后自动关闭灯光', value: false },
      { label: '睡眠模式定时', sub: '每天 23:00 自动进入睡眠', value: true },
    ],
  },
  {
    title: '安全设置',
    items: [
      { label: '异常用电告警', sub: '功率超过阈值时提醒', value: true },
      { label: '离开断电保护', sub: '离开模式下断开高功耗设备', value: false },
    ],
  },
];

const AVATARS = ['🧑‍💻', '👨‍🎓', '👩‍🎓', '🧑‍🔬', '👨‍💻', '👩‍💻', '🧑', '👤'];

export default function ProfilePage() {
  const { notifications, unreadCount, markAllRead, markRead } = useSmartStore();
  const { currentUser, updateDorm, updateProfile, logout } = useAuthStore();
  const navigate = useNavigate();

  const [editingDorm, setEditingDorm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [dormForm, setDormForm] = useState({ building: currentUser?.building || '', room: currentUser?.room || '' });
  const [profileForm, setProfileForm] = useState({
    nickname: currentUser?.nickname || '',
    avatar: currentUser?.avatar || '🧑‍💻',
    role: currentUser?.role || '宿舍成员',
  });
  const [dormMsg, setDormMsg] = useState('');

  const selectedBuilding = BUILDINGS.find(b => b.id === dormForm.building);
  const rooms = selectedBuilding ? getRooms(selectedBuilding.floors) : [];

  const handleSaveDorm = () => {
    if (!dormForm.building || !dormForm.room) {
      setDormMsg('请选择楼栋和房间号');
      return;
    }
    updateDorm(dormForm);
    setEditingDorm(false);
    setDormMsg('✅ 宿舍信息已更新');
    setTimeout(() => setDormMsg(''), 2000);
  };

  const handleSaveProfile = () => {
    updateProfile(profileForm);
    setEditingProfile(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const user = currentUser || { nickname: '未知用户', dormLabel: '未绑定', avatar: '👤', role: '宿舍成员', joined: '-' };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>👤 个人中心</h1>
        <p>账户信息与系统设置</p>
      </div>

      <div className="page-content">
        <div className="grid grid-2" style={{ gap: 20 }}>
          {/* 左栏：个人资料 + 设置 */}
          <div>
            {/* 个人资料卡 */}
            <div className="profile-card" style={{ marginBottom: 16, position: 'relative' }}>
              {/* 编辑按钮 */}
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                style={{
                  position: 'absolute', top: 14, right: 14,
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8, padding: '4px 10px', color: 'var(--text-secondary)',
                  fontSize: 12, cursor: 'pointer',
                }}
              >
                {editingProfile ? '取消' : '✏️ 编辑'}
              </button>

              {editingProfile ? (
                /* 编辑模式 */
                <div style={{ textAlign: 'left', padding: '0 4px' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>选择头像</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
                    {AVATARS.map(a => (
                      <button
                        key={a}
                        onClick={() => setProfileForm(f => ({ ...f, avatar: a }))}
                        style={{
                          fontSize: 26, background: profileForm.avatar === a ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                          border: profileForm.avatar === a ? '2px solid var(--accent-blue)' : '2px solid transparent',
                          borderRadius: 12, width: 46, height: 46, cursor: 'pointer',
                        }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                  <input
                    className="form-input"
                    style={{ marginBottom: 10 }}
                    placeholder="昵称"
                    value={profileForm.nickname}
                    onChange={e => setProfileForm(f => ({ ...f, nickname: e.target.value }))}
                  />
                  <input
                    className="form-input"
                    style={{ marginBottom: 14 }}
                    placeholder="身份（如 宿舍长）"
                    value={profileForm.role}
                    onChange={e => setProfileForm(f => ({ ...f, role: e.target.value }))}
                  />
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSaveProfile}>
                    保存资料
                  </button>
                </div>
              ) : (
                /* 查看模式 */
                <>
                  <div className="profile-avatar">{user.avatar}</div>
                  <div className="profile-name">{user.nickname}</div>
                  <div className="profile-role">{user.role}</div>
                  <div className="profile-dorm">📍 {user.dormLabel || '未绑定宿舍'}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-blue)' }}>8</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>接入设备</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-green)' }}>4</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>场景模式</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-yellow)' }}>15.5%</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>节能率</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 宿舍绑定卡片 */}
            <div className="card" style={{ marginBottom: 12 }}>
              <div className="card-header">
                <div className="card-title">🏠 宿舍绑定</div>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: 12 }}
                  onClick={() => { setEditingDorm(!editingDorm); setDormMsg(''); }}
                >
                  {editingDorm ? '取消' : '修改'}
                </button>
              </div>

              {dormMsg && (
                <div style={{
                  background: dormMsg.startsWith('✅') ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                  color: dormMsg.startsWith('✅') ? 'var(--accent-green)' : 'var(--accent-red)',
                  padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 10,
                }}>
                  {dormMsg}
                </div>
              )}

              {editingDorm ? (
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>选择楼栋</div>
                  <div className="building-grid" style={{ marginBottom: 14 }}>
                    {BUILDINGS.map(b => (
                      <button
                        key={b.id}
                        className={`building-btn ${dormForm.building === b.id ? 'selected' : ''}`}
                        onClick={() => setDormForm(f => ({ ...f, building: b.id, room: '' }))}
                      >
                        <span className="building-id">{b.id}栋</span>
                        <span className="building-name">{b.name}</span>
                      </button>
                    ))}
                  </div>
                  {dormForm.building && (
                    <>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>选择房间号</div>
                      <select
                        className="form-input form-select"
                        style={{ marginBottom: 14 }}
                        value={dormForm.room}
                        onChange={e => setDormForm(f => ({ ...f, room: e.target.value }))}
                      >
                        <option value="">-- 请选择房间 --</option>
                        {rooms.map(r => (
                          <option key={r} value={r}>{r}室</option>
                        ))}
                      </select>
                    </>
                  )}
                  {dormForm.building && dormForm.room && (
                    <div className="dorm-preview" style={{ marginBottom: 12 }}>
                      <span>📍 新宿舍：</span>
                      <strong>{selectedBuilding?.name} {dormForm.room}室</strong>
                    </div>
                  )}
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSaveDorm}>
                    确认绑定
                  </button>
                </div>
              ) : (
                <div style={{ padding: '6px 0' }}>
                  {[
                    ['当前宿舍', user.dormLabel || '未绑定'],
                    ['入住时间', user.joined || '-'],
                    ['账号', currentUser?.username || '-'],
                  ].map(([k, v]) => (
                    <div key={k} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '9px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13,
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 设置分组 */}
            {settingGroups.map(group => (
              <div className="card" key={group.title} style={{ marginBottom: 12 }}>
                <div className="card-header" style={{ marginBottom: 4 }}>
                  <div className="card-title">{group.title}</div>
                </div>
                {group.items.map(item => (
                  <div key={item.label} className="setting-item">
                    <div>
                      <div className="setting-label">{item.label}</div>
                      <div className="setting-sub">{item.sub}</div>
                    </div>
                    <button className={`toggle ${item.value ? 'on' : ''}`} style={{ cursor: 'pointer' }} />
                  </div>
                ))}
              </div>
            ))}

            {/* 登出按钮 */}
            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '12px', background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12,
                color: 'var(--accent-red)', fontSize: 14, cursor: 'pointer',
                fontWeight: 600, marginBottom: 16,
              }}
            >
              🚪 退出登录
            </button>
          </div>

          {/* 右栏：通知中心 */}
          <div>
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  🔔 通知中心
                  {unreadCount > 0 && (
                    <span style={{
                      background: 'var(--accent-red)', color: 'white',
                      fontSize: 11, padding: '1px 6px', borderRadius: 10, fontWeight: 600,
                    }}>{unreadCount}</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={markAllRead}>
                    全部已读
                  </button>
                )}
              </div>

              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.read ? 'unread' : ''}`}
                  onClick={() => markRead(n.id)}
                >
                  <div className={`notif-dot ${n.type}`} />
                  <div className="notif-content">
                    <div className="notif-title" style={{ color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                      {n.title}
                    </div>
                    <div className="notif-desc">{n.desc}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                  {!n.read && (
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--accent-blue)', flexShrink: 0, marginTop: 4,
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* 系统信息 */}
            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-header">
                <div className="card-title">🖥️ 系统信息</div>
              </div>
              {[
                ['系统版本', 'v2.4.0'],
                ['固件版本', '1.8.3'],
                ['网关连接', '正常 · 延迟 12ms'],
                ['数据更新', '2026-05-13 18:00'],
                ['宿舍编号', user.dormLabel || '未绑定'],
                ['入住时间', user.joined || '-'],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '9px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13,
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
