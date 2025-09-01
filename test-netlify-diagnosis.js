/**
 * Netlify诊断服务测试脚本
 * 用于测试修复后的Netlify Functions是否正常工作
 */

const NETLIFY_FUNCTION_URL = 'https://demodoctorapp.netlify.app/.netlify/functions/diagnosis';

// 测试用例
const testCases = [
  {
    name: '预设数据测试 - 失眠多梦',
    input: '失眠多梦，口干舌燥，脾气大',
    expectedType: 'preset',
    expectedKeywords: ['失眠', '多梦', '口干']
  },
  {
    name: '预设数据测试 - 胃痛胃胀',
    input: '胃痛胃胀，食欲不振',
    expectedType: 'preset',
    expectedKeywords: ['胃痛', '胃胀']
  },
  {
    name: '预设数据测试 - 功能介绍',
    input: '你能做什么',
    expectedType: 'preset',
    expectedKeywords: ['功能', '能力']
  },
  {
    name: 'API调用测试 - 新症状',
    input: '头晕乏力，心慌气短，最近总是感觉很累',
    expectedType: 'api',
    expectedKeywords: []
  }
];

// 测试函数
async function testNetlifyDiagnosis() {
  console.log('🚀 开始测试Netlify诊断服务...');
  console.log('测试URL:', NETLIFY_FUNCTION_URL);
  console.log('=' * 60);

  let passedTests = 0;
  let totalTests = testCases.length;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📋 测试 ${i + 1}/${totalTests}: ${testCase.name}`);
    console.log(`输入: "${testCase.input}"`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(NETLIFY_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: testCase.input,
          language: 'zh'
        })
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`⏱️  响应时间: ${responseTime}ms`);
      console.log(`📊 HTTP状态: ${response.status}`);
      
      if (!response.ok) {
        console.log(`❌ HTTP错误: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`错误内容: ${errorText}`);
        continue;
      }
      
      const result = await response.json();
      
      // 检查响应结构
      if (!result.success) {
        console.log(`❌ 服务返回失败: ${result.error || '未知错误'}`);
        continue;
      }
      
      // 检查诊断报告
      if (!result.diagnosis || !result.diagnosis.report) {
        console.log(`❌ 缺少诊断报告数据`);
        continue;
      }
      
      // 验证预设数据匹配
      if (testCase.expectedType === 'preset') {
        if (result.diagnosis.isPreset) {
          console.log(`✅ 预设数据匹配成功`);
          console.log(`📝 匹配的预设ID: ${result.diagnosis.presetId || '未知'}`);
        } else {
          console.log(`⚠️  预期匹配预设数据，但调用了API`);
        }
      } else {
        if (!result.diagnosis.isPreset) {
          console.log(`✅ API调用成功`);
        } else {
          console.log(`⚠️  预期调用API，但匹配了预设数据`);
        }
      }
      
      // 检查报告内容
      const reportLength = result.diagnosis.report.length;
      console.log(`📄 报告长度: ${reportLength} 字符`);
      
      if (reportLength > 100) {
        console.log(`✅ 报告内容充实`);
        passedTests++;
      } else {
        console.log(`⚠️  报告内容较短，可能存在问题`);
      }
      
      // 显示报告摘要
      const reportPreview = result.diagnosis.report.substring(0, 100) + '...';
      console.log(`📖 报告预览: ${reportPreview}`);
      
    } catch (error) {
      console.log(`❌ 测试失败: ${error.message}`);
      console.log(`错误详情: ${error.stack}`);
    }
    
    console.log('-' * 50);
  }
  
  console.log(`\n🎯 测试总结:`);
  console.log(`✅ 通过: ${passedTests}/${totalTests}`);
  console.log(`❌ 失败: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log(`🎉 所有测试通过！Netlify诊断服务工作正常。`);
  } else {
    console.log(`⚠️  部分测试失败，需要进一步检查。`);
  }
}

// 单独测试预设数据匹配
async function testPresetMatching() {
  console.log('\n🔍 测试预设数据匹配逻辑...');
  
  const presetTests = [
    { input: '失眠多梦', expected: true },
    { input: '胃痛胃胀', expected: true },
    { input: '你能做什么', expected: true },
    { input: '咳嗽有痰', expected: true },
    { input: '头痛眩晕', expected: true },
    { input: '随机症状测试', expected: false }
  ];
  
  for (const test of presetTests) {
    try {
      const response = await fetch(NETLIFY_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: test.input, language: 'zh' })
      });
      
      const result = await response.json();
      const isPreset = result.success && result.diagnosis && result.diagnosis.isPreset;
      
      if (isPreset === test.expected) {
        console.log(`✅ "${test.input}" - 预设匹配正确`);
      } else {
        console.log(`❌ "${test.input}" - 预设匹配错误 (期望: ${test.expected}, 实际: ${isPreset})`);
      }
    } catch (error) {
      console.log(`❌ "${test.input}" - 测试出错: ${error.message}`);
    }
  }
}

// 运行测试
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testNetlifyDiagnosis, testPresetMatching };
} else {
  // 在浏览器或Node.js中直接运行
  testNetlifyDiagnosis().then(() => {
    return testPresetMatching();
  }).catch(console.error);
}