# API配置安全指南

## 1. API密钥管理概述

本项目需要集成Deepseek API来实现智能诊断功能。API密钥是访问外部服务的重要凭证，必须采用最佳安全实践来保护这些敏感信息。

### 1.1 安全原则

- **最小权限原则**: 仅授予必要的API权限
- **环境隔离**: 开发、测试、生产环境使用不同密钥
- **定期轮换**: 定期更换API密钥
- **监控审计**: 监控API使用情况和异常访问
- **安全存储**: 使用环境变量而非硬编码

## 2. Deepseek API配置

### 2.1 获取API密钥

**步骤详解**:

1. **注册Deepseek账号**
   - 访问: https://platform.deepseek.com/
   - 使用邮箱注册账号
   - 完成邮箱验证

2. **实名认证**
   - 根据平台要求完成实名认证
   - 上传身份证明文件
   - 等待审核通过（通常1-2个工作日）

3. **创建API密钥**
   - 登录控制台
   - 进入"API管理"页面
   - 点击"创建新密钥"
   - 设置密钥名称（如：ai-medical-demo-prod）
   - 选择权限范围（推荐：仅聊天API权限）
   - 复制生成的密钥（格式：sk-xxxxxxxxxxxxxxxx）

4. **设置使用限额**
   - 设置每日调用限额
   - 设置每月费用限额
   - 配置异常使用告警

### 2.2 API密钥格式说明

```
密钥格式: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
长度: 32-64位字符
字符集: 字母数字组合
前缀: sk- (表示secret key)
```

**示例**:
```
sk-1234567890abcdef1234567890abcdef
```

### 2.3 API配置参数

| 参数名 | 描述 | 示例值 | 必需 |
|--------|------|--------|------|
| DEEPSEEK_API_KEY | API密钥 | sk-xxx... | 是 |
| DEEPSEEK_BASE_URL | API基础URL | https://api.deepseek.com | 是 |
| DEEPSEEK_MODEL | 使用的模型 | deepseek-chat | 是 |
| DEEPSEEK_MAX_TOKENS | 最大Token数 | 2000 | 否 |
| DEEPSEEK_TEMPERATURE | 生成温度 | 0.7 | 否 |
| DEEPSEEK_TIMEOUT | 请求超时时间(ms) | 30000 | 否 |

## 3. 环境变量安全配置

### 3.1 本地开发环境

**创建.env.local文件**:
```bash
# 在项目根目录创建.env.local文件
touch .env.local

# 编辑文件内容
echo "DEEPSEEK_API_KEY=sk-your-development-key-here" >> .env.local
echo "DEEPSEEK_BASE_URL=https://api.deepseek.com" >> .env.local
echo "DEEPSEEK_MODEL=deepseek-chat" >> .env.local
echo "DEEPSEEK_MAX_TOKENS=2000" >> .env.local
echo "NODE_ENV=development" >> .env.local
```

**安全检查清单**:
- [ ] .env.local已添加到.gitignore
- [ ] 文件权限设置为600（仅所有者可读写）
- [ ] 使用开发专用的API密钥
- [ ] 设置较低的API调用限额

### 3.2 生产环境配置

**Vercel环境变量配置**:

1. **通过Vercel Dashboard配置**:
   - 登录Vercel控制台
   - 选择项目
   - 进入Settings → Environment Variables
   - 添加以下变量：

   ```
   Name: DEEPSEEK_API_KEY
   Value: sk-your-production-key-here
   Environment: Production, Preview
   
   Name: DEEPSEEK_BASE_URL
   Value: https://api.deepseek.com
   Environment: Production, Preview
   
   Name: DEEPSEEK_MODEL
   Value: deepseek-chat
   Environment: Production, Preview
   
   Name: DEEPSEEK_MAX_TOKENS
   Value: 2000
   Environment: Production, Preview
   ```

2. **通过Vercel CLI配置**:
   ```bash
   # 安装Vercel CLI
   npm i -g vercel
   
   # 登录Vercel
   vercel login
   
   # 设置环境变量
   vercel env add DEEPSEEK_API_KEY production
   vercel env add DEEPSEEK_BASE_URL production
   vercel env add DEEPSEEK_MODEL production
   ```

### 3.3 环境变量验证

**在代码中验证环境变量**:
```typescript
// config/env.ts
interface EnvConfig {
  DEEPSEEK_API_KEY: string;
  DEEPSEEK_BASE_URL: string;
  DEEPSEEK_MODEL: string;
  DEEPSEEK_MAX_TOKENS: number;
  NODE_ENV: string;
}

function validateEnv(): EnvConfig {
  const requiredEnvs = [
    'DEEPSEEK_API_KEY',
    'DEEPSEEK_BASE_URL',
    'DEEPSEEK_MODEL'
  ];
  
  for (const env of requiredEnvs) {
    if (!process.env[env]) {
      throw new Error(`Missing required environment variable: ${env}`);
    }
  }
  
  return {
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY!,
    DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL!,
    DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL!,
    DEEPSEEK_MAX_TOKENS: parseInt(process.env.DEEPSEEK_MAX_TOKENS || '2000'),
    NODE_ENV: process.env.NODE_ENV || 'development'
  };
}

export const config = validateEnv();
```

## 4. API调用安全实现

### 4.1 安全的API客户端

```typescript
// services/deepseek.ts
import { config } from '../config/env';

class DeepseekClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  
  constructor() {
    this.apiKey = config.DEEPSEEK_API_KEY;
    this.baseUrl = config.DEEPSEEK_BASE_URL;
    this.timeout = 30000; // 30秒超时
  }
  
  async chat(messages: any[], options: any = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Medical-Demo/1.0'
        },
        body: JSON.stringify({
          model: config.DEEPSEEK_MODEL,
          messages,
          max_tokens: config.DEEPSEEK_MAX_TOKENS,
          temperature: 0.7,
          ...options
        }),
        signal: AbortSignal.timeout(this.timeout)
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Deepseek API error:', error);
      throw new Error('AI服务暂时不可用，请稍后重试');
    }
  }
}

export const deepseekClient = new DeepseekClient();
```

### 4.2 请求频率限制

```typescript
// middleware/rateLimit.ts
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private maxRequests: number;
  private windowMs: number;
  
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const clientId = this.getClientId(req);
      const now = Date.now();
      
      if (!this.store[clientId] || now > this.store[clientId].resetTime) {
        this.store[clientId] = {
          count: 1,
          resetTime: now + this.windowMs
        };
        return next();
      }
      
      if (this.store[clientId].count >= this.maxRequests) {
        return res.status(429).json({
          error: '请求过于频繁，请稍后重试',
          retryAfter: Math.ceil((this.store[clientId].resetTime - now) / 1000)
        });
      }
      
      this.store[clientId].count++;
      next();
    };
  }
  
  private getClientId(req: Request): string {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
}

export const rateLimiter = new RateLimiter();
```

### 4.3 输入验证和清理

```typescript
// utils/validation.ts
import DOMPurify from 'isomorphic-dompurify';

export function validateAndSanitizeInput(input: string): string {
  // 长度验证
  if (!input || input.trim().length === 0) {
    throw new Error('输入内容不能为空');
  }
  
  if (input.length > 2000) {
    throw new Error('输入内容过长，请控制在2000字符以内');
  }
  
  // 清理HTML标签和恶意脚本
  const sanitized = DOMPurify.sanitize(input.trim());
  
  // 过滤敏感词汇（可根据需要扩展）
  const sensitiveWords = ['<script>', 'javascript:', 'data:'];
  for (const word of sensitiveWords) {
    if (sanitized.toLowerCase().includes(word)) {
      throw new Error('输入内容包含不允许的字符');
    }
  }
  
  return sanitized;
}
```

## 5. 监控和审计

### 5.1 API使用监控

```typescript
// utils/monitoring.ts
interface APIUsageLog {
  timestamp: Date;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  tokenUsage?: number;
  error?: string;
}

class APIMonitor {
  private logs: APIUsageLog[] = [];
  
  logRequest(log: APIUsageLog) {
    this.logs.push(log);
    
    // 异常情况告警
    if (log.statusCode >= 400) {
      console.error('API请求异常:', log);
    }
    
    if (log.responseTime > 10000) {
      console.warn('API响应时间过长:', log);
    }
    
    // 定期清理日志（保留最近1000条）
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }
  
  getUsageStats() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const recentLogs = this.logs.filter(log => 
      now - log.timestamp.getTime() < oneHour
    );
    
    return {
      totalRequests: recentLogs.length,
      successRate: recentLogs.filter(log => log.statusCode < 400).length / recentLogs.length,
      averageResponseTime: recentLogs.reduce((sum, log) => sum + log.responseTime, 0) / recentLogs.length,
      totalTokenUsage: recentLogs.reduce((sum, log) => sum + (log.tokenUsage || 0), 0)
    };
  }
}

export const apiMonitor = new APIMonitor();
```

### 5.2 成本控制

```typescript
// utils/costControl.ts
class CostController {
  private dailyTokenLimit = 50000; // 每日Token限制
  private monthlyBudget = 100; // 每月预算（美元）
  private currentUsage = {
    dailyTokens: 0,
    monthlySpend: 0,
    lastResetDate: new Date().toDateString()
  };
  
  checkLimits(tokenCount: number): boolean {
    // 检查是否需要重置日计数
    const today = new Date().toDateString();
    if (today !== this.currentUsage.lastResetDate) {
      this.currentUsage.dailyTokens = 0;
      this.currentUsage.lastResetDate = today;
    }
    
    // 检查日限制
    if (this.currentUsage.dailyTokens + tokenCount > this.dailyTokenLimit) {
      console.warn('达到每日Token使用限制');
      return false;
    }
    
    // 估算成本（假设每1000 tokens = $0.002）
    const estimatedCost = (tokenCount / 1000) * 0.002;
    if (this.currentUsage.monthlySpend + estimatedCost > this.monthlyBudget) {
      console.warn('达到每月预算限制');
      return false;
    }
    
    return true;
  }
  
  recordUsage(tokenCount: number) {
    this.currentUsage.dailyTokens += tokenCount;
    this.currentUsage.monthlySpend += (tokenCount / 1000) * 0.002;
  }
}

export const costController = new CostController();
```

## 6. 安全检查清单

### 6.1 开发阶段检查

- [ ] API密钥未硬编码在源代码中
- [ ] .env文件已添加到.gitignore
- [ ] 使用开发专用API密钥
- [ ] 实现了输入验证和清理
- [ ] 添加了请求频率限制
- [ ] 设置了合理的超时时间
- [ ] 实现了错误处理机制

### 6.2 部署阶段检查

- [ ] 生产环境使用独立的API密钥
- [ ] 环境变量在Vercel中正确配置
- [ ] API密钥权限设置为最小必需
- [ ] 设置了API使用限额
- [ ] 启用了HTTPS强制重定向
- [ ] 配置了适当的CORS策略
- [ ] 实现了监控和日志记录

### 6.3 运维阶段检查

- [ ] 定期检查API使用统计
- [ ] 监控异常访问模式
- [ ] 定期轮换API密钥
- [ ] 审查访问日志
- [ ] 更新安全补丁
- [ ] 备份重要配置

## 7. 应急响应计划

### 7.1 API密钥泄露处理

**立即行动**:
1. 立即禁用泄露的API密钥
2. 生成新的API密钥
3. 更新所有环境的配置
4. 重新部署应用
5. 监控异常使用情况

**后续措施**:
1. 分析泄露原因
2. 加强安全措施
3. 通知相关人员
4. 更新安全流程

### 7.2 API服务中断处理

**降级策略**:
1. 启用预设数据匹配
2. 显示友好的错误提示
3. 记录失败请求
4. 通知用户稍后重试

**恢复流程**:
1. 检查API服务状态
2. 验证网络连接
3. 检查配置参数
4. 重试失败的请求

## 8. 最佳实践总结

### 8.1 密钥管理

- 使用环境变量存储敏感信息
- 不同环境使用不同密钥
- 定期轮换API密钥
- 设置合理的权限范围
- 监控使用情况和成本

### 8.2 代码安全

- 验证和清理所有输入
- 实现请求频率限制
- 使用HTTPS加密传输
- 处理错误时不暴露敏感信息
- 记录安全相关事件

### 8.3 运维安全

- 定期安全审计
- 监控异常访问
- 保持依赖库更新
- 备份重要配置
- 制定应急响应计划

---

**重要提醒**: API密钥是访问外部服务的重要凭证，请务必按照本指南的要求进行安全配置和管理。如有任何安全疑问，请及时咨询安全专家。