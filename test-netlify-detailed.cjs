const https = require('https');
const http = require('http');

// 测试Netlify Functions的详细脚本
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Test-Script/1.0'
      },
      timeout: 30000 // 30秒超时
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: responseData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: responseData,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

async function testNetlifyFunction() {
  // 从命令行参数获取URL
  const netlifyUrl = process.argv[2];
  
  if (!netlifyUrl) {
    console.log('使用方法: node test-netlify-detailed.cjs <netlify-function-url>');
    console.log('例如: node test-netlify-detailed.cjs https://your-site.netlify.app/.netlify/functions/diagnosis');
    process.exit(1);
  }
  
  console.log('=== 测试Netlify Functions详细诊断 ===');
  console.log('目标URL:', netlifyUrl);
  console.log('测试时间:', new Date().toISOString());
  console.log('');
  
  const testCases = [
    {
      name: '测试1: 预设数据匹配 - 咽喉干痛',
      input: '咽喉干痛',
      language: 'zh'
    },
    {
      name: '测试2: 预设数据匹配 - 头痛发热',
      input: '头痛发热',
      language: 'zh'
    },
    {
      name: '测试3: 非预设数据 - 你能做什么',
      input: '你能做什么',
      language: 'zh'
    },
    {
      name: '测试4: 英文输入',
      input: 'What can you do?',
      language: 'en'
    },
    {
      name: '测试5: 空输入',
      input: '',
      language: 'zh'
    }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${testCase.name}`);
    console.log('=' .repeat(50));
    console.log('输入:', testCase.input);
    console.log('语言:', testCase.language);
    
    try {
      const startTime = Date.now();
      const response = await makeRequest(netlifyUrl, {
        input: testCase.input,
        language: testCase.language
      });
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('响应时间:', duration + 'ms');
      console.log('状态码:', response.statusCode);
      console.log('响应头:', JSON.stringify(response.headers, null, 2));
      
      if (response.data) {
        console.log('响应数据:');
        console.log(JSON.stringify(response.data, null, 2));
        
        if (response.data.data && response.data.data.report) {
          console.log('\n诊断报告预览:');
          console.log(response.data.data.report.substring(0, 200) + '...');
        }
      } else {
        console.log('原始响应:', response.rawData);
        if (response.parseError) {
          console.log('JSON解析错误:', response.parseError);
        }
      }
      
    } catch (error) {
      console.log('请求失败:', error.message);
      if (error.code) {
        console.log('错误代码:', error.code);
      }
    }
    
    // 在测试之间等待1秒
    if (i < testCases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n=== 测试完成 ===');
}

testNetlifyFunction().catch(console.error);