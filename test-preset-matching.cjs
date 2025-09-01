const fs = require('fs');
const path = require('path');

// 加载预设数据
function loadPresetData() {
  try {
    const presetPath = path.join(__dirname, 'api/data/preset-diagnosis.json');
    console.log('预设数据路径:', presetPath);
    console.log('文件是否存在:', fs.existsSync(presetPath));
    
    const presetContent = fs.readFileSync(presetPath, 'utf8');
    const presetData = JSON.parse(presetContent);
    console.log('预设数据加载成功，条目数量:', presetData.length);
    return presetData;
  } catch (error) {
    console.error('预设数据加载失败:', error.message);
    return [];
  }
}

// 关键词匹配函数（与Netlify Functions中的逻辑一致）
function matchPresetData(input, presetData) {
  const inputLower = input.toLowerCase();
  console.log('\n=== 匹配分析 ===');
  console.log('输入（小写）:', inputLower);
  
  for (const preset of presetData) {
    // 检查是否包含关键词
    const matchedKeywords = preset.keywords.filter(keyword => 
      inputLower.includes(keyword.toLowerCase())
    );
    
    console.log(`\n检查预设 ${preset.id}:`);
    console.log('关键词:', preset.keywords);
    console.log('匹配的关键词:', matchedKeywords);
    console.log('匹配数量:', matchedKeywords.length);
    
    // 如果匹配到2个或以上关键词，认为匹配成功
    if (matchedKeywords.length >= 2) {
      console.log('✅ 匹配成功！');
      return preset;
    }
  }
  
  console.log('❌ 未找到匹配的预设数据');
  return null;
}

// 测试用例
function runTests() {
  console.log('=== 预设数据匹配测试 ===\n');
  
  const presetData = loadPresetData();
  if (presetData.length === 0) {
    console.log('❌ 无法加载预设数据，测试终止');
    return;
  }
  
  const testCases = [
    '咽喉干痛，吞咽困难',
    '头痛，发热，乏力',
    '失眠多梦，口干舌燥',
    '胃痛胃胀，食欲不振',
    '咳嗽有痰，喉咙痛',
    '你能做什么',
    'headache and fever',
    '只有一个关键词失眠',
    '完全不相关的症状'
  ];
  
  testCases.forEach((testInput, index) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`测试 ${index + 1}: "${testInput}"`);
    
    const matched = matchPresetData(testInput, presetData);
    
    if (matched) {
      console.log('\n🎯 匹配结果:');
      console.log('预设ID:', matched.id);
      console.log('原始输入:', matched.input);
      console.log('关键词:', matched.keywords);
      console.log('报告长度:', matched.report.zh.length, '字符');
    } else {
      console.log('\n❌ 无匹配结果，将调用API');
    }
  });
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('测试完成');
}

// 运行测试
if (require.main === module) {
  runTests();
}

module.exports = { loadPresetData, matchPresetData };