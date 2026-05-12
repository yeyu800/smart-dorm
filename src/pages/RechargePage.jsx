import { useState } from 'react';
import { useSmartStore } from '../store/useSmartStore';

// 支付方式图标
const payIcons = { alipay: '🔵', wechat: '🟢', campus: '🏫' };
const payLabels = { alipay: '支付宝', wechat: '微信支付', campus: '校园一卡通' };

// 记录类型样式
const typeStyle = {
  recharge: { color: '#3fb950', label: '充值', bg: 'rgba(63,185,80,0.1)' },
  consume:  { color: '#f85149', label: '消费', bg: 'rgba(248,81,73,0.1)'  },
  points:   { color: '#d29922', label: '积分', bg: 'rgba(210,153,34,0.1)' },
};

// 真实支付状态
const PAY_STATUS = {
  IDLE: 'idle',
  CREATING: 'creating',
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error',
};

export default function RechargePage() {
  const {
    electricAccount, rechargePlans, rechargeHistory,
    platformProfit, doRecharge, redeemPoints
  } = useSmartStore();

  const [selectedPlan, setSelectedPlan] = useState('p3');
  const [payMethod, setPayMethod] = useState('alipay');
  const [tab, setTab] = useState('recharge');
  const [redeemInput, setRedeemInput] = useState(100);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastRechargeInfo, setLastRechargeInfo] = useState(null);
  const [showRedeemSuccess, setShowRedeemSuccess] = useState(false);

  // 真实支付相关状态
  const [payStatus, setPayStatus] = useState(PAY_STATUS.IDLE);
  const [payResult, setPayResult] = useState(null);
  const [payError, setPayError] = useState('');
  const [showQR, setShowQR] = useState(false);

  // 后端 API 地址（本地开发用 3000，生产环境用你的服务器地址）
  const API_BASE = 'http://localhost:3000';

  const plan = rechargePlans.find(p => p.id === selectedPlan);
  const daysLeft = electricAccount.dailyRate > 0
    ? Math.floor(electricAccount.balance / electricAccount.dailyRate)
    : 999;

  // 真实支付充值（调用后端 → 虎皮椒）
  const handleRealPay = async () => {
    if (!plan) return;
    setPayStatus(PAY_STATUS.CREATING);
    setPayError('');

    try {
      const response = await fetch(`${API_BASE}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.amount,
          planName: plan.label,
          userId: 'student_001',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPayResult(data);
        setPayStatus(PAY_STATUS.PENDING);
        setShowQR(true);

        // 轮询查询订单状态（3秒一次，最多查20次=60秒）
        let attempts = 0;
        const pollOrder = async () => {
          attempts++;
          try {
            const res = await fetch(`${API_BASE}/api/order/${data.orderNo}`);
            const order = await res.json();
            if (order.status === 'paid') {
              setPayStatus(PAY_STATUS.SUCCESS);
              setShowQR(false);
              // 模拟充值成功更新 Store
              doRecharge(selectedPlan);
              setLastRechargeInfo({ plan, payMethod });
              setShowSuccess(true);
              setTimeout(() => setShowSuccess(false), 4000);
              return;
            }
          } catch (e) { /* ignore */ }

          if (attempts < 20 && payStatus === PAY_STATUS.PENDING) {
            setTimeout(pollOrder, 3000);
          }
        };

        setTimeout(pollOrder, 3000);
      } else {
        setPayError(data.error || '创建订单失败');
        setPayStatus(PAY_STATUS.ERROR);
      }
    } catch (err) {
      console.error('支付请求失败:', err);
      setPayError('无法连接支付服务，请确认后端服务已启动');
      setPayStatus(PAY_STATUS.ERROR);
    }
  };

  // 模拟充值（保持原有功能，不调用真实支付）
  const handleMockRecharge = () => {
    if (!plan) return;
    doRecharge(selectedPlan);
    setLastRechargeInfo({ plan, payMethod });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleRedeem = () => {
    if (redeemInput < 100 || redeemInput > electricAccount.points) return;
    redeemPoints(redeemInput);
    setShowRedeemSuccess(true);
    setTimeout(() => setShowRedeemSuccess(false), 2500);
  };

  const balanceColor = electricAccount.balance < 5
    ? '#f85149'
    : electricAccount.balance < 20
      ? '#d29922'
      : '#3fb950';

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>💡 电费充值中心</h1>
        <p>余额管理 · 智能充值 · 积分返利</p>
      </div>

      {/* 成功提示 */}
      {showSuccess && lastRechargeInfo && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 999,
          background: 'linear-gradient(135deg, #1a3a1a, #0d2a0d)',
          border: '1px solid rgba(63,185,80,0.4)',
          borderRadius: 12, padding: '14px 20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          color: '#3fb950', fontWeight: 600, fontSize: 14,
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'fadeIn 0.3s ease',
        }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <div>
            <div>充值成功！+{lastRechargeInfo.plan.amount + lastRechargeInfo.plan.bonus}元</div>
            <div style={{ fontSize: 12, color: '#8b949e', marginTop: 2 }}>
              赠送 {lastRechargeInfo.plan.points} 积分 · {payLabels[payMethod]} 支付
            </div>
          </div>
        </div>
      )}

      {showRedeemSuccess && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 999,
          background: 'linear-gradient(135deg, #2a1a00, #1a1000)',
          border: '1px solid rgba(210,153,34,0.4)',
          borderRadius: 12, padding: '14px 20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          color: '#d29922', fontWeight: 600, fontSize: 14,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>⭐</span>
          <div>积分兑换成功！</div>
        </div>
      )}

      {/* 真实支付弹窗 */}
      {showQR && payResult && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#1c2230', borderRadius: 16,
            padding: 32, textAlign: 'center', maxWidth: 360, width: '90%',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {payMethod === 'alipay' ? '💙' : '💚'}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              {payMethod === 'alipay' ? '支付宝支付' : '微信支付'}
            </div>
            <div style={{ fontSize: 14, color: '#8b949e', marginBottom: 20 }}>
              订单号：{payResult.orderNo}<br/>
              应付金额：<span style={{ color: '#f85149', fontWeight: 700 }}>¥{plan?.amount}</span>
            </div>

            {/* 二维码区域 */}
            {payResult.qrcode ? (
              <div style={{
                background: '#fff', borderRadius: 12,
                padding: 12, display: 'inline-block', marginBottom: 16,
              }}>
                <img
                  src={payResult.qrcode}
                  alt="支付二维码"
                  style={{ width: 200, height: 200, display: 'block' }}
                />
              </div>
            ) : (
              <div style={{
                background: 'var(--bg-secondary)', borderRadius: 12,
                padding: 24, marginBottom: 16,
              }}>
                <div style={{ fontSize: 14, color: '#8b949e' }}>
                  请使用{payMethod === 'alipay' ? '支付宝' : '微信'}扫码支付
                </div>
                {payResult.payUrl && (
                  <a
                    href={payResult.payUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block', marginTop: 12, padding: '10px 20px',
                      background: payMethod === 'alipay' ? '#1677ff' : '#07c160',
                      color: '#fff', borderRadius: 8, textDecoration: 'none',
                      fontSize: 14, fontWeight: 600,
                    }}
                  >
                    打开{payMethod === 'alipay' ? '支付宝' : '微信'}支付
                  </a>
                )}
              </div>
            )}

            {/* 状态指示 */}
            <div style={{
              padding: '8px 16px', borderRadius: 20,
              background: payStatus === PAY_STATUS.SUCCESS
                ? 'rgba(63,185,80,0.15)'
                : 'rgba(88,166,255,0.15)',
              color: payStatus === PAY_STATUS.SUCCESS ? '#3fb950' : '#58a6ff',
              fontSize: 13, fontWeight: 600,
            }}>
              {payStatus === PAY_STATUS.PENDING && '⏳ 等待支付中...（请在60秒内完成支付）'}
              {payStatus === PAY_STATUS.SUCCESS && '✅ 支付成功！'}
            </div>

            <div style={{ marginTop: 16 }}>
              <button onClick={() => { setShowQR(false); setPayStatus(PAY_STATUS.IDLE); }}
                style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)', color: '#8b949e', cursor: 'pointer' }}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {payError && (
        <div style={{
          marginBottom: 16, padding: '12px 16px', borderRadius: 10,
          background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)',
          color: '#f85149', fontSize: 13,
        }}>
          ❌ {payError}
        </div>
      )}

      <div className="page-content">

        {/* 账户概览卡片 */}
        <div style={{
          background: 'linear-gradient(135deg, #1c2c4a 0%, #0d1f3c 100%)',
          border: '1px solid rgba(88,166,255,0.25)',
          borderRadius: 16, padding: '24px 28px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
        }}>
          {/* 余额 */}
          <div>
            <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 6 }}>当前电费余额</div>
            <div style={{ fontSize: 48, fontWeight: 700, color: balanceColor, lineHeight: 1, letterSpacing: '-1px' }}>
              ¥{electricAccount.balance.toFixed(2)}
            </div>
            <div style={{ fontSize: 13, marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              {electricAccount.balance < 20 ? (
                <span style={{
                  background: 'rgba(248,81,73,0.15)', color: '#f85149',
                  padding: '3px 10px', borderRadius: 20, fontSize: 12,
                }}>
                  ⚠️ 余额不足，预计 {daysLeft} 天后断电
                </span>
              ) : (
                <span style={{ color: '#3fb950', fontSize: 12 }}>
                  ✅ 余额充足，预计可用 {daysLeft} 天
                </span>
              )}
            </div>
          </div>

          {/* 统计 */}
          <div style={{ display: 'flex', gap: 28 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#d29922' }}>⭐ {electricAccount.points}</div>
              <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4 }}>我的积分</div>
              <div style={{ fontSize: 11, color: '#6e7681', marginTop: 2 }}>≈ ¥{(electricAccount.points / 100).toFixed(2)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#58a6ff' }}>¥{electricAccount.monthConsumed.toFixed(2)}</div>
              <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4 }}>本月电费</div>
              <div style={{ fontSize: 11, color: '#6e7681', marginTop: 2 }}>¥{electricAccount.dailyRate}/天</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#bc8cff' }}>¥{electricAccount.totalRecharge.toFixed(2)}</div>
              <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4 }}>累计充值</div>
              <div style={{ fontSize: 11, color: '#6e7681', marginTop: 2 }}>{electricAccount.pricePerKwh} 元/kWh</div>
            </div>
          </div>
        </div>

        {/* Tab 切换 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { key: 'recharge', label: '💳 充值', },
            { key: 'points',   label: '⭐ 积分兑换', },
            { key: 'history',  label: '📋 消费记录', },
            { key: 'admin',    label: '📊 平台收益', },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
              background: tab === t.key ? '#58a6ff' : 'var(--bg-secondary)',
              color: tab === t.key ? '#fff' : 'var(--text-secondary)',
              fontWeight: tab === t.key ? 600 : 400,
              transition: 'all 0.2s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ========== 充值 Tab ========== */}
        {tab === 'recharge' && (
          <div className="grid grid-2">
            {/* 套餐选择 */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">选择充值套餐</div>
                <span className="badge badge-blue">6档可选</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {rechargePlans.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    style={{
                      border: `2px solid ${selectedPlan === p.id ? '#58a6ff' : 'var(--border-light)'}`,
                      borderRadius: 12, padding: '14px 14px 12px',
                      cursor: 'pointer', position: 'relative',
                      background: selectedPlan === p.id
                        ? 'linear-gradient(135deg, rgba(88,166,255,0.12),rgba(88,166,255,0.04))'
                        : 'var(--bg-secondary)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {p.tag && (
                      <div style={{
                        position: 'absolute', top: -1, right: -1,
                        background: p.popular ? '#58a6ff' : '#d29922',
                        color: '#fff', fontSize: 10, padding: '2px 8px',
                        borderRadius: '0 10px 0 8px', fontWeight: 600,
                      }}>{p.tag}</div>
                    )}
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>¥{p.amount}</div>
                    {p.bonus > 0 && (
                      <div style={{ fontSize: 12, color: '#3fb950', marginTop: 2 }}>+赠 ¥{p.bonus}</div>
                    )}
                    <div style={{ fontSize: 11, color: '#d29922', marginTop: 4 }}>⭐ 送{p.points}积分</div>
                    <div style={{ fontSize: 11, color: '#6e7681', marginTop: 2 }}>{p.label}</div>
                  </div>
                ))}
              </div>

              {/* 套餐详情提示 */}
              {plan && (
                <div style={{
                  marginTop: 14, padding: '12px 14px',
                  background: 'rgba(88,166,255,0.08)', borderRadius: 10,
                  fontSize: 13, color: 'var(--text-secondary)',
                  border: '1px solid rgba(88,166,255,0.15)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span>充值金额</span><span style={{ color: '#fff' }}>¥{plan.amount}.00</span>
                  </div>
                  {plan.bonus > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span>赠送余额</span><span style={{ color: '#3fb950' }}>+¥{plan.bonus}.00</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span>赠送积分</span><span style={{ color: '#d29922' }}>+{plan.points} 积分</span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <span>到账总额</span>
                    <span style={{ color: '#58a6ff', fontWeight: 700 }}>¥{(plan.amount + plan.bonus).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 支付确认 */}
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header">
                  <div className="card-title">选择支付方式</div>
                </div>
                {['alipay', 'wechat', 'campus'].map(m => (
                  <div
                    key={m} onClick={() => setPayMethod(m)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 10,
                      marginBottom: 8, cursor: 'pointer',
                      border: `1px solid ${payMethod === m ? '#58a6ff' : 'var(--border-light)'}`,
                      background: payMethod === m ? 'rgba(88,166,255,0.07)' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{payIcons[m]}</span>
                    <span style={{ flex: 1, fontSize: 14 }}>{payLabels[m]}</span>
                    <span style={{
                      width: 18, height: 18, borderRadius: '50%',
                      border: `2px solid ${payMethod === m ? '#58a6ff' : '#444'}`,
                      background: payMethod === m ? '#58a6ff' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {payMethod === m && <span style={{ width: 8, height: 8, background: '#fff', borderRadius: '50%', display: 'block' }} />}
                    </span>
                  </div>
                ))}
              </div>

              {/* 协议 & 安全 */}
              <div style={{ fontSize: 12, color: '#6e7681', marginBottom: 16, lineHeight: 1.7, padding: '0 2px' }}>
                🔒 支付由第三方安全平台保障 · 充值即时到账<br/>
                📌 充值金额仅限宿舍电费消费，不支持提现<br/>
                💡 赠送余额与积分根据套餐自动发放
              </div>

              {/* 真实支付按钮 */}
              <button
                onClick={handleRealPay}
                disabled={payStatus === PAY_STATUS.CREATING}
                style={{
                  width: '100%', padding: '16px', borderRadius: 12, border: 'none',
                  background: payStatus === PAY_STATUS.CREATING
                    ? '#3a5a8a'
                    : 'linear-gradient(135deg, #58a6ff, #1f6feb)',
                  color: '#fff', fontSize: 16, fontWeight: 700,
                  cursor: payStatus === PAY_STATUS.CREATING ? 'wait' : 'pointer',
                  letterSpacing: 1,
                  boxShadow: '0 4px 20px rgba(88,166,255,0.3)',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {payStatus === PAY_STATUS.CREATING ? (
                  <>⏳ 创建支付订单中...</>
                ) : (
                  <>💳 立即支付 ¥{plan ? plan.amount : '—'} →</>
                )}
              </button>

              {/* 分隔线 */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                margin: '16px 0', color: '#6e7681', fontSize: 12,
              }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
                或
                <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
              </div>

              {/* 模拟充值（仅演示用） */}
              <button onClick={handleMockRecharge} style={{
                width: '100%', padding: '10px', borderRadius: 10, border: '1px solid var(--border)',
                background: 'var(--bg-secondary)', color: '#8b949e', fontSize: 13,
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
                🎭 模拟充值（仅演示，不真实扣款）
              </button>

              {/* 推广说明 */}
              <div style={{
                marginTop: 16, padding: '14px', borderRadius: 12,
                background: 'rgba(210,153,34,0.08)',
                border: '1px solid rgba(210,153,34,0.2)',
              }}>
                <div style={{ fontSize: 13, color: '#d29922', fontWeight: 600, marginBottom: 8 }}>⭐ 积分规则说明</div>
                <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.8 }}>
                  · 充值即送积分，金额越大比例越高<br/>
                  · 节能操作每日最多额外奖励 20 积分<br/>
                  · 100 积分 = 抵扣 ¥1 电费<br/>
                  · 积分有效期 12 个月，不可提现
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== 积分兑换 Tab ========== */}
        {tab === 'points' && (
          <div className="grid grid-2">
            <div className="card">
              <div className="card-header">
                <div className="card-title">⭐ 积分余额</div>
                <span className="badge" style={{ background: 'rgba(210,153,34,0.15)', color: '#d29922' }}>
                  {electricAccount.points} 分
                </span>
              </div>
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 56, fontWeight: 700, color: '#d29922' }}>{electricAccount.points}</div>
                <div style={{ fontSize: 14, color: '#8b949e', marginTop: 8 }}>可兑换 ¥{(electricAccount.points / 100).toFixed(2)} 电费</div>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>输入兑换积分数量（100 的倍数）</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="number" min={100} max={electricAccount.points} step={100}
                    value={redeemInput}
                    onChange={e => setRedeemInput(Math.min(Number(e.target.value), electricAccount.points))}
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-light)',
                      background: 'var(--bg-secondary)', color: '#fff', fontSize: 14,
                    }}
                  />
                  <span style={{ color: '#d29922', fontWeight: 600, minWidth: 70, fontSize: 14 }}>
                    = ¥{(redeemInput / 100).toFixed(2)}
                  </span>
                </div>

                {/* 快捷选项 */}
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {[100, 200, 300, 500].map(v => (
                    <button key={v} onClick={() => setRedeemInput(Math.min(v, electricAccount.points))} style={{
                      padding: '6px 14px', borderRadius: 20, border: '1px solid var(--border-light)',
                      background: redeemInput === v ? 'rgba(210,153,34,0.15)' : 'transparent',
                      color: redeemInput === v ? '#d29922' : '#8b949e',
                      fontSize: 12, cursor: 'pointer',
                    }}>
                      {v}分
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleRedeem}
                  disabled={redeemInput < 100 || redeemInput > electricAccount.points}
                  style={{
                    width: '100%', marginTop: 16, padding: '12px', borderRadius: 10, border: 'none',
                    background: redeemInput >= 100 && redeemInput <= electricAccount.points
                      ? 'linear-gradient(135deg, #d29922, #a07020)'
                      : '#2a2a2a',
                    color: redeemInput >= 100 ? '#fff' : '#666',
                    fontSize: 14, fontWeight: 600, cursor: redeemInput >= 100 ? 'pointer' : 'not-allowed',
                  }}
                >
                  确认兑换 {redeemInput} 积分 → ¥{(redeemInput / 100).toFixed(2)}
                </button>
              </div>
            </div>

            {/* 获取积分途径 */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">🎯 如何获得积分</div>
              </div>
              {[
                { icon: '💳', title: '充值奖励', desc: '充值即送，金额越大送得越多', color: '#58a6ff' },
                { icon: '🌿', title: '节能奖励', desc: '每降低 0.1kWh 用电量，奖励 5 积分', color: '#3fb950' },
                { icon: '⏰', title: '错峰用电', desc: '晚 23:00 后用电奖励双倍积分', color: '#d29922' },
                { icon: '📅', title: '连续签到', desc: '连续7天打卡，额外奖励 50 积分', color: '#bc8cff' },
                { icon: '👥', title: '邀请室友', desc: '成功邀请室友注册，奖励 100 积分', color: '#ff7b72' },
              ].map(item => (
                <div key={item.title} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0', borderBottom: '1px solid var(--border-light)',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, fontSize: 18,
                    background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: '#6e7681', marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== 消费记录 Tab ========== */}
        {tab === 'history' && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">📋 收支明细</div>
              <span className="badge badge-blue">{rechargeHistory.length} 条记录</span>
            </div>
            {rechargeHistory.map(rec => {
              const ts = typeStyle[rec.type] || typeStyle.consume;
              return (
                <div key={rec.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0',
                  borderBottom: '1px solid var(--border-light)',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, fontSize: 18, flexShrink: 0,
                    background: ts.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {rec.type === 'recharge' ? '💳' : rec.type === 'points' ? '⭐' : '⚡'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{rec.desc}</div>
                    <div style={{ fontSize: 12, color: '#6e7681', marginTop: 3 }}>
                      {rec.time}
                      {rec.points !== 0 && (
                        <span style={{ marginLeft: 8, color: '#d29922' }}>
                          {rec.points > 0 ? `+${rec.points}积分` : `${rec.points}积分`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: ts.color }}>
                      {rec.amount > 0 ? `+¥${rec.amount.toFixed(2)}` : rec.amount < 0 ? `-¥${Math.abs(rec.amount).toFixed(2)}` : '—'}
                    </div>
                    <div style={{ fontSize: 11, color: '#6e7681', marginTop: 2 }}>
                      余额 ¥{rec.balance.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========== 平台收益 Tab ========== */}
        {tab === 'admin' && (
          <div>
            <div style={{
              padding: '10px 14px', marginBottom: 16, borderRadius: 10,
              background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)',
              fontSize: 12, color: '#f85149',
            }}>
              ⚠️ 此模块为平台管理员视角，展示系统盈利构成（教学演示数据）
            </div>

            <div className="grid grid-3" style={{ marginBottom: 20 }}>
              {[
                { icon: '💰', label: '平台服务费（累计）', value: `¥${platformProfit.totalFee.toFixed(2)}`, sub: `本月 ¥${platformProfit.monthFee.toFixed(2)}`, color: '#58a6ff' },
                { icon: '📢', label: '广告/联名收入（累计）', value: `¥${platformProfit.totalAds.toFixed(2)}`, sub: `本月 ¥${platformProfit.monthAds.toFixed(2)}`, color: '#3fb950' },
                { icon: '⭐', label: '积分商城利润（累计）', value: `¥${platformProfit.totalPoints}`, sub: '100积分仅抵¥1，差价盈利', color: '#d29922' },
              ].map(item => (
                <div key={item.label} className="stat-card" style={{
                  background: `linear-gradient(135deg, ${item.color}18, ${item.color}06)`,
                  border: `1px solid ${item.color}30`,
                }}>
                  <div className="stat-icon" style={{ background: `${item.color}20`, fontSize: 20 }}>{item.icon}</div>
                  <div className="stat-value" style={{ color: item.color, fontSize: 22 }}>{item.value}</div>
                  <div className="stat-label">{item.label}</div>
                  <div style={{ fontSize: 11, color: '#6e7681', marginTop: 4 }}>{item.sub}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">💡 盈利模式分析</div>
              </div>
              {[
                { title: '服务费模式', icon: '💳', color: '#58a6ff',
                  desc: '对充值金额收取 0.5%~2% 平台服务费，用户充值 ¥50 时收 ¥0.5，充值越多服务费越高（但比例递减刺激大额充值）' },
                { title: '赠送余额差价', icon: '🎁', color: '#3fb950',
                  desc: '赠送金额（如 +¥6）与实际用于电费的成本之间存在差价——平台向学校批量预付电费单价低于用户单价，差额即利润' },
                { title: '积分稀释盈利', icon: '⭐', color: '#d29922',
                  desc: '充值 ¥100 送 140 积分，但 100积分=¥1，即¥1.4。实际电费赠送价值 ¥6，积分价值¥1.4，总赠出价值仅 ¥7.4 < 声称优惠价值' },
                { title: '广告联名变现', icon: '📢', color: '#bc8cff',
                  desc: '充值页面展示校内品牌广告位（奶茶、外卖等），或与学校合作福利套餐，平台抽取佣金' },
                { title: '沉淀资金收益', icon: '🏦', color: '#ff7b72',
                  desc: '用户预充但未消费的余额产生资金沉淀，平台可对这部分资金进行短期理财，获取无风险利息收入' },
              ].map(item => (
                <div key={item.title} style={{
                  padding: '14px', marginBottom: 10, borderRadius: 10,
                  background: `${item.color}08`, border: `1px solid ${item.color}20`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <span style={{ fontWeight: 600, color: item.color }}>{item.title}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
