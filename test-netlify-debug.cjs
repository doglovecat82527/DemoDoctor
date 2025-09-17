// 测试Netlify Functions的匹配逻辑
const https = require('https');

const testData = {
  input: "患者女性，32岁，主诉：失眠多梦2周，伴口干舌燥，情绪烦躁易怒，夜间盗汗，入睡困难，多梦易醒，舌红苔薄黄，脉弦数。近期工作压力较大，精神紧张。",
  language: "zh"
};

const postData = JSON.stringify(testData);

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

console.log('发送请求到Netlify Functions...');
console.log('输入症状:', testData.input);
console.log('期望匹配到case_001 (失眠案例)');

const req = https.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('\n=== API响应 ===');
      console.log(JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        console.log('\n=== 分析结果 ===');
        console.log('数据源:', response.data.source);
        
        if (response.data.source === 'preset') {
          console.log('✅ 成功匹配到预设案例');
          console.log('匹配的案例ID:', response.data.caseId || '未知');
        } else if (response.data.source === 'fallback') {
          console.log('❌ 未匹配到预设案例，使用了fallback');
          console.log('原因: 关键词匹配失败或预设数据加载失败');
        } else if (response.data.source === 'api') {
          console.log('🔄 使用了Deepseek API生成');
        }
        
        // 检查报告内容
        if (response.data.report.includes('心肾不交') || response.data.report.includes('阴虚火旺')) {
          console.log('✅ 报告包含具体中医诊断');
        } else {
          console.log('❌ 报告只包含通用建议');
        }
      }
    } catch (error) {
      console.error('解析响应失败:', error.message);
      console.log('原始响应:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('请求失败:', error.message);
});

req.write(postData);
req.end();