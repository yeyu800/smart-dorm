import { useSmartStore } from '../store/useSmartStore';

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

export default function ProfilePage() {
  const { user, notifications, unreadCount, markAllRead, markRead } = useSmartStore();

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
            <div className="profile-card" style={{ marginBottom: 16 }}>
              <div className="profile-avatar">{user.avatar}</div>
              <div className="profile-name">{user.name}</div>
              <div className="profile-role">{user.role}</div>
              <div className="profile-dorm">📍 {user.dorm}</div>
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
                    <button
                      className={`toggle ${item.value ? 'on' : ''}`}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>
            ))}
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
                      background: 'var(--accent-blue)',
                      flexShrink: 0, marginTop: 4,
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
                ['数据更新', '2026-05-12 09:45'],
                ['宿舍编号', user.dorm],
                ['入住时间', user.joined],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: '1px solid var(--border-light)',
                  fontSize: 13,
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
