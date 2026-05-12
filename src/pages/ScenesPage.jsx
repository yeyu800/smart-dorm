import { useSmartStore } from '../store/useSmartStore';

export default function ScenesPage() {
  const { scenes, activeScene, applyScene, devices } = useSmartStore();

  const sceneGradients = {
    s1: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a1a 100%)',
    s2: 'linear-gradient(135deg, #0d2137 0%, #061220 100%)',
    s3: 'linear-gradient(135deg, #0f2940 0%, #071a29 100%)',
    s4: 'linear-gradient(135deg, #2e1a4a 0%, #1a0d30 100%)',
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>✨ 场景模式</h1>
        <p>一键切换，智能联动所有设备，打造最适宜的生活环境</p>
      </div>

      <div className="page-content">
        <div className="section-title">🎭 预设场景</div>

        <div className="grid grid-2" style={{ marginBottom: 28 }}>
          {scenes.map(sc => (
            <div
              key={sc.id}
              className={`scene-card ${sc.id === activeScene ? 'active' : ''}`}
              style={{ background: sceneGradients[sc.id], border: `2px solid ${sc.id === activeScene ? 'var(--accent-blue)' : 'rgba(255,255,255,0.08)'}` }}
              onClick={() => applyScene(sc.id)}
            >
              {sc.id === activeScene && <div className="scene-active-badge">当前激活</div>}
              <div className="scene-icon">{sc.icon}</div>
              <div className="scene-name">{sc.name}</div>
              <div className="scene-desc">{sc.desc}</div>

              {/* 场景影响的设备预览 */}
              <div style={{ marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>影响设备</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {Object.keys(sc.actions).map(did => {
                    const d = devices.find(dev => dev.id === did);
                    if (!d) return null;
                    const action = sc.actions[did];
                    return (
                      <span key={did} style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: action.on === false ? 'rgba(248,81,73,0.15)' : 'rgba(63,185,80,0.15)',
                        color: action.on === false ? 'var(--accent-red)' : 'var(--accent-green)',
                      }}>
                        {d.icon} {d.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 自定义提示 */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🔧 自定义场景</div>
            <span className="badge badge-blue">即将推出</span>
          </div>
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40 }}>🛠️</div>
            <div style={{ marginTop: 12, fontSize: 14 }}>支持自定义设备组合与触发条件</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>例如：每天 22:30 自动进入睡眠模式</div>
            <button className="btn btn-primary" style={{ marginTop: 16, opacity: 0.5, cursor: 'not-allowed' }}>
              + 新建场景
            </button>
          </div>
        </div>

        {/* 当前设备状态 */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div className="card-title">📋 当前设备状态</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {devices.map(d => (
              <div key={d.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px',
                background: d.on ? 'rgba(63,185,80,0.06)' : 'var(--bg-secondary)',
                border: `1px solid ${d.on ? 'rgba(63,185,80,0.2)' : 'var(--border)'}`,
                borderRadius: 8,
              }}>
                <span>{d.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: d.on ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {d.on ? '开' : '关'}
                    {d.temp ? ` · ${d.temp}°C` : ''}
                    {d.brightness ? ` · ${d.brightness}%` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
