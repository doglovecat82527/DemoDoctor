// 同步预设数据到netlify函数的脚本
const fs = require('fs');
const path = require('path');

// 读取完整的预设数据
const presetDataPath = path.join(__dirname, 'api/data/preset-diagnosis.json');
const netlifyFunctionPath = path.join(__dirname, 'netlify/functions/diagnosis.js');

console.log('开始同步预设数据...');

try {
  // 读取预设数据
  const presetData = JSON.parse(fs.readFileSync(presetDataPath, 'utf-8'));
  console.log(`读取到 ${presetData.length} 个预设案例`);
  
  // 读取netlify函数文件
  let functionContent = fs.readFileSync(netlifyFunctionPath, 'utf-8');
  
  // 生成新的内嵌数据代码
  const embeddedDataCode = `function getEmbeddedPresetData() {
  return ${JSON.stringify(presetData, null, 2)};
}`;
  
  // 替换getEmbeddedPresetData函数
  const functionRegex = /function getEmbeddedPresetData\(\)[\s\S]*?^}/m;
  
  if (functionRegex.test(functionContent)) {
    functionContent = functionContent.replace(functionRegex, embeddedDataCode);
    console.log('成功替换getEmbeddedPresetData函数');
  } else {
    console.error('未找到getEmbeddedPresetData函数');
    process.exit(1);
  }
  
  // 写回文件
  fs.writeFileSync(netlifyFunctionPath, functionContent, 'utf-8');
  console.log('成功更新netlify函数文件');
  console.log(`同步完成！共同步 ${presetData.length} 个案例`);
  
} catch (error) {
  console.error('同步失败:', error.message);
  process.exit(1);
}