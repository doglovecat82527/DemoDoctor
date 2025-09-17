const https = require('https');
const http = require('http');

// 测试API调用
function testAPICall() {
  console.log('=== 测试诊断API调用 ===\n');
  
  const userInput = "患者女性，45岁，主诉：情绪低落2个月，经常叹气，胸胁胀满，乳房胀痛，月经前症状加重，睡眠质量差，多梦，食欲减退，舌淡红苔薄白，脉弦细。";
  
  const postData = JSON.stringify({
    input: userInput,
    language: 'zh'
  });
  
  // 尝试API路径（根据vite.config.ts代理配置）
  const localOptions = {
    hostname: 'localhost',
    port: 5173,
    path: '/api/diagnosis',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  console.log('🔍 测试本地API调用...');
  console.log('URL:', `http://localhost:5173/api/diagnosis`);
  console.log('注意: 根据vite.config.ts，/api请求会被代理到localhost:3002');
  console.log('输入:', userInput);
  console.log('\n');
  
  const req = http.request(localOptions, (res) => {
    console.log(`📊 响应状态码: ${res.statusCode}`);
    console.log(`📊 响应头:`, res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n=== API响应内容 ===');
      try {
        const response = JSON.parse(data);
        console.log('✅ JSON解析成功');
        console.log('响应数据:');
        console.log(JSON.stringify(response, null, 2));
        
        // 检查是否返回了完整报告
        if (response.report && response.report.zh) {
          console.log('\n✅ 返回了完整的中文报告');
          console.log('报告预览:', response.report.zh.substring(0, 200) + '...');
        } else if (response.suggestions) {
          console.log('\n❌ 只返回了通用建议，没有完整报告');
          console.log('建议内容:', response.suggestions);
        } else {
          console.log('\n❓ 响应格式异常');
        }
        
      } catch (error) {
        console.log('❌ JSON解析失败:', error.message);
        console.log('原始响应:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ API调用失败:', error.message);
    console.log('\n可能的原因:');
    console.log('1. 开发服务器未启动');
    console.log('2. API路径不正确');
    console.log('3. 网络连接问题');
    console.log('\n请确保运行了 npm run dev 启动开发服务器');
  });
  
  req.write(postData);
  req.end();
}

// 运行测试
testAPICall();