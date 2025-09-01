const fs = require('fs');
const path = require('path');

// 模拟Netlify Functions环境测试
console.log('=== 本地模拟Netlify Functions环境测试 ===');
console.log('');

// 模拟不同的__dirname和process.cwd()情况
const scenarios = [
  {
    name: '场景1: 标准Netlify部署',
    __dirname: '/var/task/netlify/functions',
    cwd: '/var/task'
  },
  {
    name: '场景2: 本地开发环境',
    __dirname: __dirname,
    cwd: process.cwd()
  },
  {
    name: '场景3: 其他可能的部署环境',
    __dirname: '/opt/buildhome/repo/netlify/functions',
    cwd: '/opt/buildhome/repo'
  }
];

function testPathResolution(scenario) {
  console.log(`\n${scenario.name}`);
  console.log('=' .repeat(40));
  console.log('模拟__dirname:', scenario.__dirname);
  console.log('模拟process.cwd():', scenario.cwd);
  
  const presetPath = path.join(scenario.__dirname, '../../api/data/preset-diagnosis.json');
  const alternativePath = path.join(scenario.cwd, 'api/data/preset-diagnosis.json');
  const netlifyPath = path.join(scenario.cwd, 'netlify/functions/../../api/data/preset-diagnosis.json');
  
  console.log('预设路径1:', presetPath);
  console.log('预设路径2:', alternativePath);
  console.log('预设路径3:', netlifyPath);
  
  // 检查实际文件系统中的路径（仅对本地环境有效）
  if (scenario.name.includes('本地')) {
    console.log('路径1存在:', fs.existsSync(presetPath));
    console.log('路径2存在:', fs.existsSync(alternativePath));
    console.log('路径3存在:', fs.existsSync(netlifyPath));
    
    let finalPath = presetPath;
    if (!fs.existsSync(presetPath)) {
      if (fs.existsSync(alternativePath)) {
        finalPath = alternativePath;
        console.log('✅ 将使用路径2');
      } else if (fs.existsSync(netlifyPath)) {
        finalPath = netlifyPath;
        console.log('✅ 将使用路径3');
      } else {
        console.log('❌ 所有路径都不存在');
      }
    } else {
      console.log('✅ 将使用路径1');
    }
    
    console.log('最终路径:', finalPath);
    
    // 尝试加载预设数据
    if (fs.existsSync(finalPath)) {
      try {
        const content = fs.readFileSync(finalPath, 'utf8');
        const data = JSON.parse(content);
        console.log('✅ 预设数据加载成功，条目数:', data.length);
        console.log('示例条目:', data.slice(0, 1).map(item => ({
          id: item.id,
          keywords: item.keywords?.slice(0, 3)
        })));
      } catch (error) {
        console.log('❌ 预设数据加载失败:', error.message);
      }
    }
  } else {
    console.log('(非本地环境，跳过文件系统检查)');
  }
}

// 测试所有场景
scenarios.forEach(testPathResolution);

console.log('\n=== 关键词匹配测试 ===');

// 测试关键词匹配逻辑
function matchPresetData(input, presetData) {
  const inputLower = input.toLowerCase();
  
  for (const preset of presetData) {
    const matchCount = preset.keywords.filter(keyword => 
      inputLower.includes(keyword.toLowerCase())
    ).length;
    
    if (matchCount >= 2) {
      return preset;
    }
  }
  
  return null;
}

// 加载实际的预设数据进行测试
try {
  const presetPath = path.join(__dirname, 'api/data/preset-diagnosis.json');
  if (fs.existsSync(presetPath)) {
    const presetData = JSON.parse(fs.readFileSync(presetPath, 'utf8'));
    
    const testInputs = [
      '咽喉干痛',
      '头痛发热',
      '你能做什么',
      'What can you do?',
      '胃痛腹胀'
    ];
    
    testInputs.forEach(input => {
      console.log(`\n测试输入: "${input}"`);
      const match = matchPresetData(input, presetData);
      if (match) {
        console.log('✅ 找到匹配:', match.id);
        console.log('匹配关键词:', match.keywords.filter(keyword => 
          input.toLowerCase().includes(keyword.toLowerCase())
        ));
      } else {
        console.log('❌ 无匹配结果');
      }
    });
  } else {
    console.log('❌ 无法找到预设数据文件进行测试');
  }
} catch (error) {
  console.log('❌ 预设数据测试失败:', error.message);
}

console.log('\n=== 测试完成 ===');