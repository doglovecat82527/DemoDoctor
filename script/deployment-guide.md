# AI中医诊断系统 - 配置部署文档

## 项目概述

本项目是一个基于React + Vite + TypeScript的AI中医诊断系统，集成了Deepseek API，支持多语言界面，包含AI诊断、在线配药、医生预约等完整功能模块。

## 开发环境配置

### 1. 系统要求
- Node.js v24.1.0 或更高版本
- npm 或 yarn 包管理器
- Git 版本控制
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 2. 项目初始化

```bash
# 克隆项目
git clone <your-repository-url>
cd DemoDoctor

# 安装依赖
npm install
# 或
yarn install
```

### 3. 环境变量配置

在项目根目录创建 `.env` 文件：

```env
# Deepseek API配置
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com

# 开发环境配置
VITE_API_BASE_URL=http://localhost:3001
VITE_NODE_ENV=development
```

**重要提示**：
- 请将 `your_deepseek_api_key_here` 替换为实际的API密钥
- 不要将 `.env` 文件提交到版本控制系统
- 确保 `.env` 已添加到 `.gitignore` 文件中

### 4. 本地开发启动

```bash
# 启动前端开发服务器
npm run dev
# 访问地址：http://localhost:5173

# 启动后端API服务器（如需要）
npm run server
# API地址：http://localhost:3001
```

## GitHub仓库配置

### 1. 初始化Git仓库

```bash
# 初始化Git仓库（如果还未初始化）
git init

# 添加远程仓库
git remote add origin https://github.com/your-username/your-repo-name.git
```

### 2. 代码提交和推送流程

```bash
# 检查文件状态
git status

# 添加所有更改
git add .

# 提交更改
git commit -m "feat: 添加新功能描述"

# 推送到远程仓库
git push origin main
```

### 3. 分支管理建议

```bash
# 创建功能分支
git checkout -b feature/new-feature

# 开发完成后合并到主分支
git checkout main
git merge feature/new-feature

# 删除功能分支
git branch -d feature/new-feature
```

## Vercel部署配置

### 1. Vercel项目设置

1. 访问 [Vercel官网](https://vercel.com)
2. 使用GitHub账号登录
3. 点击 "New Project" 导入GitHub仓库
4. 选择项目仓库并点击 "Import"

### 2. 构建配置

Vercel会自动检测Vite项目，默认配置：
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. 环境变量配置

在Vercel项目设置中添加环境变量：
1. 进入项目 → Settings → Environment Variables
2. 添加以下变量：
   - `VITE_DEEPSEEK_API_KEY`: 你的Deepseek API密钥
   - `VITE_DEEPSEEK_BASE_URL`: https://api.deepseek.com
   - `VITE_NODE_ENV`: production

### 4. 自定义域名（可选）

1. 在项目设置中点击 "Domains"
2. 添加自定义域名
3. 配置DNS记录指向Vercel

### 5. 自动部署

- 每次推送到 `main` 分支会自动触发部署
- 可在Vercel控制台查看部署状态和日志

## Netlify部署配置

### 1. Netlify项目设置

1. 访问 [Netlify官网](https://netlify.com)
2. 使用GitHub账号登录
3. 点击 "New site from Git"
4. 选择GitHub并授权
5. 选择项目仓库

### 2. 构建设置

在部署设置中配置：
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Production branch**: `main`

### 3. 配置文件

项目根目录的 `netlify.toml` 文件：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "24"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### 4. 客户端路由配置

在 `public/_redirects` 文件中：

```
/*    /index.html   200
```

### 5. 环境变量配置

在Netlify项目设置中：
1. 进入 Site settings → Environment variables
2. 添加环境变量（同Vercel配置）

### 6. Netlify Functions（API支持）

如需API支持，在 `netlify/functions/` 目录下创建函数文件：

```javascript
// netlify/functions/diagnosis.js
exports.handler = async (event, context) => {
  // API逻辑
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success' })
  };
};
```

## 环境变量管理

### 1. 开发环境
- 使用 `.env` 文件
- 变量以 `VITE_` 前缀开头
- 不要提交到版本控制

### 2. 生产环境
- Vercel: 在项目设置中配置
- Netlify: 在站点设置中配置
- 确保所有必需的环境变量都已设置

### 3. 环境变量清单

| 变量名 | 描述 | 必需 | 示例值 |
|--------|------|------|--------|
| VITE_DEEPSEEK_API_KEY | Deepseek API密钥 | 是 | sk-xxx... |
| VITE_DEEPSEEK_BASE_URL | API基础URL | 是 | https://api.deepseek.com |
| VITE_NODE_ENV | 环境标识 | 否 | production |

## 常见部署问题和解决方案

### 1. 构建失败

**问题**: 依赖安装失败
```bash
# 解决方案
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**问题**: TypeScript类型错误
```bash
# 解决方案
npm run type-check
# 修复类型错误后重新构建
```

### 2. 路由问题

**问题**: 刷新页面404错误
- **Vercel**: 确保 `vercel.json` 配置正确
- **Netlify**: 确保 `_redirects` 文件存在

### 3. API调用失败

**问题**: CORS错误
```javascript
// 解决方案：在API响应中添加CORS头
response.headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
```

### 4. 环境变量未生效

**检查清单**:
- [ ] 变量名以 `VITE_` 开头
- [ ] 在部署平台正确配置
- [ ] 重新部署项目
- [ ] 检查变量值是否正确

### 5. 静态资源加载失败

**解决方案**:
```javascript
// vite.config.ts
export default defineConfig({
  base: './', // 使用相对路径
  // 或指定具体的base路径
  // base: '/your-project-name/'
});
```

## 更新和维护流程

### 1. 代码更新流程

```bash
# 1. 本地开发和测试
npm run dev
npm run build
npm run preview

# 2. 代码质量检查
npm run lint
npm run type-check

# 3. 提交代码
git add .
git commit -m "feat: 新功能描述"
git push origin main

# 4. 自动部署触发
# Vercel和Netlify会自动检测到推送并开始部署
```

### 2. 依赖更新

```bash
# 检查过时的依赖
npm outdated

# 更新依赖
npm update

# 更新主要版本（谨慎操作）
npm install package-name@latest
```

### 3. 安全更新

```bash
# 检查安全漏洞
npm audit

# 自动修复
npm audit fix

# 手动修复高风险漏洞
npm audit fix --force
```

### 4. 性能监控

- 使用Vercel Analytics监控性能
- 定期检查Lighthouse评分
- 监控API响应时间
- 检查错误日志

### 5. 备份策略

- 定期备份代码到多个Git仓库
- 导出重要配置和环境变量
- 保存部署配置文档
- 记录重要的部署决策

## 多环境部署策略

### 1. 环境分类

- **开发环境** (Development): 本地开发
- **测试环境** (Staging): Vercel预览部署
- **生产环境** (Production): 正式部署

### 2. 分支策略

```
main (生产环境)
├── develop (开发环境)
├── staging (测试环境)
└── feature/* (功能分支)
```

### 3. 自动化部署

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '24'
      - run: npm install
      - run: npm run build
      - run: npm run test
```

## 故障排除指南

### 1. 部署失败排查步骤

1. 检查构建日志
2. 验证环境变量
3. 检查依赖版本兼容性
4. 验证配置文件语法
5. 检查网络连接

### 2. 性能问题排查

1. 分析bundle大小
2. 检查图片优化
3. 验证代码分割
4. 检查API响应时间
5. 分析渲染性能

### 3. 联系支持

- **Vercel支持**: https://vercel.com/support
- **Netlify支持**: https://netlify.com/support
- **项目Issues**: GitHub仓库Issues页面

---

**最后更新**: 2024年1月
**文档版本**: v1.0
**维护者**: 项目开发团队