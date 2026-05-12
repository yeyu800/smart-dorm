import { useSmartStore } from '../store/useSmartStore';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

function getLevel(key, val) {
  if (key === 'temperature') {
    if (val < 20 || val > 28) return 'warn';
    return 'good';
  }
  if (key === 'humidity') {
    if (val < 40) return 'warn';
    if (val > 70) return 'bad';
    return 'good';
  }
  if (key === 'pm25') {
    if (val <= 35) return 'good';
    if (val <= 75) return 'warn';
    return 'bad';
  }
  if (key === 'co2') {
    if (val <= 600) return 'good';
    if (val <= 1000) return 'warn';
    return 'bad';
  }
  if (key === 'noise') {
    if (val <= 40) return 'good';
    if (val <= 60) return 'warn';
    return 'bad';
  }
  if (key === 'light') {
    if (val >= 200 && val <= 500) return 'good';
    return 'warn';
  }
  return 'good';
}

const levelText = { good: '正常', warn: '偏高', bad: '超标' };

const ENV_CARDS = [
  { key: 'temperature', icon: '🌡️', label: '温度', unit: '°C', color: '#ff7b72' },
  { key: 'humidity',    icon: '💧', label: '湿度', unit: '%',  color: '#58a6ff' },
  { key: 'pm25',        icon: '🌫️', label: 'PM2.5', unit: 'μg/m³', color: '#bc8cff' },
  { key: 'co2',         icon: '💨', label: 'CO₂', unit: 'ppm', color: '#3fb950' },
  { key: 'noise',       icon: '🔊', label: '噪音', unit: 'dB',  color: '#d29922' },
  { key: 'light',       icon: '☀️', label: '光照', unit: 'lux', color: '#ffa657' },
];

export default function EnvironmentPage() {
  const { env } = useSmartStore();

  const chartData = env.timeLabels.map((t, i) => ({
    time: t,
    温度: env.history.temperature[i],
    湿度: env.history.humidity[i],
    PM2_5: env.history.pm25[i],
    CO2: env.history.co2[i],
    噪音: env.history.noise[i],
  }));

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>🌡️ 环境监测</h1>
        <p>实时感知宿舍环境，守护健康生活空间</p>
      </div>

      <div className="page-content">
        {/* 实时数据卡片 */}
        <div className="section-title">📊 实时数据</div>
        <div className="env-grid" style={{ marginBottom: 24 }}>
          {ENV_CARDS.map(c => {
            const val = env[c.key];
            const lv = getLevel(c.key, val);
            return (
              <div key={c.key} className="env-card">
                <div className="env-icon">{c.icon}</div>
                <div className="env-value" style={{ color: c.color }}>{val}</div>
                <div className="env-unit">{c.unit}</div>
                <div className="env-label">{c.label}</div>
                <span className={`env-level ${lv}`}>{levelText[lv]}</span>
              </div>
            );
          })}
        </div>

        {/* 温湿度趋势 */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">🌡️ 温湿度趋势</div>
            <span className="badge badge-blue">今日 08:00 - 19:00</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff7b72" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff7b72" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gHumi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#58a6ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#58a6ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6e7681' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6e7681' }} />
              <Tooltip contentStyle={{ background: '#1c2230', border: '1px solid #30363d', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#8b949e' }} />
              <Area type="monotone" dataKey="温度" stroke="#ff7b72" fill="url(#gTemp)" strokeWidth={2} />
              <Area type="monotone" dataKey="湿度" stroke="#58a6ff" fill="url(#gHumi)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* CO2 + 噪音 */}
        <div className="grid grid-2">
          <div className="card">
            <div className="card-header">
              <div className="card-title">💨 CO₂浓度趋势</div>
              <span className={`badge ${env.co2 > 1000 ? 'badge-red' : env.co2 > 600 ? 'badge-yellow' : 'badge-green'}`}>
                {env.co2 > 1000 ? '超标' : env.co2 > 600 ? '偏高' : '正常'}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6e7681' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6e7681' }} domain={[550, 700]} />
                <Tooltip contentStyle={{ background: '#1c2230', border: '1px solid #30363d', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="CO2" stroke="#3fb950" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">🔊 噪音趋势</div>
              <span className={`badge ${env.noise > 60 ? 'badge-red' : env.noise > 40 ? 'badge-yellow' : 'badge-green'}`}>
                {env.noise > 60 ? '噪音大' : env.noise > 40 ? '一般' : '安静'}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6e7681' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6e7681' }} domain={[20, 50]} />
                <Tooltip contentStyle={{ background: '#1c2230', border: '1px solid #30363d', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="噪音" stroke="#d29922" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PM2.5 趋势 */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div className="card-title">🌫️ PM2.5 趋势</div>
            <span className="badge badge-green">空气质量优</span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gPM" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#bc8cff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#bc8cff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6e7681' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6e7681' }} domain={[0, 40]} />
              <Tooltip contentStyle={{ background: '#1c2230', border: '1px solid #30363d', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="PM2_5" stroke="#bc8cff" fill="url(#gPM)" strokeWidth={2} name="PM2.5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
