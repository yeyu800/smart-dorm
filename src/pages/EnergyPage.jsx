import { useSmartStore } from '../store/useSmartStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

export default function EnergyPage() {
  const { energy, devices } = useSmartStore();

  const barData = energy.dayLabels.map((d, i) => ({
    day: d,
    用电量: energy.dailyKwh[i],
  }));

  const devicePowerData = devices.filter(d => d.on && d.power).map(d => ({
    name: d.name,
    power: d.power,
  }));

  const colors = ['#58a6ff', '#3fb950', '#d29922', '#bc8cff', '#ff7b72', '#39d353'];

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>⚡ 能耗统计</h1>
        <p>掌握用电情况，科学节能减排</p>
      </div>

      <div className="page-content">
        {/* 能耗概览 */}
        <div className="grid grid-3" style={{ marginBottom: 24 }}>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #1a2e1a 0%, #0d1a0d 100%)', border: '1px solid rgba(63,185,80,0.2)' }}>
            <div className="stat-icon" style={{ background: 'rgba(63,185,80,0.15)' }}>⚡</div>
            <div className="stat-value text-green">{energy.today} kWh</div>
            <div className="stat-label">今日用电量</div>
            <div className="stat-change up">↓ 比昨日少 0.3 kWh</div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #1a2a3a 0%, #0d1a2a 100%)', border: '1px solid rgba(88,166,255,0.2)' }}>
            <div className="stat-icon" style={{ background: 'rgba(88,166,255,0.15)' }}>📅</div>
            <div className="stat-value text-blue">{energy.month} kWh</div>
            <div className="stat-label">本月累计用电</div>
            <div className="stat-change" style={{ color: 'var(--text-secondary)' }}>月均 2.2 kWh/天</div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #2a1a1a 0%, #1a0d0d 100%)', border: '1px solid rgba(210,153,34,0.2)' }}>
            <div className="stat-icon" style={{ background: 'rgba(210,153,34,0.15)' }}>🌿</div>
            <div className="stat-value text-yellow">{energy.saved} kWh</div>
            <div className="stat-label">本月节省电量</div>
            <div className="stat-change up">↑ 节能率 15.5%</div>
          </div>
        </div>

        {/* 14天用电趋势 */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">📈 近14天用电趋势</div>
            <span className="badge badge-green">趋势下降</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6e7681' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6e7681' }} domain={[0, 3]} unit="kWh" />
              <Tooltip
                contentStyle={{ background: '#1c2230', border: '1px solid #30363d', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v} kWh`, '用电量']}
              />
              <Bar dataKey="用电量" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={index === barData.length - 1 ? '#58a6ff' : '#1c3a5c'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-2">
          {/* 设备能耗占比 */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">🥧 今日各设备能耗</div>
            </div>
            {energy.byDevice.map((item, i) => (
              <div key={item.name} className="energy-bar-wrap">
                <div className="energy-bar-label">
                  <span>{item.name}</span>
                  <span>{item.kwh} kWh · {item.pct}%</span>
                </div>
                <div className="energy-bar">
                  <div className="energy-bar-fill" style={{ width: `${item.pct}%`, background: colors[i % colors.length] }} />
                </div>
              </div>
            ))}
          </div>

          {/* 当前运行设备功率 */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">🔌 实时设备功率</div>
              <span className="badge badge-blue">{devicePowerData.reduce((s,d) => s+d.power,0)}W 合计</span>
            </div>
            {devicePowerData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>暂无运行设备</div>
            ) : (
              devicePowerData.map((d, i) => (
                <div key={d.name} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border-light)',
                }}>
                  <span style={{ fontSize: 14 }}>{d.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: `${Math.round(d.power / 15)}px`,
                      height: 6, borderRadius: 3,
                      background: colors[i % colors.length],
                      minWidth: 20,
                    }} />
                    <span style={{ fontSize: 13, color: 'var(--accent-yellow)', minWidth: 50, textAlign: 'right' }}>{d.power}W</span>
                  </div>
                </div>
              ))
            )}

            <div style={{ marginTop: 16, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
              💡 提示：空调是最耗电设备，合理设置温度可节省 15% 以上用电
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
