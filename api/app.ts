import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import diagnosisRouter from './routes/diagnosis.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// 静态文件服务 - 提供data目录下的JSON文件
app.use('/api/data', express.static(path.join(__dirname, 'data')));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/auth', (req, res) => {
  res.json({ message: 'Auth endpoint' });
});

// 诊断接口
app.use('/api/diagnosis', diagnosisRouter);

// 报告下载接口
app.post('/api/download-report', (req, res) => {
  try {
    const { report, filename = 'tcm-diagnosis-report.md' } = req.body;
    
    if (!report) {
      return res.status(400).json({ error: '报告内容不能为空' });
    }

    // 设置响应头
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // 发送报告内容
    res.send(report);
  } catch (error) {
    console.error('下载报告失败:', error);
    res.status(500).json({ error: '下载失败' });
  }
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;