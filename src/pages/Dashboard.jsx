import { useSmartStore } from '../store/useSmartStore';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const { devices, env, energy, activeScene, scenes, applyScene, electricAccount } = useSmartStore();
  const navigate = useNavigate();

  const onCount = devices.filter(d => d.on).length;
  const totalPower = devices.filter(d => d.on && d.power).reduce((s, d) => s + d.power, 0);
  const currentScene = scenes.find(s => s.id === activeScene);

  const tempData = env.timeLabels.map((t, i) => ({
    time: t,
    温度: env.history.temperature[i],
    湿度: env.history.humidity[i],
  }));

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>🏠 首页概览</h1>
        <p>欢迎回来！当前宿舍一切正常 · {new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="page-content">
        {/* 电费余额提醒横幅 */}
        {electricAccount.balance < 20 && (
          <div onClick={() => navigate('/recharge')} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 20px', borderRadius: 12, marginBottom: 20,
            background: electricAccount.balance < 5
              ? 'linear-gradient(135deg, rgba(248,81,73,0.18), rgba(248,81,73,0.06))'
              : 'linear-gradient(135deg, rgba(210,153,34,0.18), rgba(210,153,34,0.06))',
            border: `1px solid ${electricAccount.balance < 5 ? 'rgba(248,81,73,0.4)' : 'rgba(210,153,34,0.35)'}`,
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: 28 }}>{electricAccount.balance < 5 ? '🚨' : '⚠️'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: electricAccount.balance < 5 ? '#f85149' : '#d29922' }}>
                {electricAccount.balance < 5 ? '电费即将耗尽！' : '电费余额不足'}
              </div>
              <div style={{ fontSize: 12, color: '#8b949e', marginTop: 3 }}>
                当前余额 ¥{electricAccount.balance.toFixed(2)}，日均消耗 ¥{electricAccount.dailyRate}，预计 {Math.floor(electricAccount.balance / electricAccount.dailyRate)} 天后断电
              </div>
            </div>
            <div style={{
              padding: '8px 16px', borderRadius: 20,
              background: electricAccount.balance < 5 ? '#f85149' : '#d29922',
              color: '#fff', fontSize: 13, fontWeight: 600, flexShrink: 0,
            }}>
              立即充值 →
            </div>
          </div>
        )}

        {/* 快速状态栏 */}
        <div className="quick-grid">
          <div className="quick-card">
            <div className="q-icon">🎛️</div>
            <div className="q-val text-blue">{onCount}</div>
            <div className="q-label">设备在线 / {devices.length}</div>
          </div>
          <div className="quick-card">
            <div className="q-icon">🌡️</div>
            <div className="q-val" style={{ color: '#ff7b72' }}>{env.temperature}°C</div>
            <div className="q-label">室内温度</div>
          </div>
          <div className="quick-card">
            <div className="q-icon">⚡</div>
            <div className="q-val text-yellow">{totalPower}W</div>
            <div className="q-label">当前用电功率</div>
          </div>
          <div className="quick-card">
            <div className="q-icon">💧</div>
            <div className="q-val text-blue">{env.humidity}%</div>
            <div className="q-label">空气湿度</div>
          </div>
        </div>

        <div className="grid grid-2" style={{ marginBottom: 20 }}>
          {/* 温度趋势图 */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">📈 温湿度趋势（今日）</div>
              <span className="badge badge-blue">实时</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={tempData}>
                <defs>
                  <linearGradient id="temp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff7b72" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff7b72" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="humi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#58a6ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#58a6ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6e7681' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6e7681' }} />
                <Tooltip contentStyle={{ background: '#1c2230', border: '1px solid #30363d', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="温度" stroke="#ff7b72" fill="url(#temp)" strokeWidth={2} />
                <Area type="monotone" dataKey="湿度" stroke="#58a6ff" fill="url(#humi)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 当前场景 + 快速切换 */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">✨ 当前场景</div>
              <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => navigate('/scenes')}>全部场景</button>
            </div>
            <div style={{ background: currentScene?.color || '#1c2230', borderRadius: 12, padding: '18px', marginBottom: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 32 }}>{currentScene?.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginTop: 8 }}>{currentScene?.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{currentScene?.desc}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
              {scenes.map(sc => (
                <button
                  key={sc.id}
                  onClick={() => applyScene(sc.id)}
                  className="btn btn-secondary"
                  style={{
                    justifyContent: 'flex-start', gap: 6, fontSize: 12, padding: '8px 10px',
                    borderColor: sc.id === activeScene ? 'var(--accent-blue)' : 'var(--border)',
                    color: sc.id === activeScene ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  }}
                >
                  {sc.icon} {sc.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 设备快览 */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">🎛️ 设备快览</div>
            <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => navigate('/devices')}>管理全部</button>
          </div>
          <div className="grid grid-4">
            {devices.slice(0, 8).map(d => (
              <div key={d.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                background: d.on ? 'rgba(88,166,255,0.06)' : 'var(--bg-secondary)',
                border: `1px solid ${d.on ? 'rgba(88,166,255,0.2)' : 'var(--border)'}`,
                borderRadius: 10,
              }}>
                <span style={{ fontSize: 20 }}>{d.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: d.on ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {d.on ? '运行中' : '已关闭'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 今日能耗 */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">⚡ 今日能耗</div>
            <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => navigate('/energy')}>查看详情</button>
          </div>
          <div className="grid grid-3" style={{ gap: 12 }}>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>今日用电</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent-yellow)' }}>{energy.today}<span style={{ fontSize: 13, fontWeight: 400 }}>kWh</span></div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>本月累计</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent-blue)' }}>{energy.month}<span style={{ fontSize: 13, fontWeight: 400 }}>kWh</span></div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>节能量</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent-green)' }}>{energy.saved}<span style={{ fontSize: 13, fontWeight: 400 }}>kWh</span></div>
            </div>
          </div>
        </div>

        {/* 电费账户快速入口 */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #1c2c4a 0%, #0d1f3c 100%)',
          border: '1px solid rgba(88,166,255,0.2)',
        }}>
          <div className="card-header">
            <div className="card-title">💡 电费账户</div>
            <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => navigate('/recharge')}>去充值</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', gap: 28 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 28, fontWeight: 700,
                  color: electricAccount.balance < 20 ? '#f85149' : '#3fb950',
                }}>
                  ¥{electricAccount.balance.toFixed(2)}
                </div>
                <div style={{ fontSize: 12, color: '#6e7681', marginTop: 4 }}>当前余额</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#d29922' }}>
                  {electricAccount.points}
                </div>
                <div style={{ fontSize: 12, color: '#6e7681', marginTop: 4 }}>积分余额</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#58a6ff' }}>
                  {Math.floor(electricAccount.balance / electricAccount.dailyRate)}天
                </div>
                <div style={{ fontSize: 12, color: '#6e7681', marginTop: 4 }}>可用天数</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[30, 50, 100].map(amt => (
                <button key={amt} onClick={() => navigate('/recharge')} style={{
                  padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(88,166,255,0.3)',
                  background: 'rgba(88,166,255,0.08)', color: '#58a6ff',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  +¥{amt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
