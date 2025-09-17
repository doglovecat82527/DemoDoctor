const http = require('http');

// 测试用例
const testCases = [
  {
    name: "用户提供的症状（应匹配case_008）",
    input: "患者女性，45岁，主诉：情绪低落2个月，经常叹气，胸胁胀满，乳房胀痛，月经前症状加重，睡眠质量差，多梦，食欲减退，舌淡红苔薄白，脉弦细。"
  },
  {
    name: "简单症状测试",
    input: "失眠多梦，口干舌燥，脾气大"
  }
];

function testAPI(testCase) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      input: testCase.input,
      language: 'zh'
    });

    const options = {
      hostname: 'localhost',
      port: 5173,
      path: '/api/diagnosis',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            response: response
          });
        } catch (error) {
          reject(new Error(`JSON解析失败: ${error.message}`));
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

async function runTests() {
  console.log('=== 最终API测试 ===\n');
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`🧪 测试 ${i + 1}: ${testCase.name}`);
    console.log(`输入: ${testCase.input.substring(0, 50)}...`);
    
    try {
      const result = await testAPI(testCase);
      console.log(`✅ 状态码: ${result.statusCode}`);
      
      if (result.response.success) {
        const report = result.response.data.report;
        const source = result.response.data.source;
        
        console.log(`📋 报告来源: ${source}`);
        console.log(`📝 报告长度: ${report.length} 字符`);
        
        if (source === 'preset') {
          console.log('🎯 成功匹配预设数据！');
        } else if (source === 'ai') {
          console.log('🤖 使用AI生成报告');
        }
        
        // 显示报告开头
        console.log(`📄 报告预览: ${report.substring(0, 100)}...`);
      } else {
        console.log('❌ API返回失败');
        console.log('错误信息:', result.response.error || '未知错误');
      }
    } catch (error) {
      console.log('❌ 请求失败:', error.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }
}

runTests().catch(console.error);