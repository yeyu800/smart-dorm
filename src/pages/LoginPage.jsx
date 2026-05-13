import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, BUILDINGS, getRooms } from '../store/useAuthStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuthStore();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [step, setStep] = useState(1); // 注册步骤：1=账号 2=宿舍绑定

  // 表单数据
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    building: '',
    room: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // 当前选中楼栋的房间列表
  const selectedBuilding = BUILDINGS.find(b => b.id === form.building);
  const rooms = selectedBuilding ? getRooms(selectedBuilding.floors) : [];

  // ===== 登录提交 =====
  const handleLogin = () => {
    setError('');
    if (!form.username.trim()) return setError('请输入用户名');
    if (!form.password) return setError('请输入密码');
    setLoading(true);
    setTimeout(() => {
      const res = login({ username: form.username.trim(), password: form.password });
      setLoading(false);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
    }, 600);
  };

  // ===== 注册：第一步验证 =====
  const handleRegisterStep1 = () => {
    setError('');
    if (!form.username.trim()) return setError('请输入用户名');
    if (form.username.length < 3) return setError('用户名至少 3 个字符');
    if (!form.password) return setError('请输入密码');
    if (form.password.length < 6) return setError('密码至少 6 位');
    if (form.password !== form.confirmPassword) return setError('两次密码不一致');
    setStep(2);
  };

  // ===== 注册：第二步提交 =====
  const handleRegisterStep2 = () => {
    setError('');
    if (!form.building) return setError('请选择楼栋');
    if (!form.room) return setError('请选择房间号');
    setLoading(true);
    setTimeout(() => {
      const res = register({
        username: form.username.trim(),
        password: form.password,
        nickname: form.nickname.trim() || form.username.trim(),
        building: form.building,
        room: form.room,
      });
      setLoading(false);
      if (res.success) {
        navigate('/');
      } else {
        setStep(1);
        setError(res.message);
      }
    }, 600);
  };

  return (
    <div className="login-page">
      {/* 背景装饰 */}
      <div className="login-bg">
        <div className="login-bg-circle c1" />
        <div className="login-bg-circle c2" />
        <div className="login-bg-circle c3" />
      </div>

      <div className="login-container">
        {/* 顶部 Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">🏠</div>
          <h1 className="login-title">宿舍智能家居</h1>
          <p className="login-subtitle">Smart Dorm · 智能生活</p>
        </div>

        {/* 模式切换 Tab */}
        <div className="login-tabs">
          <button
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setStep(1); setError(''); }}
          >
            登录
          </button>
          <button
            className={`login-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setStep(1); setError(''); }}
          >
            注册
          </button>
        </div>

        {/* 卡片 */}
        <div className="login-card">

          {/* ===== 登录表单 ===== */}
          {mode === 'login' && (
            <div className="login-form">
              <div className="form-group">
                <label className="form-label">用户名</label>
                <input
                  className="form-input"
                  placeholder="请输入用户名"
                  value={form.username}
                  onChange={e => upd('username', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <div className="form-group">
                <label className="form-label">密码</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="请输入密码"
                  value={form.password}
                  onChange={e => upd('password', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>

              {error && <div className="form-error">{error}</div>}

              <button
                className="btn-login"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? '登录中...' : '登 录'}
              </button>

              <div className="login-hint">
                还没有账号？
                <span className="login-link" onClick={() => { setMode('register'); setError(''); }}>
                  立即注册
                </span>
              </div>

              {/* 演示账号提示 */}
              <div className="demo-hint">
                <div className="demo-hint-title">💡 演示账号</div>
                <div className="demo-hint-row">
                  <span>先注册一个账号即可体验完整功能</span>
                </div>
              </div>
            </div>
          )}

          {/* ===== 注册表单：第1步 ===== */}
          {mode === 'register' && step === 1 && (
            <div className="login-form">
              <div className="register-step-indicator">
                <div className="step active">
                  <span className="step-num">1</span>
                  <span className="step-label">账号信息</span>
                </div>
                <div className="step-line" />
                <div className="step">
                  <span className="step-num">2</span>
                  <span className="step-label">绑定宿舍</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">用户名 <span className="required">*</span></label>
                <input
                  className="form-input"
                  placeholder="3-20个字符，字母数字下划线"
                  value={form.username}
                  onChange={e => upd('username', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">昵称（可选）</label>
                <input
                  className="form-input"
                  placeholder="不填则使用用户名"
                  value={form.nickname}
                  onChange={e => upd('nickname', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">密码 <span className="required">*</span></label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="至少 6 位"
                  value={form.password}
                  onChange={e => upd('password', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">确认密码 <span className="required">*</span></label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="再次输入密码"
                  value={form.confirmPassword}
                  onChange={e => upd('confirmPassword', e.target.value)}
                />
              </div>

              {error && <div className="form-error">{error}</div>}

              <button className="btn-login" onClick={handleRegisterStep1}>
                下一步：绑定宿舍 →
              </button>

              <div className="login-hint">
                已有账号？
                <span className="login-link" onClick={() => { setMode('login'); setError(''); }}>
                  立即登录
                </span>
              </div>
            </div>
          )}

          {/* ===== 注册表单：第2步 ===== */}
          {mode === 'register' && step === 2 && (
            <div className="login-form">
              <div className="register-step-indicator">
                <div className="step done">
                  <span className="step-num">✓</span>
                  <span className="step-label">账号信息</span>
                </div>
                <div className="step-line active" />
                <div className="step active">
                  <span className="step-num">2</span>
                  <span className="step-label">绑定宿舍</span>
                </div>
              </div>

              <div className="dorm-bind-hint">
                <div>🏠 绑定宿舍后，系统将监控你的宿舍设备与用电数据</div>
              </div>

              <div className="form-group">
                <label className="form-label">选择楼栋 <span className="required">*</span></label>
                <div className="building-grid">
                  {BUILDINGS.map(b => (
                    <button
                      key={b.id}
                      className={`building-btn ${form.building === b.id ? 'selected' : ''}`}
                      onClick={() => { upd('building', b.id); upd('room', ''); }}
                    >
                      <span className="building-id">{b.id}栋</span>
                      <span className="building-name">{b.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {form.building && (
                <div className="form-group">
                  <label className="form-label">选择房间号 <span className="required">*</span></label>
                  <select
                    className="form-input form-select"
                    value={form.room}
                    onChange={e => upd('room', e.target.value)}
                  >
                    <option value="">-- 请选择房间 --</option>
                    {rooms.map(r => (
                      <option key={r} value={r}>{r}室</option>
                    ))}
                  </select>
                </div>
              )}

              {form.building && form.room && (
                <div className="dorm-preview">
                  <span>📍 你的宿舍：</span>
                  <strong>{selectedBuilding?.name} {form.room}室</strong>
                </div>
              )}

              {error && <div className="form-error">{error}</div>}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn-login secondary"
                  style={{ flex: 1 }}
                  onClick={() => { setStep(1); setError(''); }}
                >
                  ← 返回
                </button>
                <button
                  className="btn-login"
                  style={{ flex: 2 }}
                  onClick={handleRegisterStep2}
                  disabled={loading}
                >
                  {loading ? '注册中...' : '完成注册'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
