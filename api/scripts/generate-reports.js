import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 调用Deepseek API生成报告
async function callDeepseekAPI(input, language = 'zh') {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('Deepseek API密钥未配置');
  }

  let prompt;
  
  if (language === 'zh') {
    prompt = `你是一位经验丰富的中医师，请根据患者描述的症状进行中医诊断分析。

患者症状描述：${input}

请按照以下格式提供详细的中医诊断报告：

## 关于患者的中医诊断与调理方案

### 一、四诊信息汇总
- **主诉**：[患者主要症状]
- **望诊**：[舌象等观察]
- **问诊**：[详细询问结果]

### 二、特征分析与辨证
- **核心病机分析**：[病理机制分析]
- **证型诊断**：[具体证型]

### 三、诊断结论
- **病名（中医）**：[中医病名]
- **证型（中医）**：[证型]

### 四、治疗方案
- **治则**：[治疗原则]
- **药方**：
  - **方名**：[方剂名称]
  - **组成与剂量**：[具体药物和剂量]
  - **煎服方法**：[服用方法]

### 五、生活调养建议
- **饮食建议**：[饮食宜忌]
- **情志调理**：[情绪调节建议]
- **起居运动**：[生活作息建议]
- **穴位保健**：[推荐穴位]

---
> **免责声明**：本诊断报告由AI生成，仅供参考，不能替代专业医师诊疗。

请提供专业、详细的中医诊断分析。`;
  } else if (language === 'ja') {
    prompt = `あなたは経験豊富な中医学の医師です。患者の症状の説明に基づいて中医学的診断分析を行ってください。

患者の症状：${input}

以下の形式で詳細な中医学診断レポートを提供してください：

## 患者の中医学診断と調理方案

### 一、四診情報まとめ
- **主訴**：[患者の主要症状]
- **望診**：[舌診など観察]
- **問診**：[詳細な問診結果]

### 二、特徴分析と弁証
- **核心病機分析**：[病理メカニズム分析]
- **証型診断**：[具体的証型]

### 三、診断結論
- **病名（中医）**：[中医病名]
- **証型（中医）**：[証型]

### 四、治療方案
- **治則**：[治療原則]
- **薬方**：
  - **方名**：[方剤名称]
  - **組成と用量**：[具体的薬物と用量]
  - **煎服方法**：[服用方法]

### 五、生活調養建議
- **飲食建議**：[飲食の宜忌]
- **情志調理**：[感情調節建議]
- **起居運動**：[生活リズム建議]
- **穴位保健**：[推奨穴位]

---
> **免責事項**：この診断レポートはAIによって生成されており、参考のみです。専門医師の診療に代わるものではありません。

専門的で詳細な中医学診断分析を提供してください。`;
  } else {
    prompt = `You are an experienced Traditional Chinese Medicine (TCM) practitioner. Please provide a TCM diagnosis based on the patient's symptoms.

Patient symptoms: ${input}

Please provide a detailed TCM diagnosis report in the following format:

## TCM Diagnosis and Treatment Plan

### I. Four Diagnostic Methods Summary
- **Chief Complaint**: [Main symptoms]
- **Inspection**: [Tongue examination, etc.]
- **Inquiry**: [Detailed questioning results]

### II. Pattern Analysis
- **Core Pathogenesis**: [Pathological mechanism]
- **Pattern Diagnosis**: [Specific pattern]

### III. Diagnosis
- **Disease**: [TCM disease name]
- **Pattern**: [Pattern type]

### IV. Treatment Plan
- **Treatment Principle**: [Treatment principles]
- **Herbal Formula**: [Formula details]

### V. Lifestyle Recommendations
- **Diet**: [Dietary recommendations]
- **Lifestyle**: [Living habits]
- **Acupoints**: [Recommended acupoints]

---
> **Disclaimer**: This AI-generated report is for reference only.

Please provide a professional and detailed TCM analysis.`;
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Deepseek API请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '抱歉，无法生成诊断报告。';
  } catch (error) {
    console.error('Deepseek API调用失败:', error);
    throw error;
  }
}

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 主函数
async function generateReports() {
  try {
    // 读取病例数据
    const casesPath = path.join(__dirname, '../data/patient-cases.json');
    const casesData = await fs.readFile(casesPath, 'utf-8');
    const cases = JSON.parse(casesData);

    // 读取现有的预设数据
    const presetPath = path.join(__dirname, '../data/preset-diagnosis.json');
    const presetData = await fs.readFile(presetPath, 'utf-8');
    const existingPresets = JSON.parse(presetData);

    console.log(`开始为 ${cases.length} 个病例生成诊断报告...`);

    const newPresets = [];

    for (let i = 0; i < cases.length; i++) {
      const caseItem = cases[i];
      console.log(`\n正在处理第 ${i + 1}/${cases.length} 个病例: ${caseItem.id}`);
      console.log(`症状描述: ${caseItem.description.substring(0, 50)}...`);

      try {
        // 生成中文报告
        console.log('生成中文报告...');
        const zhReport = await callDeepseekAPI(caseItem.description, 'zh');
        await delay(2000); // 延迟2秒避免API限制

        // 生成英文报告
        console.log('生成英文报告...');
        const enReport = await callDeepseekAPI(caseItem.description, 'en');
        await delay(2000);

        // 生成日文报告
        console.log('生成日文报告...');
        const jaReport = await callDeepseekAPI(caseItem.description, 'ja');
        await delay(2000);

        // 创建新的预设数据项
        const newPreset = {
          id: caseItem.id,
          input: caseItem.description,
          keywords: caseItem.keywords,
          report: {
            zh: zhReport,
            en: enReport,
            ja: jaReport
          },
          createdAt: new Date().toISOString()
        };

        newPresets.push(newPreset);
        console.log(`✅ 第 ${i + 1} 个病例处理完成`);

      } catch (error) {
        console.error(`❌ 第 ${i + 1} 个病例处理失败:`, error.message);
        // 继续处理下一个病例
        continue;
      }
    }

    // 合并现有数据和新数据
    const allPresets = [...existingPresets, ...newPresets];

    // 保存到文件
    await fs.writeFile(presetPath, JSON.stringify(allPresets, null, 2), 'utf-8');
    
    console.log(`\n🎉 成功生成 ${newPresets.length} 个诊断报告！`);
    console.log(`总共有 ${allPresets.length} 个预设诊断数据`);
    
  } catch (error) {
    console.error('生成报告失败:', error);
    process.exit(1);
  }
}

// 运行脚本
generateReports();