// 测试当前Netlify Functions部署状态

// 测试函数
async function testNetlifyFunction(url, data) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(30000) // 30秒超时
    });
    
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = await response.text();
    }
    
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData
    };
  } catch (error) {
    throw error;
  }
}

// 主测试函数
async function runTests() {
  console.log('🧪 开始测试Netlify Functions...');
  
  const baseUrl = 'https://clinquant-puppy-e0cc59.netlify.app/.netlify/functions';
  
  // 测试1: Hello函数
  console.log('\n1️⃣ 测试Hello函数...');
  try {
    const helloResponse = await fetch(`${baseUrl}/hello`);
    console.log('Hello函数状态码:', helloResponse.status);
    const helloData = await helloResponse.text();
    console.log('✅ Hello函数响应:', helloData);
  } catch (error) {
    console.log('❌ Hello函数错误:', error.message);
  }
  
  // 测试2: 诊断函数 - 简单测试
  console.log('\n2️⃣ 测试诊断函数 - 简单输入...');
  try {
    const result = await testNetlifyFunction(`${baseUrl}/diagnosis`, {
      input: '头痛，发热，咳嗽',
      language: 'zh'
    });
    
    if (result.statusCode !== 200) {
      console.log(`❌ 诊断函数HTTP错误: ${result.statusCode}`);
      return;
    }
    
    console.log('✅ 诊断函数响应状态:', result.statusCode);
    console.log('📄 响应数据:', JSON.stringify(result.data, null, 2));
  } catch (error) {
    console.log('❌ 诊断函数错误:', error.message);
  }
  
  // 测试3: 诊断函数 - 预设数据测试
  console.log('\n3️⃣ 测试诊断函数 - 预设数据...');
  try {
    const result = await testNetlifyFunction(`${baseUrl}/diagnosis`, {
      input: '反复感冒，咳嗽不愈，痰白质稀，怕冷，手足不温，容易出汗，食欲不振，大便偏溏，舌淡胖有齿痕，苔白滑，脉沉细',
      language: 'zh'
    });
    
    if (result.statusCode !== 200) {
      console.log(`❌ 预设数据测试HTTP错误: ${result.statusCode}`);
      return;
    }
    
    console.log('✅ 预设数据响应状态:', result.statusCode);
    console.log('📄 响应数据:', JSON.stringify(result.data, null, 2));
  } catch (error) {
    console.log('❌ 预设数据测试错误:', error.message);
  }
  
  // 测试4: 错误处理
  console.log('\n4️⃣ 测试错误处理...');
  try {
    const result = await testNetlifyFunction(`${baseUrl}/diagnosis`, {
      input: '',
      language: 'zh'
    });
    
    if (result.statusCode !== 200) {
      console.log(`❌ 错误处理HTTP错误: ${result.statusCode}`);
      return;
    }
    
    console.log('✅ 错误处理响应状态:', result.statusCode);
    console.log('📄 错误响应:', JSON.stringify(result.data, null, 2));
  } catch (error) {
    console.log('❌ 错误处理测试失败:', error.message);
  }
  
  console.log('\n🏁 测试完成!');
}

// 运行测试
runTests().catch(console.error);