import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config();

// 读取病例数据
const patientCasesPath = path.join(__dirname, '../data/patient-cases.json');
const presetDiagnosisPath = path.join(__dirname, '../data/preset-diagnosis.json');

const patientCases = JSON.parse(fs.readFileSync(patientCasesPath, 'utf8'));
const presetDiagnosis = JSON.parse(fs.readFileSync(presetDiagnosisPath, 'utf8'));

// 获取已存在的病例ID
const existingCaseIds = presetDiagnosis.map(item => item.id);
console.log('已存在的病例ID:', existingCaseIds);

// 筛选需要生成报告的病例（从case_005开始）
const casesToProcess = patientCases.filter(caseItem => {
  return !existingCaseIds.includes(caseItem.id) && caseItem.id >= 'case_005';
});

console.log(`需要处理的病例数量: ${casesToProcess.length}`);
console.log('需要处理的病例ID:', casesToProcess.map(c => c.id));

// 调用Deepseek API生成中文诊断报告
async function callDeepseekAPI(description, language = 'zh') {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY 未配置');
    return null;
  }

  const prompt = `你是一位经验丰富的中医师，请根据以下患者症状描述，提供详细的中医诊断和治疗方案。

患者症状：${description}

请按照以下格式提供诊断报告：

## 关于患者的中医诊断与调理方案

### 一、四诊信息汇总
- **主诉**：[简要概括主要症状]
- **望诊**：[舌象、面色等]
- **问诊**：[详细症状询问结果]

### 二、特征分析与辨证
- **核心病机分析**：[分析病因病机]
- **证型诊断**：[确定中医证型]

### 三、诊断结论
- **病名（中医）**：[中医病名]
- **证型（中医）**：[具体证型]

### 四、治疗方案
- **治则**：[治疗原则]
- **药方**：
  - **方名**：[方剂名称]
  - **组成与剂量**：[详细药物组成和用量]
  - **煎服方法**：[具体服用方法]

### 五、生活调养建议
- **饮食建议**：[饮食宜忌]
- **情志调理**：[情绪调节建议]
- **起居运动**：[生活起居和运动建议]
- **穴位保健**：[推荐穴位和按摩方法]

---
> **免责声明**：本诊断报告由AI生成，仅供参考，不能替代专业医师诊疗。`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      console.error(`API调用失败: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('调用Deepseek API时出错:', error);
    return null;
  }
}

// 生成诊断报告
async function generateReports() {
  console.log('开始生成中文诊断报告...');
  
  for (let i = 0; i < casesToProcess.length; i++) {
    const caseItem = casesToProcess[i];
    console.log(`\n正在处理第 ${i + 1}/${casesToProcess.length} 个病例: ${caseItem.id}`);
    
    try {
      // 生成中文报告
      console.log('生成中文报告...');
      const chineseReport = await callDeepseekAPI(caseItem.description, 'zh');
      
      if (chineseReport) {
        // 创建新的诊断记录
        const newDiagnosis = {
          id: caseItem.id,
          input: caseItem.description,
          keywords: caseItem.keywords,
          report: {
            zh: chineseReport
          },
          createdAt: new Date().toISOString()
        };
        
        // 添加到预设诊断数据中
        presetDiagnosis.push(newDiagnosis);
        
        console.log(`✅ ${caseItem.id} 中文报告生成成功`);
      } else {
        console.log(`❌ ${caseItem.id} 中文报告生成失败`);
      }
      
      // 添加延迟以避免API限制
      if (i < casesToProcess.length - 1) {
        console.log('等待2秒...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error(`处理 ${caseItem.id} 时出错:`, error);
    }
  }
  
  // 保存更新后的预设诊断数据
  try {
    fs.writeFileSync(presetDiagnosisPath, JSON.stringify(presetDiagnosis, null, 2), 'utf8');
    console.log('\n✅ 所有报告已成功保存到 preset-diagnosis.json');
    console.log(`总共处理了 ${casesToProcess.length} 个病例`);
  } catch (error) {
    console.error('保存文件时出错:', error);
  }
}

// 开始执行
generateReports().catch(console.error);