const fs = require('fs');
const path = require('path');

// 模拟用户输入（与case_008完全一致）
const userInput = "患者女性，45岁，主诉：情绪低落2个月，经常叹气，胸胁胀满，乳房胀痛，月经前症状加重，睡眠质量差，多梦，食欲减退，舌淡红苔薄白，脉弦细。";

// 加载预设数据
function loadPresetData() {
  const possiblePaths = [
    path.join(__dirname, 'api', 'data', 'preset-diagnosis.json'),
    path.join(__dirname, 'netlify', 'functions', 'preset-diagnosis.json'),
    path.join(__dirname, 'preset-diagnosis.json')
  ];

  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        console.log(`✅ 成功加载预设数据: ${filePath}`);
        return JSON.parse(data);
      }
    } catch (error) {
      console.log(`❌ 加载失败: ${filePath} - ${error.message}`);
    }
  }

  console.log('❌ 无法加载预设数据，使用内嵌数据');
  return [];
}

// 关键词匹配函数（从diagnosis.js复制）
function matchPresetData(input, presetData) {
  const matches = presetData.filter(item => {
    const matchedKeywords = item.keywords.filter(keyword => 
      input.includes(keyword)
    );
    return matchedKeywords.length >= 2;
  });
  
  return matches;
}

// 测试函数
function testDiagnosisMatching() {
  console.log('=== 诊断API匹配测试 ===\n');
  
  console.log('用户输入:');
  console.log(userInput);
  console.log('\n');
  
  // 加载预设数据
  const presetData = loadPresetData();
  
  if (!presetData || presetData.length === 0) {
    console.log('❌ 无法加载预设数据，测试终止');
    return;
  }
  
  console.log(`📊 预设数据总数: ${presetData.length}`);
  console.log('\n');
  
  // 执行匹配
  const matches = matchPresetData(userInput, presetData);
  
  console.log(`🔍 匹配结果: 找到 ${matches.length} 个匹配案例`);
  console.log('\n');
  
  if (matches.length > 0) {
    matches.forEach((match, index) => {
      console.log(`--- 匹配案例 ${index + 1}: ${match.id} ---`);
      console.log('输入:', match.input);
      console.log('关键词:', match.keywords.join(', '));
      
      // 检查哪些关键词匹配
      const matchedKeywords = match.keywords.filter(keyword => 
        userInput.includes(keyword)
      );
      console.log(`匹配的关键词 (${matchedKeywords.length}个):`, matchedKeywords.join(', '));
      
      // 显示报告的前100个字符
      if (match.report && match.report.zh) {
        console.log('中文报告预览:', match.report.zh.substring(0, 100) + '...');
      }
      console.log('\n');
    });
  } else {
    console.log('❌ 没有找到匹配的案例');
    console.log('\n建议检查:');
    console.log('1. 关键词匹配逻辑是否正确');
    console.log('2. 预设数据是否正确加载');
    console.log('3. 输入文本是否与预设数据一致');
  }
}

// 运行测试
testDiagnosisMatching();