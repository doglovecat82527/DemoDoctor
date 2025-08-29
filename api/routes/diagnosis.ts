import express, { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

interface PresetData {
  id: string;
  input: string;
  keywords: string[];
  report: {
    zh: string;
    en: string;
    ja: string;
  };
  createdAt: string;
}

interface DiagnosisRequest {
  input: string;
  language?: 'zh' | 'en' | 'ja';
}

interface DiagnosisResponse {
  success: boolean;
  data?: {
    report: string;
    source: 'preset' | 'api';
  };
  error?: string;
}

// 加载预设数据
let presetData: PresetData[] = [];

async function loadPresetData() {
  try {
    const dataPath = path.join(__dirname, '../data/preset-diagnosis.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    presetData = JSON.parse(data);
    console.log(`已加载 ${presetData.length} 条预设诊断数据`);
  } catch (error) {
    console.error('加载预设数据失败:', error);
    presetData = [];
  }
}

// 初始化时加载数据
loadPresetData();

// 关键词匹配函数
function matchPresetData(input: string): PresetData | null {
  const inputLower = input.toLowerCase();
  
  for (const preset of presetData) {
    // 检查是否包含关键词
    const matchCount = preset.keywords.filter(keyword => 
      inputLower.includes(keyword.toLowerCase())
    ).length;
    
    // 如果匹配到2个或以上关键词，认为匹配成功
    if (matchCount >= 2) {
      return preset;
    }
  }
  
  return null;
}

// 调用Deepseek API
async function callDeepseekAPI(input: string, language: string = 'zh'): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('Deepseek API密钥未配置');
  }

  let prompt: string;
  
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
    throw new Error('AI诊断服务暂时不可用，请稍后重试。');
  }
}

// 诊断接口
router.post('/', async (req: Request, res: Response) => {
  try {
    const { input, language = 'zh' }: DiagnosisRequest = req.body;

    if (!input || !input.trim()) {
      return res.status(400).json({
        success: false,
        error: '请输入症状描述'
      } as DiagnosisResponse);
    }

    // 首先尝试匹配预设数据
    const presetMatch = matchPresetData(input.trim());
    
    if (presetMatch) {
      // 返回预设数据
      let report: string;
      if (language === 'en') {
        report = presetMatch.report.en;
      } else if (language === 'ja') {
        report = presetMatch.report.ja;
      } else {
        report = presetMatch.report.zh;
      }
      
      return res.json({
        success: true,
        data: {
          report,
          source: 'preset'
        }
      } as DiagnosisResponse);
    }

    // 如果没有匹配到预设数据，调用Deepseek API
    try {
      const report = await callDeepseekAPI(input.trim(), language);
      return res.json({
        success: true,
        data: {
          report,
          source: 'api'
        }
      } as DiagnosisResponse);
    } catch (apiError) {
      // API调用失败时返回默认响应
      let defaultReport: string;
      
      if (language === 'zh') {
        defaultReport = `## 诊断建议

根据您描述的症状，建议您：

1. **及时就医**：请到正规医院的中医科进行详细检查
2. **保持良好作息**：规律睡眠，避免熬夜
3. **饮食调理**：清淡饮食，避免辛辣刺激
4. **适当运动**：根据体质选择合适的运动方式

> **重要提醒**：本系统仅供参考，不能替代专业医师诊断，请及时就医。`;
      } else if (language === 'ja') {
        defaultReport = `## 診断建議

あなたの症状の説明に基づいて、以下をお勧めします：

1. **速やかな受診**：正規の病院の中医科で詳細な検査を受けてください
2. **良好な生活リズムの維持**：規則正しい睡眠、夜更かしを避ける
3. **食事調理**：あっさりした食事、辛い刺激物を避ける
4. **適度な運動**：体質に応じて適切な運動方式を選択

> **重要なお知らせ**：このシステムは参考のみであり、専門医師の診断に代わるものではありません。速やかに受診してください。`;
      } else {
        defaultReport = `## Diagnosis Recommendation

Based on your symptoms, we recommend:

1. **Seek Medical Attention**: Visit a qualified TCM practitioner for detailed examination
2. **Maintain Good Routine**: Regular sleep schedule, avoid staying up late
3. **Dietary Adjustment**: Light diet, avoid spicy and irritating foods
4. **Appropriate Exercise**: Choose suitable exercise according to your constitution

> **Important Notice**: This system is for reference only and cannot replace professional medical diagnosis. Please seek medical attention promptly.`;
      }

      return res.json({
        success: true,
        data: {
          report: defaultReport,
          source: 'preset'
        }
      } as DiagnosisResponse);
    }
  } catch (error) {
    console.error('诊断接口错误:', error);
    return res.status(500).json({
      success: false,
      error: '诊断服务暂时不可用，请稍后重试'
    } as DiagnosisResponse);
  }
});

export default router;