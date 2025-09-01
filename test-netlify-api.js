// 测试Netlify Functions API响应格式
import https from 'https';
import http from 'http';

const NETLIFY_URL = 'https://clinquant-puppy-e0cc59.netlify.app';

// 测试API调用函数
function testAPI(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Test-Script/1.0'
      },
      timeout: 30000 // 30秒超时
    };

    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonResponse,
            rawData: responseData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: responseData,
            parseError: error.message
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.write(postData);
    req.end();
  });
}

// 测试用例
const testCases = [
  {
    name: '测试预设数据匹配 - 失眠症状',
    data: {
      input: '我最近失眠多梦，口干舌燥，脾气很大',
      language: 'zh'
    },
    expectedPreset: true
  },
  {
    name: '测试预设数据匹配 - 胃痛症状',
    data: {
      input: '胃痛胃胀，吃不下饭，食欲不振',
      language: 'zh'
    },
    expectedPreset: true
  },
  {
    name: '测试非预设症状',
    data: {
      input: '我感觉很奇怪的症状，从来没有遇到过',
      language: 'zh'
    },
    expectedPreset: false
  }
];

async function runTests() {
  console.log('🧪 开始测试Netlify Functions API');
  console.log('测试URL:', NETLIFY_URL + '/.netlify/functions/diagnosis');
  console.log('=' .repeat(60));
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📋 测试 ${i + 1}/${totalTests}: ${testCase.name}`);
    console.log('-'.repeat(40));
    console.log('请求数据:', JSON.stringify(testCase.data, null, 2));
    
    try {
      const startTime = Date.now();
      const response = await testAPI(NETLIFY_URL + '/.netlify/functions/diagnosis', testCase.data);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('响应时间:', duration + 'ms');
      console.log('状态码:', response.statusCode);
      console.log('Content-Type:', response.headers['content-type']);
      
      if (response.statusCode === 200) {
        if (response.data) {
          console.log('✅ API调用成功');
          console.log('响应数据结构:');
          console.log('- success:', response.data.success);
          console.log('- message:', response.data.message ? response.data.message.substring(0, 50) + '...' : 'N/A');
          console.log('- diagnosis:', response.data.diagnosis ? '存在' : '不存在');
          console.log('- isPreset:', response.data.isPreset);
          
          if (response.data.diagnosis) {
            const diagnosis = response.data.diagnosis;
            console.log('诊断报告结构:');
            console.log('- 四诊信息:', diagnosis.四诊信息 ? '存在' : '不存在');
            console.log('- 特征分析与辨证:', diagnosis.特征分析与辨证 ? '存在' : '不存在');
            console.log('- 诊断结论:', diagnosis.诊断结论 ? '存在' : '不存在');
            console.log('- 治疗方案:', diagnosis.治疗方案 ? '存在' : '不存在');
            console.log('- 生活调养建议:', diagnosis.生活调养建议 ? '存在' : '不存在');
          }
          
          // 检查是否符合预期
          if (testCase.expectedPreset && response.data.isPreset) {
            console.log('✅ 预设数据匹配符合预期');
            passedTests++;
          } else if (!testCase.expectedPreset && !response.data.isPreset) {
            console.log('✅ 非预设数据处理符合预期');
            passedTests++;
          } else {
            console.log('❌ 预设数据匹配不符合预期');
            console.log('期望isPreset:', testCase.expectedPreset);
            console.log('实际isPreset:', response.data.isPreset);
          }
        } else {
          console.log('❌ 响应数据解析失败');
          console.log('解析错误:', response.parseError);
          console.log('原始响应:', response.rawData.substring(0, 200) + '...');
        }
      } else {
        console.log('❌ API调用失败');
        console.log('状态码:', response.statusCode);
        console.log('响应内容:', response.rawData.substring(0, 200) + '...');
      }
      
    } catch (error) {
      console.log('❌ 请求异常:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 测试完成');
  console.log(`✅ 通过: ${passedTests}/${totalTests}`);
  console.log(`❌ 失败: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试都通过了！Netlify Functions API工作正常。');
  } else {
    console.log('⚠️  有测试失败，请检查Netlify Functions配置。');
  }
}

// 运行测试
runTests().catch(console.error);