const http = require('http');
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// 加载环境变量
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key] = valueParts.join('=');
        }
      }
    });
  }
}

// 加载环境变量
loadEnvFile();

// 导入修复后的诊断函数
const diagnosisHandler = require('./netlify/functions/diagnosis.js');

// 模拟Netlify Functions环境
function createMockEvent(input, language = 'zh') {
  return {
    httpMethod: 'POST',
    headers: {
      'content-type': 'application/json',
      'origin': 'http://localhost:3000'
    },
    body: JSON.stringify({ input, language }),
    queryStringParameters: null,
    path: '/.netlify/functions/diagnosis',
    isBase64Encoded: false
  };
}

function createMockContext() {
  return {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'diagnosis',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:diagnosis',
    memoryLimitInMB: '128',
    awsRequestId: Math.random().toString(36).substring(7),
    logGroupName: '/aws/lambda/diagnosis',
    logStreamName: '2024/01/01/[$LATEST]' + Math.random().toString(36).substring(7),
    getRemainingTimeInMillis: () => 30000
  };
}

// 测试用例
const testCases = [
  { input: '头痛发热咳嗽', language: 'zh', name: '简单症状' },
  { input: '胸痛呼吸困难心悸出汗恶心', language: 'zh', name: '复杂症状' },
  { input: 'headache fever cough', language: 'en', name: '英文症状' },
  { input: '腹痛腹泻', language: 'zh', name: '消化症状' },
  { input: '失眠焦虑', language: 'zh', name: '精神症状' }
];

// 并发测试函数
async function runConcurrentTest() {
  console.log('🚀 开始本地并发测试...');
  console.log('=' .repeat(60));
  
  const concurrentRequests = 5;
  const rounds = 3;
  const results = [];
  
  for (let round = 1; round <= rounds; round++) {
    console.log(`\n📋 第 ${round} 轮测试 (${concurrentRequests} 个并发请求)`);
    console.log('-'.repeat(40));
    
    const promises = [];
    const startTime = performance.now();
    
    // 创建并发请求
    for (let i = 0; i < concurrentRequests; i++) {
      const testCase = testCases[i % testCases.length];
      const requestId = `R${round}-${i + 1}`;
      
      const promise = (async () => {
        const requestStart = performance.now();
        try {
          const event = createMockEvent(testCase.input, testCase.language);
          const context = createMockContext();
          
          console.log(`⏳ ${requestId}: 开始处理 "${testCase.name}"`);
          
          const result = await diagnosisHandler.handler(event, context);
          const requestTime = performance.now() - requestStart;
          
          const response = JSON.parse(result.body);
          const success = result.statusCode === 200 && response.diagnosis;
          
          console.log(`${success ? '✅' : '❌'} ${requestId}: ${success ? '成功' : '失败'} (${requestTime.toFixed(0)}ms)${success && response.source ? ' - 来源: ' + response.source : ''}`);
          if (!success) {
            console.log(`    错误详情: ${response.error || 'Unknown error'}`);
          }
          
          return {
            requestId,
            testCase: testCase.name,
            success,
            responseTime: requestTime,
            statusCode: result.statusCode,
            hasRequestId: !!response.requestId,
            diagnosisLength: response.diagnosis ? response.diagnosis.length : 0,
            error: success ? null : (response.error || 'Unknown error')
          };
        } catch (error) {
          const requestTime = performance.now() - requestStart;
          console.log(`❌ ${requestId}: 异常 (${requestTime.toFixed(0)}ms) - ${error.message}`);
           console.log(`    异常堆栈: ${error.stack}`);
          
          return {
            requestId,
            testCase: testCase.name,
            success: false,
            responseTime: requestTime,
            statusCode: 500,
            hasRequestId: false,
            diagnosisLength: 0,
            error: error.message
          };
        }
      })();
      
      promises.push(promise);
    }
    
    // 等待所有请求完成
    const roundResults = await Promise.all(promises);
    const roundTime = performance.now() - startTime;
    
    results.push(...roundResults);
    
    console.log(`\n⏱️  第 ${round} 轮总耗时: ${roundTime.toFixed(0)}ms`);
  }
  
  // 统计结果
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果统计');
  console.log('='.repeat(60));
  
  const totalRequests = results.length;
  const successfulRequests = results.filter(r => r.success).length;
  const failedRequests = totalRequests - successfulRequests;
  const successRate = (successfulRequests / totalRequests * 100).toFixed(1);
  
  const responseTimes = results.map(r => r.responseTime);
  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const minResponseTime = Math.min(...responseTimes);
  const maxResponseTime = Math.max(...responseTimes);
  
  // 计算百分位数
  const sortedTimes = responseTimes.sort((a, b) => a - b);
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
  const p90 = sortedTimes[Math.floor(sortedTimes.length * 0.9)];
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
  
  console.log(`总请求数: ${totalRequests}`);
  console.log(`成功请求: ${successfulRequests}`);
  console.log(`失败请求: ${failedRequests}`);
  console.log(`成功率: ${successRate}%`);
  console.log(`平均响应时间: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`最小响应时间: ${minResponseTime.toFixed(0)}ms`);
  console.log(`最大响应时间: ${maxResponseTime.toFixed(0)}ms`);
  console.log(`P50响应时间: ${p50.toFixed(0)}ms`);
  console.log(`P90响应时间: ${p90.toFixed(0)}ms`);
  console.log(`P95响应时间: ${p95.toFixed(0)}ms`);
  
  // 错误分析
  const errors = results.filter(r => !r.success);
  if (errors.length > 0) {
    console.log('\n❌ 错误详情:');
    errors.forEach(error => {
      console.log(`  - ${error.requestId}: ${error.error}`);
    });
  }
  
  // 并发安全性检查
  const requestIds = results.filter(r => r.hasRequestId).length;
  console.log(`\n🔒 并发安全性检查:`);
  console.log(`  - 请求ID生成: ${requestIds}/${totalRequests} (${(requestIds/totalRequests*100).toFixed(1)}%)`);
  
  // 性能评估
  console.log('\n🎯 性能评估:');
  if (successRate >= 95) {
    console.log('  ✅ 成功率优秀 (≥95%)');
  } else if (successRate >= 90) {
    console.log('  ⚠️  成功率良好 (90-95%)');
  } else {
    console.log('  ❌ 成功率需要改进 (<90%)');
  }
  
  if (avgResponseTime <= 2000) {
    console.log('  ✅ 响应时间优秀 (≤2s)');
  } else if (avgResponseTime <= 5000) {
    console.log('  ⚠️  响应时间可接受 (2-5s)');
  } else {
    console.log('  ❌ 响应时间过慢 (>5s)');
  }
  
  console.log('\n🏁 本地并发测试完成!');
  
  return {
    totalRequests,
    successfulRequests,
    successRate: parseFloat(successRate),
    avgResponseTime,
    concurrentSafe: requestIds === totalRequests
  };
}

// 运行测试
if (require.main === module) {
  runConcurrentTest().catch(console.error);
}

module.exports = { runConcurrentTest };