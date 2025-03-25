# Serv00 服务器状态监控

## 介绍
Serv00 服务器状态监控是一个基于 HTML、JavaScript 和 Cloudflare DNS 的轻量级服务器状态检测工具。它可以解析服务器域名的 IP 地址，并通过网络请求检测服务器是否在线。

## 功能特点
- **实时 DNS 解析**：使用 Cloudflare DNS-over-HTTPS 获取最新的服务器 IP。
- **状态检测**：通过 `fetch` 请求检测服务器是否在线。
- **自动更新**：定期刷新服务器状态，并在页面可见时恢复更新。
- **本地缓存**：DNS 解析结果缓存 1 小时，减少请求次数。
- **离线检测**：如果设备无网络连接，避免不必要的检测。

## 部署方式

### 1. 直接使用 GitHub Pages
1. Fork 本仓库。
2. 进入 GitHub 仓库 **Settings** → **Pages**，选择 `main` 分支并保存。
3. GitHub 会生成一个 `https://your-username.github.io/serv00-status/` 的访问链接。

### 2. 本地运行
1. 克隆仓库：
   ```bash
   git clone https://github.com/your-username/serv00-status.git
   ```
2. 进入项目目录：
   ```bash
   cd serv00-status
   ```
3. 直接用浏览器打开 `index.html`。

## 目录结构
```
/
├── index.html       # 主页面
├── script.js        # 主要的逻辑代码
├── style.css        # 页面样式
└── README.md        # 本文件
```

## 许可证
本项目采用 MIT 许可证，你可以自由使用、修改和分发。

