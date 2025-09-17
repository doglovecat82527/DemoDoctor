const input = '患者女性，32岁，主诉：失眠多梦2周，伴口干舌燥，情绪烦躁易怒，夜间盗汗，入睡困难，多梦易醒，舌红苔薄黄，脉弦数。近期工作压力较大，精神紧张。';
const keywords = ['失眠', '多梦', '口干', '舌燥', '脾气', '烦躁', '易怒'];

const inputLower = input.toLowerCase();
console.log('输入文本:', input);
console.log('关键词:', keywords);
console.log('匹配结果:');

keywords.forEach(keyword => {
  const found = inputLower.includes(keyword.toLowerCase());
  console.log(`  ${keyword}: ${found ? '✓' : '✗'} (${found ? '匹配' : '未匹配'})`);
});

const matchCount = keywords.filter(keyword => 
  inputLower.includes(keyword.toLowerCase())
).length;

console.log(`总匹配数: ${matchCount}/7`);
console.log(`是否达到阈值(>=2): ${matchCount >= 2 ? '是' : '否'}`);

// 测试实际的匹配函数逻辑
function matchPresetData(input, presetData) {
  if (!presetData || !Array.isArray(presetData)) {
    console.warn('预设数据无效或为空');
    return null;
  }
  
  const inputLower = input.toLowerCase();
  
  for (const preset of presetData) {
    // 检查是否包含关键词
    const matchCount = preset.keywords.filter(keyword => 
      inputLower.includes(keyword.toLowerCase())
    ).length;
    
    // 如果匹配到2个或以上关键词，认为匹配成功
    if (matchCount >= 2) {
      console.log(`匹配到预设数据 ${preset.id}，匹配关键词数量: ${matchCount}`);
      return preset;
    }
  }
  
  return null;
}

// 模拟预设数据
const testPresetData = [{
  "id": "case_001",
  "input": "患者女性，32岁，主诉：失眠多梦2周，伴口干舌燥，情绪烦躁易怒，夜间盗汗，入睡困难，多梦易醒，舌红苔薄黄，脉弦数。近期工作压力较大，精神紧张。",
  "keywords": ["失眠", "多梦", "口干", "舌燥", "脾气", "烦躁", "易怒"]
}];

console.log('\n测试匹配函数:');
const result = matchPresetData(input, testPresetData);
console.log('匹配结果:', result ? `找到匹配: ${result.id}` : '未找到匹配');