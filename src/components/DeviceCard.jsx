import { useState } from 'react';
import { useSmartStore } from '../store/useSmartStore';

export default function DeviceCard({ device }) {
  const { toggleDevice, updateDevice } = useSmartStore();
  const [expanded, setExpanded] = useState(false);

  const toggle = (e) => {
    e.stopPropagation();
    toggleDevice(device.id);
  };

  return (
    <div
      className={`device-card ${device.on ? 'on' : 'off'}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="device-icon-wrap">{device.icon}</div>
        <button className={`toggle ${device.on ? 'on' : ''}`} onClick={toggle} />
      </div>

      <div className="device-name">{device.name}</div>
      <div className="device-room">{device.room}</div>

      <div className={`device-status ${device.on ? 'on' : 'off'}`}>
        <span>{device.on ? '● 运行中' : '○ 已关闭'}</span>
        {device.on && device.power && <span style={{ marginLeft: 4 }}>{device.power}W</span>}
      </div>

      {expanded && device.on && (
        <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}
             onClick={e => e.stopPropagation()}>
          {/* 灯光：亮度 */}
          {device.type === 'light' && (
            <div className="slider-wrap">
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>亮度</span>
              <input type="range" min={10} max={100} value={device.brightness}
                onChange={e => updateDevice(device.id, { brightness: +e.target.value })} />
              <span>{device.brightness}%</span>
            </div>
          )}

          {/* 空调：温度 + 模式 */}
          {device.type === 'ac' && (
            <>
              <div className="slider-wrap">
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>温度</span>
                <input type="range" min={16} max={30} value={device.temp}
                  onChange={e => updateDevice(device.id, { temp: +e.target.value })} />
                <span>{device.temp}°C</span>
              </div>
              <div className="mode-btns">
                {['制冷', '制热', '除湿', '送风'].map(m => (
                  <button key={m} className={`mode-btn ${device.mode === m ? 'active' : ''}`}
                    onClick={() => updateDevice(device.id, { mode: m })}>{m}</button>
                ))}
              </div>
            </>
          )}

          {/* 风扇：风速 */}
          {device.type === 'fan' && (
            <div className="slider-wrap">
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>风速</span>
              <input type="range" min={1} max={5} value={device.speed}
                onChange={e => updateDevice(device.id, { speed: +e.target.value })} />
              <span>档{device.speed}</span>
            </div>
          )}

          {/* 窗帘：开合度 */}
          {device.type === 'curtain' && (
            <div className="slider-wrap">
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>开合</span>
              <input type="range" min={0} max={100} value={device.open}
                onChange={e => updateDevice(device.id, { open: +e.target.value })} />
              <span>{device.open}%</span>
            </div>
          )}

          {/* 加湿器：档位 */}
          {device.type === 'humidifier' && (
            <div className="mode-btns">
              {[1, 2, 3].map(lv => (
                <button key={lv} className={`mode-btn ${device.level === lv ? 'active' : ''}`}
                  onClick={() => updateDevice(device.id, { level: lv })}>档{lv}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
