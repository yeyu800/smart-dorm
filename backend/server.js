/**
 * 虎皮椒支付集成 - 后端服务
 *
 * 使用方法：
 * 1. npm install
 * 2. 修改下方的 APP_ID 和 APP_SECRET（从虎皮椒后台获取）
 * 3. npm run dev 启动服务
 *
 * 虎皮椒文档：https://doc.xunhupay.com
 */

// ============ 配置区 - 请填写你的虎皮椒信息 ============
const HUPIJIAO_CONFIG = {
  // 虎皮椒 APP_ID（在后台应用管理页面获取）
  appid: 'YOUR_APP_ID_HERE',

  // 虎皮椒 APP_SECRET（在后台应用管理页面获取）
  appsecret: 'YOUR_APP_SECRET_HERE',

  // 支付接口版本（固定）
  version: '1.1',

  // 支付网关
  pay_url: 'https://api.xunhupay.com/payment/do.html',

  // 支付成功回调地址（必须公网可访问，开发阶段用内网穿透）
  notify_url: 'http://你的服务器IP:3000/api/notify',

  // 支付完成后跳转页面
  return_url: 'https://smartdorm-ten.vercel.app/recharge',
};

// ============ Express 服务 ============
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

// 存储订单（生产环境建议用数据库）
const orders = new Map();

// ============ 虎皮椒签名算法 ============
function generateSign(params, appsecret) {
  // 按 key 字典序排序并拼接
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys
    .filter(k => k !== 'sign' && params[k] !== '' && params[k] !== null)
    .map(k => `${k}=${params[k]}`)
    .join('&');

  // MD5 签名
  return crypto
    .createHash('md5')
    .update(signStr + appsecret)
    .digest('hex');
}

// 验证签名
function verifySign(params) {
  const receivedSign = params.sign;
  const calculatedSign = generateSign(params, HUPIJIAO_CONFIG.appsecret);
  return receivedSign === calculatedSign;
}

// ============ 创建支付订单 ============
app.post('/api/create-order', async (req, res) => {
  const { amount, planName, userId } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: '金额必须大于0' });
  }

  // 生成订单号（格式：SD + 时间戳 + 随机数）
  const orderNo = 'SD' + Date.now() + Math.floor(Math.random() * 1000);

  // 构造请求参数
  const params = {
    appid: HUPIJIAO_CONFIG.appid,
    version: HUPIJIAO_CONFIG.version,
    trade_order_id: orderNo,
    total_fee: amount,           // 金额（元），虎皮椒以分为单位时需 ×100
    title: `宿舍智能家居-${planName}`,  // 商品名称
    time: Math.floor(Date.now() / 1000).toString(),
    nonce_str: Math.random().toString(36).substring(2),
    notify_url: HUPIJIAO_CONFIG.notify_url,
    return_url: HUPIJIAO_CONFIG.return_url,
    // type: 'wechat',  // 如需指定微信支付
    // type: 'alipay',  // 如需指定支付宝
  };

  // 生成签名
  params.sign = generateSign(params, HUPIJIAO_CONFIG.appsecret);

  // 保存订单到内存
  orders.set(orderNo, {
    orderNo,
    amount,
    planName,
    userId: userId || 'default',
    status: 'pending',
    createdAt: new Date(),
  });

  try {
    // 调用虎皮椒支付接口
    const response = await axios.post(HUPIJIAO_CONFIG.pay_url, null, {
      params,
    });

    const data = response.data;

    if (data.errcode === 0) {
      // 支付成功，获取支付链接或二维码
      res.json({
        success: true,
        orderNo,
        payUrl: data.payurl,        // H5 支付链接
        qrcode: data.qrcode,        // 扫码支付二维码（Base64）
        hash: data.hash,            // 支付凭据
      });
    } else {
      // 虎皮椒返回错误
      console.error('虎皮椒错误:', data);
      res.status(400).json({
        success: false,
        error: data.errmsg || '支付创建失败',
      });
    }
  } catch (error) {
    console.error('请求虎皮椒失败:', error.message);
    res.status(500).json({
      success: false,
      error: '支付服务暂不可用，请稍后重试',
    });
  }
});

// ============ 支付回调通知（虎皮椒通知你）============
app.post('/api/notify', (req, res) => {
  const params = req.body;

  console.log('收到虎皮椒回调:', params);

  // 1. 验证签名
  if (!verifySign(params)) {
    console.error('签名验证失败');
    return res.status(400).send('FAIL');
  }

  // 2. 检查订单状态
  const order = orders.get(params.trade_order_id);
  if (!order) {
    console.error('订单不存在:', params.trade_order_id);
    return res.status(400).send('FAIL');
  }

  // 3. 检查金额是否匹配（防篡改）
  if (parseFloat(params.total_fee) !== order.amount) {
    console.error('金额不匹配:', params.total_fee, order.amount);
    return res.status(400).send('FAIL');
  }

  // 4. 检查是否已处理（防止重复）
  if (order.status === 'paid') {
    return res.send('SUCCESS');
  }

  // 5. 标记订单已支付（在这里真正给用户充值电费）
  order.status = 'paid';
  order.paidAt = new Date();
  order.transactionId = params.transaction_id; // 虎皮椒交易号

  console.log('✅ 订单支付成功:', order);

  // TODO: 在这里调用你的电费充值逻辑
  // await rechargeElectricity(order.userId, order.amount);

  // 6. 告诉虎皮椒收到了
  res.send('SUCCESS');
});

// ============ 查询订单状态 ============
app.get('/api/order/:orderNo', (req, res) => {
  const { orderNo } = req.params;
  const order = orders.get(orderNo);

  if (!order) {
    return res.status(404).json({ error: '订单不存在' });
  }

  res.json({
    orderNo: order.orderNo,
    amount: order.amount,
    status: order.status,
    paidAt: order.paidAt,
  });
});

// ============ 订单列表（管理后台用）============
app.get('/api/orders', (req, res) => {
  const allOrders = Array.from(orders.values()).sort(
    (a, b) => b.createdAt - a.createdAt
  );
  res.json({ total: allOrders.length, orders: allOrders });
});

// ============ 健康检查 ============
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      appid: HUPIJIAO_CONFIG.appid !== 'YOUR_APP_ID_HERE' ? '已配置' : '未配置',
      notify_url: HUPIJIAO_CONFIG.notify_url,
    },
  });
});

// ============ 启动服务 ============
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════╗
║     宿舍智能家居 - 支付服务已启动          ║
╠════════════════════════════════════════════╣
║  本地访问: http://localhost:${PORT}              ║
║  健康检查: http://localhost:${PORT}/api/health   ║
║  订单管理: http://localhost:${PORT}/api/orders   ║
╚════════════════════════════════════════════╝

⚠️  配置提醒：
   请在 server.js 中填写你的虎皮椒 APP_ID 和 APP_SECRET

  虎皮椒注册地址：https://admin.xunhupay.com
  `);
});
