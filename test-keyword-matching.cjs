const fs = require('fs');
const path = require('path');

// 用户输入的症状
const userInput = "患者女性，45岁，主诉：情绪低落2个月，经常叹气，胸胁胀满，乳房胀痛，月经前症状加重，睡眠质量差，多梦，食欲减退，舌淡红苔薄白，脉弦细。";

// 加载预设数据
function loadPresetData() {
  try {
    const dataPath = path.join(__dirname, 'api/data/preset-diagnosis.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('加载预设数据失败:', error);
    return [];
  }
}

// 关键词匹配函数
function matchPresetData(input, presetData) {
  if (!presetData || !Array.isArray(presetData)) {
    console.warn('预设数据无效或为空');
    return null;
  }
  
  const inputLower = input.toLowerCase();
  console.log('\n用户输入（转小写）:', inputLower);
  console.log('\n开始匹配预设案例...');
  
  for (const preset of presetData) {
    console.log(`\n检查案例 ${preset.id}:`);
    console.log('案例描述:', preset.input.substring(0, 100) + '...');
    console.log('关键词:', preset.keywords);
    
    // 检查是否包含关键词
    const matchedKeywords = [];
    const matchCount = preset.keywords.filter(keyword => {
      const isMatch = inputLower.includes(keyword.toLowerCase());
      if (isMatch) {
        matchedKeywords.push(keyword);
      }
      return isMatch;
    }).length;
    
    console.log(`匹配的关键词: [${matchedKeywords.join(', ')}] (${matchCount}个)`);
    
    // 如果匹配到2个或以上关键词，认为匹配成功
    if (matchCount >= 2) {
      console.log(`\n✅ 匹配成功！案例 ${preset.id}，匹配关键词数量: ${matchCount}`);
      return preset;
    }
  }
  
  console.log('\n❌ 没有找到匹配的预设案例');
  return null;
}

// 分析用户症状中的关键词
function analyzeUserSymptoms(input) {
  console.log('\n=== 用户症状分析 ===');
  console.log('用户输入:', input);
  
  // 提取可能的关键词
  const possibleKeywords = [
    '情绪低落', '叹气', '胸胁胀满', '乳房胀痛', '月经前症状加重',
    '睡眠质量差', '多梦', '食欲减退', '舌淡红', '苔薄白', '脉弦细',
    '情绪', '胸胁', '乳房', '月经', '睡眠', '食欲', '舌', '脉'
  ];
  
  console.log('\n可能的关键词:');
  possibleKeywords.forEach(keyword => {
    if (input.includes(keyword)) {
      console.log(`- ${keyword} ✓`);
    }
  });
}

// 主函数
function main() {
  console.log('=== 关键词匹配测试 ===');
  
  // 分析用户症状
  analyzeUserSymptoms(userInput);
  
  // 加载预设数据
  const presetData = loadPresetData();
  console.log(`\n加载了 ${presetData.length} 个预设案例`);
  
  // 进行匹配测试
  const matchResult = matchPresetData(userInput, presetData);
  
  if (matchResult) {
    console.log('\n=== 匹配结果 ===');
    console.log('匹配的案例ID:', matchResult.id);
    console.log('案例描述:', matchResult.input);
    console.log('关键词:', matchResult.keywords);
  } else {
    console.log('\n=== 匹配失败分析 ===');
    console.log('建议添加肝郁气滞相关的预设案例，包含以下关键词:');
    console.log('- 情绪低落');
    console.log('- 叹气');
    console.log('- 胸胁胀满');
    console.log('- 乳房胀痛');
    console.log('- 月经前症状加重');
    console.log('- 睡眠质量差');
    console.log('- 多梦');
    console.log('- 食欲减退');
    console.log('- 脉弦细');
  }
}

// 运行测试
main();