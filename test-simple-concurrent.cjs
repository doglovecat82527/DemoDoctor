// 简单并发测试 - 测试2-3人同时访问
require('dotenv').config();
const diagnosisHandler = require('./netlify/functions/diagnosis.js');

// 模拟Netlify Functions环境
function createMockEvent(input, language = 'zh') {
  return {
    httpMethod: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ input, language })
  };
}

// 模拟context
const mockContext = {};

// 测试用例
const testCases = [
  { input: '头痛发热咳嗽', description: '用户A - 感冒症状' },
  { input: '胃痛腹胀消化不良', description: '用户B - 消化问题' },
  { input: '失眠多梦心烦', description: '用户C - 睡眠问题' }
];

// 执行单个请求
async function executeRequest(testCase, requestId) {
  const startTime = Date.now();
  console.log(`🚀 ${requestId}: 开始处理 "${testCase.description}"`);
  
  try {
    const event = createMockEvent(testCase.input);
    const result = await diagnosisHandler.handler(event, mockContext);
    const duration = Date.now() - startTime;
    
    // 解析响应
    let response;
    try {
      response = JSON.parse(result.body);
    } catch (e) {
      response = { error: 'Invalid JSON response' };
    }
    
    // 判断成功
    const success = result.statusCode === 200 && response.success && response.data && response.data.report;
    
    if (success) {
      console.log(`✅ ${requestId}: 成功 (${duration}ms) - 来源: ${response.data.source}`);
      return { success: true, duration, source: response.data.source };
    } else {
      console.log(`❌ ${requestId}: 失败 (${duration}ms) - 错误: ${response.error || 'Unknown'}`);
      return { success: false, duration, error: response.error || 'Unknown' };
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ ${requestId}: 异常 (${duration}ms) - ${error.message}`);
    return { success: false, duration, error: error.message };
  }
}

// 主测试函数
async function runConcurrentTest() {
  console.log('🧪 开始简单并发测试 (2-3人同时访问)');
  console.log('=' .repeat(50));
  
  const startTime = Date.now();
  
  // 并发执行所有请求
  const promises = testCases.map((testCase, index) => 
    executeRequest(testCase, `用户${String.fromCharCode(65 + index)}`)
  );
  
  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  
  // 统计结果
  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;
  const successRate = (successCount / results.length * 100).toFixed(1);
  const avgDuration = Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length);
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 测试结果统计');
  console.log('=' .repeat(50));
  console.log(`总请求数: ${results.length}`);
  console.log(`成功请求: ${successCount}`);
  console.log(`失败请求: ${failCount}`);
  console.log(`成功率: ${successRate}%`);
  console.log(`平均响应时间: ${avgDuration}ms`);
  console.log(`总耗时: ${totalTime}ms`);
  
  // 详细结果
  console.log('\n📋 详细结果:');
  results.forEach((result, index) => {
    const testCase = testCases[index];
    const status = result.success ? '✅ 成功' : '❌ 失败';
    const source = result.source ? ` (${result.source})` : '';
    const error = result.error ? ` - ${result.error}` : '';
    console.log(`  用户${String.fromCharCode(65 + index)}: ${status} - ${result.duration}ms${source}${error}`);
  });
  
  // 并发安全性评估
  console.log('\n🔒 并发安全性评估:');
  if (successRate >= 90) {
    console.log('✅ 并发处理稳定，支持2-3人同时访问');
  } else if (successRate >= 70) {
    console.log('⚠️  并发处理基本稳定，但有改进空间');
  } else {
    console.log('❌ 并发处理不稳定，需要优化');
  }
  
  // 性能评估
  console.log('\n🎯 性能评估:');
  if (avgDuration <= 5000) {
    console.log('✅ 响应时间良好 (≤5s)');
  } else if (avgDuration <= 10000) {
    console.log('⚠️  响应时间一般 (5-10s)');
  } else {
    console.log('❌ 响应时间过慢 (>10s)');
  }
  
  console.log('\n🏁 简单并发测试完成!');
}

// 运行测试
runConcurrentTest().catch(console.error);