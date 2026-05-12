# 虎皮椒支付集成 - 使用指南

## 一、注册虎皮椒账号

1. 打开 **https://admin.xunhupay.com**
2. 点击「注册」→ 用手机号注册账号
3. 完成个人实名认证（上传身份证）
4. 审核通过后进入「应用管理」

## 二、获取 API 密钥

1. 进入虎皮椒后台 → 「应用管理」
2. 创建应用（或使用默认应用）
3. 复制 **APP_ID** 和 **APP_SECRET**
4. 在 `server.js` 中填写：
   ```javascript
   appid: '你的APP_ID',
   appsecret: '你的APP_SECRET',
   ```

## 三、启动后端服务

```bash
cd backend
npm install
npm run dev
```

服务启动后运行在 `http://localhost:3000`

## 四、配置回调地址（重要！）

回调地址 `notify_url` 必须让虎皮椒能访问到你的服务器。

### 开发阶段：用内网穿透

1. 下载 **ngrok**：https://ngrok.com/download
2. 注册账号获取 Authtoken
3. 运行：
   ```bash
   ngrok http 3000
   ```
4. 复制生成的 HTTPS 地址（如 `https://abc123.ngrok.io`）
5. 在 `server.js` 中修改：
   ```javascript
   notify_url: 'https://abc123.ngrok.io/api/notify',
   return_url: 'https://smartdorm-ten.vercel.app/recharge',
   ```
6. 在虎皮椒后台填写回调地址

### 正式上线后

将后端部署到云服务器（如阿里云、腾讯云学生机 ¥10/月），填写真实公网 IP 或域名即可。

## 五、测试支付

1. 启动前端：`npm run dev`
2. 启动后端：`npm run dev`（在 backend 目录）
3. 进入充值页面 → 选择套餐 → 点击「立即支付」
4. 如果后端未启动，会提示「无法连接支付服务」

## 六、查看订单

- 本地订单列表：http://localhost:3000/api/orders
- 订单状态查询：http://localhost:3000/api/order/:订单号

## 七、费率说明

| 支付方式 | 费率 | 到账时间 |
|---|---|---|
| 微信支付 | 0.6% | 即时 |
| 支付宝 | 0.8% | 即时 |

每笔 ¥1 起提，结算到账微信/支付宝余额。

## 八、注意事项

⚠️ **安全提醒**：
- APP_SECRET 切勿泄露给他人
- 回调接口必须验证签名防篡改
- 生产环境务必使用 HTTPS
- 金额计算在后端完成，不要相信前端数据
