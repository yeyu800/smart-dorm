import { create } from 'zustand';

// ============ Mock 数据 ============
const initialDevices = [
  { id: 'd1', name: '主灯', type: 'light', room: '卧室', icon: '💡', on: true, brightness: 80, color: '#fff7e6' },
  { id: 'd2', name: '台灯', type: 'light', room: '书桌', icon: '🔆', on: false, brightness: 60, color: '#ffffff' },
  { id: 'd3', name: '空调', type: 'ac', room: '卧室', icon: '❄️', on: true, temp: 26, mode: '制冷', speed: '自动', power: 1200 },
  { id: 'd4', name: '风扇', type: 'fan', room: '卧室', icon: '🌀', on: false, speed: 2, oscillate: true },
  { id: 'd5', name: '插座1', type: 'socket', room: '书桌', icon: '🔌', on: true, power: 65 },
  { id: 'd6', name: '插座2', type: 'socket', room: '床头', icon: '🔌', on: true, power: 10 },
  { id: 'd7', name: '加湿器', type: 'humidifier', room: '卧室', icon: '💧', on: false, level: 2 },
  { id: 'd8', name: '智能窗帘', type: 'curtain', room: '窗边', icon: '🪟', on: false, open: 50 },
];

const initialEnv = {
  temperature: 24.5,
  humidity: 62,
  pm25: 18,
  co2: 620,
  noise: 34,
  light: 280,
  history: {
    temperature: [22.1, 22.8, 23.5, 24.0, 24.5, 24.2, 23.8, 23.5, 24.1, 24.5, 25.0, 24.8],
    humidity:    [58,   60,   62,   63,   62,   60,   59,   58,   60,   62,   64,   62],
    pm25:        [12,   15,   18,   22,   19,   16,   14,   18,   20,   18,   17,   18],
    co2:         [580,  600,  620,  640,  650,  630,  610,  600,  615,  620,  635,  620],
    noise:       [28,   30,   35,   38,   34,   32,   30,   36,   40,   34,   32,   34],
  },
  timeLabels: ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'],
};

const scenes = [
  { id: 's1', name: '睡眠模式', icon: '🌙', desc: '关闭所有灯，空调26°C，窗帘关闭', active: false, color: '#1a1a2e',
    actions: { d1: { on: false }, d2: { on: false }, d3: { on: true, temp: 26 }, d8: { on: true, open: 0 } } },
  { id: 's2', name: '学习模式', icon: '📚', desc: '台灯开启，空调24°C，禁止噪音', active: false, color: '#16213e',
    actions: { d1: { on: false }, d2: { on: true, brightness: 100 }, d3: { on: true, temp: 24 }, d5: { on: true } } },
  { id: 's3', name: '离开模式', icon: '🚪', desc: '关闭所有设备，节能待机', active: false, color: '#0f3460',
    actions: { d1: { on: false }, d2: { on: false }, d3: { on: false }, d4: { on: false }, d5: { on: false }, d6: { on: false } } },
  { id: 's4', name: '迎客模式', icon: '🎉', desc: '全灯亮起，空调舒适温度', active: true, color: '#533483',
    actions: { d1: { on: true, brightness: 100 }, d2: { on: true, brightness: 80 }, d3: { on: true, temp: 25 }, d8: { on: true, open: 80 } } },
];

const energyData = {
  today: 2.4,
  month: 68.2,
  saved: 12.5,
  dailyKwh: [1.8, 2.1, 1.9, 2.4, 2.2, 1.7, 2.0, 2.3, 2.1, 1.9, 2.4, 1.8, 2.0, 2.3],
  dayLabels: ['4/29','4/30','5/1','5/2','5/3','5/4','5/5','5/6','5/7','5/8','5/9','5/10','5/11','5/12'],
  byDevice: [
    { name: '空调', kwh: 1.2, pct: 50 },
    { name: '主灯', kwh: 0.4, pct: 17 },
    { name: '插座1', kwh: 0.3, pct: 13 },
    { name: '台灯', kwh: 0.2, pct: 8 },
    { name: '其他', kwh: 0.3, pct: 12 },
  ],
};

const notifications = [
  { id: 'n1', type: 'warning', title: 'CO₂浓度偏高', desc: '当前 620ppm，建议开窗通风', time: '09:30', read: false },
  { id: 'n2', type: 'info',    title: '空调已自动调温', desc: '房间温度达到设定值 26°C', time: '08:15', read: false },
  { id: 'n3', type: 'success', title: '节能模式节约', desc: '昨日节省用电 0.5 kWh', time: '昨天', read: true },
  { id: 'n4', type: 'warning', title: '湿度偏高', desc: '当前湿度 62%，已开启除湿功能', time: '昨天', read: true },
  { id: 'n5', type: 'info',    title: '场景切换', desc: '已自动切换至"学习模式"', time: '昨天', read: true },
];

// ============ Zustand Store ============
export const useSmartStore = create((set, get) => ({
  // 设备
  devices: initialDevices,
  toggleDevice: (id) => set(s => ({
    devices: s.devices.map(d => d.id === id ? { ...d, on: !d.on } : d)
  })),
  updateDevice: (id, patch) => set(s => ({
    devices: s.devices.map(d => d.id === id ? { ...d, ...patch } : d)
  })),

  // 环境
  env: initialEnv,

  // 场景
  scenes,
  activeScene: 's4',
  applyScene: (sceneId) => set(s => {
    const scene = s.scenes.find(sc => sc.id === sceneId);
    if (!scene) return {};
    let devices = [...s.devices];
    Object.entries(scene.actions).forEach(([did, patch]) => {
      devices = devices.map(d => d.id === did ? { ...d, ...patch } : d);
    });
    return {
      devices,
      activeScene: sceneId,
      scenes: s.scenes.map(sc => ({ ...sc, active: sc.id === sceneId })),
    };
  }),

  // 能耗
  energy: energyData,

  // 通知
  notifications,
  unreadCount: notifications.filter(n => !n.read).length,
  markAllRead: () => set(s => ({
    notifications: s.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  markRead: (id) => set(s => {
    const updated = s.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    return { notifications: updated, unreadCount: updated.filter(n => !n.read).length };
  }),

  // 用户
  user: {
    name: '肖烨',
    dorm: '求是苑 A-408',
    avatar: '🧑‍💻',
    joined: '2024-09-01',
    role: '宿舍长',
  },

  // ============ 电费账户 ============
  electricAccount: {
    balance: 12.50,          // 当前余额（元）
    points: 380,             // 积分余额
    totalRecharge: 260.00,   // 历史累计充值
    totalConsumed: 247.50,   // 历史累计消费
    monthConsumed: 13.70,    // 本月消费
    dailyRate: 0.52,         // 日均消费（元/天）
    pricePerKwh: 0.60,       // 电价（元/kWh）
    lastRecharge: '2026-05-01',
  },

  // 充值套餐（含平台服务费盈利）
  rechargePlans: [
    { id: 'p1', amount: 10,  bonus: 0,   points: 10,  label: '小额充值', tag: null,        fee: 0,    popular: false },
    { id: 'p2', amount: 30,  bonus: 0,   points: 35,  label: '基础套餐', tag: null,        fee: 0,    popular: false },
    { id: 'p3', amount: 50,  bonus: 2,   points: 65,  label: '推荐套餐', tag: '最受欢迎',  fee: 0.5,  popular: true  },
    { id: 'p4', amount: 100, bonus: 6,   points: 140, label: '月度套餐', tag: '超值',      fee: 0.8,  popular: false },
    { id: 'p5', amount: 200, bonus: 15,  points: 300, label: '季度套餐', tag: '最划算',    fee: 1.2,  popular: false },
    { id: 'p6', amount: 500, bonus: 50,  points: 800, label: '年度套餐', tag: '尊享',      fee: 2.0,  popular: false },
  ],

  // 消费/充值记录
  rechargeHistory: [
    { id: 'r1', type: 'recharge', amount: 100, bonus: 6,  points: 140, time: '2026-05-01 09:12', desc: '月度套餐充值', balance: 106.00 },
    { id: 'r2', type: 'consume',  amount: -30, bonus: 0,  points: 0,   time: '2026-05-03 06:00', desc: '日常用电扣费', balance: 76.00  },
    { id: 'r3', type: 'consume',  amount: -20, bonus: 0,  points: 0,   time: '2026-05-07 06:00', desc: '日常用电扣费', balance: 56.00  },
    { id: 'r4', type: 'recharge', amount: 50,  bonus: 2,  points: 65,  time: '2026-05-08 14:30', desc: '推荐套餐充值', balance: 108.00 },
    { id: 'r5', type: 'consume',  amount: -50, bonus: 0,  points: 0,   time: '2026-05-10 06:00', desc: '日常用电扣费', balance: 58.00  },
    { id: 'r6', type: 'points',   amount: 0,   bonus: 0,  points: 50,  time: '2026-05-10 10:00', desc: '积分兑换抵扣 5元', balance: 63.00 },
    { id: 'r7', type: 'consume',  amount: -50, bonus: 0,  points: 0,   time: '2026-05-11 06:00', desc: '日常用电扣费', balance: 13.00  },
    { id: 'r8', type: 'points',   amount: 0.5, bonus: 0,  points: 0,   time: '2026-05-12 08:00', desc: '节能积分奖励', balance: 13.50  },
  ],

  // 平台盈利统计（模拟后台数据）
  platformProfit: {
    totalFee: 18.60,         // 总服务费收入
    totalAds: 42.00,         // 广告联名收入
    totalPoints: 560,        // 积分商城利润（元）
    monthFee: 3.20,
    monthAds: 8.50,
  },

  // 充值操作
  doRecharge: (planId) => set(s => {
    const plan = s.rechargePlans.find(p => p.id === planId);
    if (!plan) return {};
    const actualAdd = plan.amount + plan.bonus;
    const newBalance = +(s.electricAccount.balance + actualAdd).toFixed(2);
    const newPoints = s.electricAccount.points + plan.points;
    const newRecord = {
      id: `r${Date.now()}`,
      type: 'recharge',
      amount: plan.amount,
      bonus: plan.bonus,
      points: plan.points,
      time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      desc: `${plan.label}充值`,
      balance: newBalance,
    };
    // 平台服务费盈利累计
    const newPlatformProfit = {
      ...s.platformProfit,
      totalFee: +(s.platformProfit.totalFee + plan.fee).toFixed(2),
      monthFee: +(s.platformProfit.monthFee + plan.fee).toFixed(2),
    };
    return {
      electricAccount: {
        ...s.electricAccount,
        balance: newBalance,
        points: newPoints,
        totalRecharge: +(s.electricAccount.totalRecharge + plan.amount).toFixed(2),
        lastRecharge: new Date().toLocaleDateString('zh-CN').replace(/\//g, '-'),
      },
      rechargeHistory: [newRecord, ...s.rechargeHistory],
      platformProfit: newPlatformProfit,
    };
  }),

  // 积分兑换抵扣（100积分=1元）
  redeemPoints: (pts) => set(s => {
    if (s.electricAccount.points < pts || pts <= 0) return {};
    const discount = +(pts / 100).toFixed(2);
    const newBalance = +(s.electricAccount.balance + discount).toFixed(2);
    const newRecord = {
      id: `r${Date.now()}`,
      type: 'points',
      amount: discount,
      bonus: 0,
      points: -pts,
      time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      desc: `积分兑换抵扣 ${discount}元`,
      balance: newBalance,
    };
    return {
      electricAccount: {
        ...s.electricAccount,
        balance: newBalance,
        points: s.electricAccount.points - pts,
      },
      rechargeHistory: [newRecord, ...s.rechargeHistory],
    };
  }),
}));
