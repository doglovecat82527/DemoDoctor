const https = require('https');

// 测试生产环境诊断API
function testProductionAPI(input) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ input });
    
    const options = {
      hostname: 'clinquant-puppy-e0cc59.netlify.app',
      port: 443,
      path: '/.netlify/functions/diagnosis',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`状态码: ${res.statusCode}`);
        console.log(`响应头: ${JSON.stringify(res.headers, null, 2)}`);
        console.log(`原始响应: ${data.substring(0, 500)}...`);
        
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}. 原始响应: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 主测试函数
async function runProductionTests() {
  console.log('🚀 开始测试生产环境诊断API...');
  console.log('=' .repeat(60));
  
  const testCases = [
    '失眠多梦，心烦意乱',
    '胃痛胃胀，不想吃饭',
    '血糖很高，总是口渴',
    '血压升高，头晕头痛',
    '月经来了很疼，小腹痛'
  ];
  
  let successCount = 0;
  let totalTests = testCases.length;
  
  for (const testInput of testCases) {
    console.log(`\n🔍 测试症状: ${testInput}`);
    
    try {
      const result = await testProductionAPI(testInput);
      
      if (result && result.results && result.results.length > 0) {
        const topMatch = result.results[0];
        console.log(`✅ 成功获取诊断结果:`);
        console.log(`   - 诊断名称: ${topMatch.name}`);
        console.log(`   - 匹配分数: ${topMatch.matchScore}`);
        console.log(`   - 匹配关键词: ${topMatch.matchedKeywords ? topMatch.matchedKeywords.join(', ') : '无'}`);
        console.log(`   - 症状描述: ${topMatch.symptoms ? topMatch.symptoms.substring(0, 100) + '...' : '无'}`);
        successCount++;
      } else {
        console.log(`❌ API返回格式错误或无结果`);
        console.log(`   响应内容: ${JSON.stringify(result, null, 2)}`);
      }
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }
    
    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📈 生产环境测试总结:');
  console.log(`   总测试数: ${totalTests}`);
  console.log(`   成功数: ${successCount}`);
  console.log(`   失败数: ${totalTests - successCount}`);
  console.log(`   成功率: ${(successCount / totalTests * 100).toFixed(1)}%`);
  
  if (successCount === totalTests) {
    console.log('🎉 生产环境诊断API工作正常！');
  } else {
    console.log('⚠️  生产环境诊断API存在问题，需要修复！');
  }
  
  console.log('=' .repeat(60));
}

// 运行测试
runProductionTests().catch(console.error);