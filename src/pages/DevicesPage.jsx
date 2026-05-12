import { useState } from 'react';
import { useSmartStore } from '../store/useSmartStore';
import DeviceCard from '../components/DeviceCard';

const TYPE_LABELS = {
  all: '全部',
  light: '灯光',
  ac: '空调',
  fan: '风扇',
  socket: '插座',
  curtain: '窗帘',
  humidifier: '加湿器',
};

export default function DevicesPage() {
  const { devices } = useSmartStore();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? devices : devices.filter(d => d.type === filter);
  const onCount = devices.filter(d => d.on).length;
  const totalPower = devices.filter(d => d.on && d.power).reduce((s, d) => s + d.power, 0);

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>🎛️ 设备控制</h1>
        <p>共 {devices.length} 台设备 · {onCount} 台运行中 · 当前总功率 {totalPower}W</p>
      </div>

      <div className="page-content">
        {/* 统计行 */}
        <div className="grid grid-4" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(88,166,255,0.1)' }}>🎛️</div>
            <div className="stat-value text-blue">{devices.length}</div>
            <div className="stat-label">总设备数</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(63,185,80,0.1)' }}>✅</div>
            <div className="stat-value text-green">{onCount}</div>
            <div className="stat-label">运行中</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(110,118,129,0.1)' }}>⭕</div>
            <div className="stat-value text-muted">{devices.length - onCount}</div>
            <div className="stat-label">已关闭</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(210,153,34,0.1)' }}>⚡</div>
            <div className="stat-value text-yellow">{totalPower}</div>
            <div className="stat-label">当前功率(W)</div>
          </div>
        </div>

        {/* 分类筛选 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className="btn"
              style={{
                background: filter === k ? 'var(--accent-blue)' : 'var(--bg-card)',
                color: filter === k ? '#0d1117' : 'var(--text-secondary)',
                border: `1px solid ${filter === k ? 'var(--accent-blue)' : 'var(--border)'}`,
                fontSize: 13,
              }}
            >
              {v}
              {k !== 'all' && (
                <span style={{ marginLeft: 4, opacity: 0.7, fontSize: 11 }}>
                  ({devices.filter(d => d.type === k).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 设备卡片网格 */}
        <div className="grid grid-auto">
          {filtered.map(d => <DeviceCard key={d.id} device={d} />)}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40 }}>🔌</div>
            <div style={{ marginTop: 12 }}>该类型暂无设备</div>
          </div>
        )}
      </div>
    </div>
  );
}
