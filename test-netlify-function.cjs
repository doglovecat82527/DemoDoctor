const https = require('https');
const http = require('http');

// 测试Netlify Functions的诊断API
async function testNetlifyFunction() {
  console.log('开始测试Netlify Functions诊断API...');
  
  // 测试数据
  const testCases = [
    {
      name: '预设数据测试 - 咽喉干痛',
      data: {
        symptoms: '咽喉干痛，吞咽困难',
        language: 'zh'
      }
    },
    {
      name: '预设数据测试 - 头痛发热',
      data: {
        symptoms: '头痛，发热，乏力',
        language: 'zh'
      }
    },
    {
      name: 'API调用测试',
      data: {
        symptoms: '你能做什么',
        language: 'zh'
      }
    },
    {
      name: '英文测试',
      data: {
        symptoms: 'headache and fever',
        language: 'en'
      }
    }
  ];

  // 请用户提供实际的Netlify站点URL
  const netlifyUrl = process.argv[2] || 'https://your-site-name.netlify.app/.netlify/functions/diagnosis';
  
  if (netlifyUrl.includes('your-site-name')) {
    console.log('❌ 请提供实际的Netlify站点URL');
    console.log('使用方法: node test-netlify-function.js https://your-actual-site.netlify.app/.netlify/functions/diagnosis');
    process.exit(1);
  }
  
  console.log(`测试URL: ${netlifyUrl}\n`);

  for (const testCase of testCases) {
    console.log(`\n=== ${testCase.name} ===`);
    console.log('请求数据:', JSON.stringify(testCase.data, null, 2));
    
    try {
      const startTime = Date.now();
      const response = await makeRequest(netlifyUrl, testCase.data);
      const endTime = Date.now();
      
      console.log(`响应时间: ${endTime - startTime}ms`);
      console.log('响应状态:', response.statusCode);
      console.log('响应头:', JSON.stringify(response.headers, null, 2));
      console.log('响应数据:', response.data);
      
      // 解析响应数据
      try {
        const parsedData = JSON.parse(response.data);
        console.log('解析后的响应:', JSON.stringify(parsedData, null, 2));
        
        if (parsedData.error) {
          console.log('❌ 错误:', parsedData.error);
        } else if (parsedData.diagnosis) {
          console.log('✅ 诊断成功');
          console.log('诊断来源:', parsedData.source || '未知');
        }
      } catch (parseError) {
        console.log('❌ JSON解析失败:', parseError.message);
      }
      
    } catch (error) {
      console.log('❌ 请求失败:', error.message);
      if (error.code) {
        console.log('错误代码:', error.code);
      }
      if (error.response) {
        console.log('错误响应:', error.response);
      }
    }
    
    console.log('\n' + '='.repeat(50));
  }
}

// 发送HTTP请求的辅助函数
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Netlify-Function-Test/1.0'
      },
      timeout: 30000 // 30秒超时
    };

    const req = httpModule.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.write(postData);
    req.end();
  });
}

// 运行测试
if (require.main === module) {
  testNetlifyFunction().catch(console.error);
}

module.exports = { testNetlifyFunction };