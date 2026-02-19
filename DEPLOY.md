# 二手商品网站 - 部署指南

## 架构
- **前端**: GitHub Pages / Vercel (免费)
- **后端**: Vercel Serverless Functions (免费)
- **数据库**: MongoDB Atlas (免费 512MB)

---

## 第一步：创建 MongoDB Atlas 数据库

1. 访问 https://www.mongodb.com/cloud/atlas/register
2. 注册/登录账号
3. 创建新集群 (选择 FREE Shared Cluster)
4. 选择区域 (建议选 AWS / Asia Pacific - Mumbai 或 Singapore，离中国近)
5. 等待集群创建完成

### 设置数据库访问
1. 点击左侧 "Database Access"
2. 点击 "Add New Database User"
3. 输入用户名和密码 (记录下来！)
4. 权限选择 "Read and write to any database"
5. 点击 "Add User"

### 设置网络访问
1. 点击左侧 "Network Access"
2. 点击 "Add IP Address"
3. 点击 "Allow Access from Anywhere" (0.0.0.0/0)
4. 点击 "Confirm"

### 获取连接字符串
1. 回到 "Database" 页面
2. 点击 "Connect" 按钮
3. 选择 "Drivers"
4. 选择 "Node.js"
5. 复制连接字符串，类似：
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
6. 将 `username` 和 `password` 替换为你刚才创建的用户名和密码
7. 在末尾添加数据库名 `secondhand`，变成：
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/secondhand?retryWrites=true&w=majority&appName=Cluster0
   ```

---

## 第二步：部署到 Vercel

### 安装 Vercel CLI
```bash
npm i -g vercel
```

### 登录 Vercel
```bash
vercel login
```
按提示完成登录。

### 部署
```bash
cd /Users/john/.openclaw/workspace/demo
vercel --prod
```

按提示操作：
- Set up "~/secondhand-shop"? [Y/n] → 输入 Y
- Link to existing project? [y/N] → 输入 N
- What's your project name? [secondhand-shop] → 回车
- In which directory is your code located? [./] → 回车

### 设置环境变量
部署完成后，设置 MongoDB 连接字符串：

```bash
vercel env add MONGODB_URI
```
- 粘贴你的 MongoDB 连接字符串
- 选择 Production 环境

重新部署：
```bash
vercel --prod
```

---

## 第三步：配置 GitHub Pages (可选)

如果不想用 Vercel 托管前端，可以继续用 GitHub Pages：

1. 修改 `index.html` 中的 API_BASE：
   ```javascript
   const API_BASE = 'https://你的vercel域名/api';
   ```

2. 推送到 GitHub：
   ```bash
   git add .
   git commit -m "Update API endpoint"
   git push
   ```

---

## 完成！

部署完成后，你会得到两个 URL：
- **Vercel 完整版**: `https://secondhand-shop-xxxxx.vercel.app`
- **GitHub Pages 前端**: `https://deigobyte.github.io/secondhand-shop` (如果用的话)

数据现在会保存在 MongoDB 云端，换手机、刷新都不会丢！

---

## 成本

全部免费！
- Vercel: 免费版 (每月 100GB 流量)
- MongoDB Atlas: 免费版 (512MB 存储)

对于个人二手商品展示完全够用。
