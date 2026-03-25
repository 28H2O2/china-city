# 部署指南

本项目基于 Next.js 16，配置了 `output: "export"`，构建产物是**纯静态文件**（HTML + JS + CSS + GeoJSON），无需 Node.js 服务器运行时，可部署到任何静态托管服务。

---

## 方式一：部署到 Vercel（推荐）

Vercel 是 Next.js 的官方托管平台，配置最简单，有免费额度，自动 HTTPS，自动 CDN。

### 前提条件

- GitHub 账号
- 项目已推送到 GitHub 仓库

### 步骤

**1. 推送代码到 GitHub**

```bash
cd China_city
git init
git add .
git commit -m "initial commit"
# 在 GitHub 上新建仓库，然后：
git remote add origin https://github.com/你的用户名/china-city.git
git push -u origin main
```

**2. 在 Vercel 导入项目**

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 账号登录
2. 点击 "Add New → Project"
3. 选择刚才推送的 GitHub 仓库，点击 "Import"
4. Vercel 会自动识别 Next.js，无需改任何配置
5. 点击 "Deploy"，等待约 1 分钟

部署完成后，Vercel 会分配一个 `*.vercel.app` 域名，例如 `china-city.vercel.app`。

**3. 绑定自定义域名（可选）**

1. 在项目页面进入 "Settings → Domains"
2. 输入你购买的域名，点击 "Add"
3. 按提示在域名商处添加 DNS 记录：
   - 根域名（如 `example.com`）：添加 `A` 记录，指向 Vercel 提供的 IP
   - 子域名（如 `www.example.com`）：添加 `CNAME` 记录，指向 `cname.vercel-dns.com`
4. DNS 生效（通常5~30分钟），HTTPS 证书自动签发

**4. 自动更新**

之后每次 `git push`，Vercel 自动重新构建部署，零运维。

---

## 方式二：部署到火山云服务器

适合需要完全自主控制的场景。本项目是纯静态文件，用 Nginx 托管即可。

### 第一步：购买域名

1. 打开[火山引擎域名服务](https://www.volcengine.com/product/domain)，或使用其他域名商（阿里云万网、腾讯云、Namecheap 等）
2. 搜索想要的域名，加入购物车，完成实名认证并购买
3. 在域名商控制台进入 **DNS 解析**，准备好后续添加记录

### 第二步：购买服务器

1. 打开[火山引擎云服务器（ECS）](https://www.volcengine.com/product/ecs)
2. 选择配置：本项目是静态文件，1核1GB 内存即可，操作系统选 **Ubuntu 22.04 LTS**
3. 购买完成后记录服务器的**公网 IP**

### 第三步：配置 DNS 解析

在域名商的 DNS 控制台添加以下记录（以 `example.com` 为例）：

| 记录类型 | 主机记录 | 记录值 |
|----------|----------|--------|
| A | `@` | 服务器公网 IP |
| A | `www` | 服务器公网 IP |

DNS 生效约需 5~30 分钟（可用 `ping example.com` 检查是否指向正确 IP）。

### 第四步：配置服务器环境

SSH 登录服务器：

```bash
ssh root@你的服务器IP
```

安装 Nginx 和 Certbot（用于 HTTPS）：

```bash
apt update && apt install -y nginx certbot python3-certbot-nginx
```

### 第五步：构建项目并上传

在**本地**构建静态文件：

```bash
cd China_city
npm run build
```

构建完成后，静态文件在 `out/` 目录。将其上传到服务器：

```bash
# 将 out/ 目录上传到服务器（替换为你的 IP 和域名）
scp -r out/* root@你的服务器IP:/var/www/china-city/
```

也可以在服务器上直接安装 Node.js 环境来构建（适合有 CI/CD 需求时）：

```bash
# 在服务器上克隆并构建（可选）
git clone https://github.com/你的用户名/china-city.git
cd china-city
npm install
npm run build
cp -r out/* /var/www/china-city/
```

### 第六步：配置 Nginx

创建站点配置文件：

```bash
nano /etc/nginx/sites-available/china-city
```

写入以下内容（替换为你的域名）：

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    root /var/www/china-city;
    index index.html;

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|json|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由：所有请求都返回 index.html（Next.js 静态导出不需要此配置，但无害）
    location / {
        try_files $uri $uri/ $uri.html =404;
    }
}
```

启用配置并重启 Nginx：

```bash
ln -s /etc/nginx/sites-available/china-city /etc/nginx/sites-enabled/
nginx -t          # 测试配置是否正确
systemctl reload nginx
```

### 第七步：申请 HTTPS 证书

```bash
certbot --nginx -d example.com -d www.example.com
```

按提示输入邮箱，同意条款，Certbot 会自动完成以下工作：
- 向 Let's Encrypt 申请免费 SSL 证书
- 修改 Nginx 配置以启用 HTTPS
- 设置证书自动续期（每90天）

完成后访问 `https://example.com`，即可看到站点。

### 后续更新

每次更新代码后，在本地构建并重新上传：

```bash
npm run build
scp -r out/* root@你的服务器IP:/var/www/china-city/
```

---

## 两种方式对比

| 对比项 | Vercel | 火山云自建 |
|--------|--------|------------|
| 配置难度 | 极低（点几下） | 中等（需熟悉 Linux/Nginx） |
| 费用 | 免费额度通常够用 | 服务器约 30~100 元/月 |
| HTTPS | 自动 | Certbot 自动，需手动配置 |
| 自定义域名 | 支持 | 支持 |
| 自主控制程度 | 低（依赖 Vercel 平台） | 高（完全自控） |
| 更新流程 | git push 即更新 | 需手动上传或配置 CI |
| 国内访问速度 | 一般（Vercel CDN 在海外） | 快（国内机房） |

**建议**：个人项目、快速验证用 Vercel；需要国内快速访问或有合规要求用自建服务器。
