// 并发测试脚本 - 测试Netlify Functions的并发处理能力

const NETLIFY_URL = 'https://demomedical.netlify.app/.netlify/functions/diagnosis';

// 测试数据
const testCases = [
  {
    name: '简单症状',
    input: '头痛，发热，咳嗽'
  },
  {
    name: '复杂症状',
    input: '最近一周感觉头晕目眩，伴有恶心呕吐，食欲不振，睡眠质量差，有时候心慌气短，手脚发凉，大便干燥，小便黄赤，舌苔厚腻，脉象细数。工作压力大，经常熬夜，饮食不规律。'
  },
  {
    name: '预设数据匹配',
    input: '感冒发烧头痛'
  },
  {
    name: '中等长度症状',
    input: '胃痛，腹胀，消化不良，经常打嗝，食后胃部不适'
  },
  {
    name: '简短症状',
    input: '失眠多梦'
  }
];

// 发送单个请求
async function sendRequest(testCase, requestId) {
  const startTime = Date.now();
  
  try {
    console.log(`[请求${requestId}] 开始测试: ${testCase.name}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
    
    const response = await fetch(NETLIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: testCase.input,
        language: 'zh'
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log(`[请求${requestId}] ✅ 成功 (${responseTime}ms)`);
    console.log(`[请求${requestId}] 响应类型: ${result.success ? '成功' : '失败'}`);
    
    if (result.success && result.data) {
      console.log(`[请求${requestId}] 诊断类型: ${result.data.diagnosis ? '完整诊断' : '简化诊断'}`);
    }
    
    return {
      requestId,
      testCase: testCase.name,
      success: true,
      responseTime,
      result
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`[请求${requestId}] ❌ 失败 (${responseTime}ms):`, error.message);
    
    return {
      requestId,
      testCase: testCase.name,
      success: false,
      responseTime,
      error: error.message
    };
  }
}

// 并发测试函数
async function runConcurrentTest(concurrency = 5, rounds = 3) {
  console.log(`\n🚀 开始并发测试: ${concurrency}个并发请求 x ${rounds}轮`);
  console.log('=' .repeat(60));
  
  const allResults = [];
  
  for (let round = 1; round <= rounds; round++) {
    console.log(`\n📍 第 ${round} 轮测试`);
    console.log('-'.repeat(40));
    
    const promises = [];
    
    // 创建并发请求
    for (let i = 0; i < concurrency; i++) {
      const testCase = testCases[i % testCases.length];
      const requestId = `R${round}-${i + 1}`;
      promises.push(sendRequest(testCase, requestId));
    }
    
    // 等待所有请求完成
    const roundResults = await Promise.all(promises);
    allResults.push(...roundResults);
    
    // 统计本轮结果
    const successful = roundResults.filter(r => r.success).length;
    const failed = roundResults.filter(r => !r.success).length;
    const avgResponseTime = roundResults.reduce((sum, r) => sum + r.responseTime, 0) / roundResults.length;
    
    console.log(`\n📊 第 ${round} 轮统计:`);
    console.log(`   成功: ${successful}/${concurrency}`);
    console.log(`   失败: ${failed}/${concurrency}`);
    console.log(`   平均响应时间: ${avgResponseTime.toFixed(0)}ms`);
    
    // 轮次间隔
    if (round < rounds) {
      console.log('\n⏳ 等待 2 秒后开始下一轮...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // 总体统计
  console.log('\n' + '='.repeat(60));
  console.log('📈 总体测试结果');
  console.log('='.repeat(60));
  
  const totalRequests = allResults.length;
  const totalSuccessful = allResults.filter(r => r.success).length;
  const totalFailed = allResults.filter(r => !r.success).length;
  const successRate = (totalSuccessful / totalRequests * 100).toFixed(1);
  const avgResponseTime = allResults.reduce((sum, r) => sum + r.responseTime, 0) / totalRequests;
  
  console.log(`总请求数: ${totalRequests}`);
  console.log(`成功请求: ${totalSuccessful}`);
  console.log(`失败请求: ${totalFailed}`);
  console.log(`成功率: ${successRate}%`);
  console.log(`平均响应时间: ${avgResponseTime.toFixed(0)}ms`);
  
  // 响应时间分布
  const responseTimes = allResults.map(r => r.responseTime).sort((a, b) => a - b);
  const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)];
  const p90 = responseTimes[Math.floor(responseTimes.length * 0.9)];
  const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
  
  console.log(`\n响应时间分布:`);
  console.log(`  P50: ${p50}ms`);
  console.log(`  P90: ${p90}ms`);
  console.log(`  P95: ${p95}ms`);
  console.log(`  最快: ${Math.min(...responseTimes)}ms`);
  console.log(`  最慢: ${Math.max(...responseTimes)}ms`);
  
  // 错误分析
  if (totalFailed > 0) {
    console.log(`\n❌ 错误分析:`);
    const errorTypes = {};
    allResults.filter(r => !r.success).forEach(r => {
      errorTypes[r.error] = (errorTypes[r.error] || 0) + 1;
    });
    
    Object.entries(errorTypes).forEach(([error, count]) => {
      console.log(`  ${error}: ${count}次`);
    });
  }
  
  console.log('\n✅ 并发测试完成!');
  
  return {
    totalRequests,
    successRate: parseFloat(successRate),
    avgResponseTime: Math.round(avgResponseTime),
    p95ResponseTime: p95
  };
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  // 可以通过命令行参数调整并发数和轮次
  const concurrency = parseInt(process.argv[2]) || 5;
  const rounds = parseInt(process.argv[3]) || 3;
  
  runConcurrentTest(concurrency, rounds)
    .then(summary => {
      console.log('\n🎯 测试建议:');
      if (summary.successRate >= 95) {
        console.log('✅ 并发处理能力良好，可以支持生产环境使用');
      } else if (summary.successRate >= 80) {
        console.log('⚠️  并发处理能力一般，建议优化或限制并发数');
      } else {
        console.log('❌ 并发处理能力较差，需要进一步优化');
      }
      
      if (summary.p95ResponseTime < 5000) {
        console.log('✅ 响应时间表现良好');
      } else {
        console.log('⚠️  响应时间较慢，建议优化性能');
      }
    })
    .catch(error => {
      console.error('测试执行失败:', error);
      process.exit(1);
    });
}

export { runConcurrentTest, sendRequest };