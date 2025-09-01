// 测试用户提供的具体症状描述

async function testUserSymptoms() {
  console.log('🩺 测试用户症状描述...');
  
  const userSymptoms = '患者女性，28岁，主诉：反复感冒3个月，每次感冒后咳嗽持续不愈，痰白质稀，怕冷，手足不温，容易出汗，食欲不振，大便偏溏，舌淡胖有齿痕，苔白滑，脉沉细。';
  
  const testData = {
    input: userSymptoms,
    language: 'zh'
  };
  
  try {
    console.log('📝 发送症状描述:', userSymptoms);
    console.log('\n🔄 正在调用诊断API...');
    
    const response = await fetch('https://clinquant-puppy-e0cc59.netlify.app/.netlify/functions/diagnosis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData),
      signal: AbortSignal.timeout(30000)
    });
    
    console.log('📊 响应状态码:', response.status);
    
    if (!response.ok) {
      console.log('❌ HTTP错误:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('错误详情:', errorText);
      return;
    }
    
    const result = await response.json();
    
    console.log('\n✅ 诊断成功!');
    console.log('📋 响应数据结构:');
    console.log('- success:', result.success);
    console.log('- source:', result.data?.source);
    console.log('- timestamp:', result.data?.timestamp);
    
    console.log('\n📄 中医诊断报告:');
    console.log('=' .repeat(80));
    console.log(result.data?.report || '无报告内容');
    console.log('=' .repeat(80));
    
    // 验证报告内容
    const report = result.data?.report || '';
    const hasChineseMedicine = report.includes('中医') || report.includes('诊断') || report.includes('治疗');
    const hasSymptomAnalysis = report.includes('症状') || report.includes('分析');
    const hasRecommendation = report.includes('建议') || report.includes('方案');
    
    console.log('\n🔍 报告质量检查:');
    console.log('- 包含中医内容:', hasChineseMedicine ? '✅' : '❌');
    console.log('- 包含症状分析:', hasSymptomAnalysis ? '✅' : '❌');
    console.log('- 包含治疗建议:', hasRecommendation ? '✅' : '❌');
    console.log('- 报告长度:', report.length, '字符');
    
    if (result.data?.source === 'preset') {
      console.log('\n🎯 匹配结果: 成功匹配预设数据');
    } else if (result.data?.source === 'api') {
      console.log('\n🤖 匹配结果: 使用AI生成诊断');
    } else {
      console.log('\n⚠️  匹配结果: 使用默认响应');
    }
    
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
    console.log('错误详情:', error);
  }
}

// 运行测试
console.log('🚀 开始测试Netlify诊断服务...');
console.log('🌐 目标网站: https://clinquant-puppy-e0cc59.netlify.app/');
console.log('');

testUserSymptoms().then(() => {
  console.log('\n🏁 测试完成!');
}).catch(console.error);