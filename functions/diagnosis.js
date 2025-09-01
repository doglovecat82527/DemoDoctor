// Netlify Functions for diagnosis service - 完整版本
const fs = require('fs').promises;
const path = require('path');

// 预设数据缓存 - 使用模块级缓存但确保线程安全
let cachedPresetData = null;
let loadingPromise = null;

// 加载预设数据 - 线程安全版本
async function loadPresetData() {
  // 如果已经有数据，直接返回
  if (cachedPresetData) {
    return cachedPresetData;
  }
  
  // 如果正在加载，等待加载完成
  if (loadingPromise) {
    return await loadingPromise;
  }
  
  // 开始加载数据
  loadingPromise = (async () => {
    try {
      // 尝试多个可能的路径
      const possiblePaths = [
        path.join(__dirname, '../api/data/preset-diagnosis.json'),
        path.join(__dirname, '../data/preset-diagnosis.json'),
        path.join(__dirname, './preset-diagnosis.json'),
        path.join(process.cwd(), 'api/data/preset-diagnosis.json'),
        path.join(process.cwd(), 'data/preset-diagnosis.json')
      ];
      
      let data = null;
      for (const dataPath of possiblePaths) {
        try {
          console.log('尝试加载预设数据:', dataPath);
          const fileContent = await fs.readFile(dataPath, 'utf-8');
          data = JSON.parse(fileContent);
          console.log(`成功从 ${dataPath} 加载 ${data.length} 条预设数据`);
          break;
        } catch (err) {
          console.log(`路径 ${dataPath} 加载失败:`, err.message);
          continue;
        }
      }
      
      if (data) {
        cachedPresetData = data;
      } else {
        console.warn('所有路径都无法加载预设数据，使用内嵌数据');
        // 使用内嵌的预设数据作为备用
        cachedPresetData = getEmbeddedPresetData();
      }
      
      return cachedPresetData;
    } catch (error) {
      console.error('加载预设数据失败:', error);
      cachedPresetData = getEmbeddedPresetData();
      return cachedPresetData;
    } finally {
      // 清除加载Promise，允许后续重试
      loadingPromise = null;
    }
  })();
  
  return await loadingPromise;
}

// 内嵌的预设数据（备用）
function getEmbeddedPresetData() {
  return [
    {
      "id": "case_001",
      "input": "反复感冒，咳嗽不愈，痰白质稀，怕冷，手足不温，容易出汗，食欲不振，大便偏溏，舌淡胖有齿痕，苔白滑，脉沉细",
      "keywords": ["反复感冒", "咳嗽", "痰白", "怕冷", "手足不温", "出汗", "食欲不振", "大便溏", "舌淡胖", "齿痕", "苔白滑", "脉沉细"],
      "report": {
        "zh": "## 关于患者的中医诊断与调理方案\n\n### 一、四诊信息汇总\n- **主诉**：反复感冒3个月，每次感冒后咳嗽持续不愈\n- **望诊**：舌淡胖有齿痕，苔白滑\n- **问诊**：痰白质稀，怕冷，手足不温，容易出汗，食欲不振，大便偏溏\n- **切诊**：脉沉细\n\n### 二、特征分析与辨证\n- **核心病机分析**：脾肺气虚，卫阳不固，水湿内停\n- **证型诊断**：脾肺气虚证\n\n### 三、诊断结论\n- **病名（中医）**：虚人感冒、久咳\n- **证型（中医）**：脾肺气虚，卫表不固证\n\n### 四、治疗方案\n- **治则**：健脾益肺，固表止咳\n- **药方**：\n  - **方名**：玉屏风散合参苓白术散加减\n  - **组成与剂量**：黄芪30g，白术15g，防风10g，党参15g，茯苓15g，陈皮10g，半夏10g，甘草6g，生姜3片，大枣5枚\n  - **煎服方法**：水煎服，日1剂，分2次温服\n\n### 五、生活调养建议\n- **饮食建议**：温补脾胃，忌生冷寒凉，可食用山药、莲子、红枣等\n- **情志调理**：保持心情舒畅，避免过度忧思\n- **起居运动**：注意保暖，适当运动如太极拳、八段锦\n- **穴位保健**：足三里、脾俞、肺俞等穴位按摩\n\n---\n> **免责声明**：本诊断报告由AI生成，仅供参考，不能替代专业医师诊疗。"
      }
    }
  ];
}

// 关键词匹配函数 - 接收预设数据作为参数，避免全局状态
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

// 调用Deepseek API - 添加超时和并发控制
async function callDeepseekAPI(input, language = 'zh') {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('Deepseek API密钥未配置');
  }
  
  // 创建超时控制器
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25秒超时

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
      }),
      signal: controller.signal // 添加超时信号
    });

    if (!response.ok) {
      throw new Error(`Deepseek API请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '抱歉，无法生成诊断报告。';
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Deepseek API请求超时');
      throw new Error('AI诊断服务响应超时，请稍后重试。');
    }
    console.error('Deepseek API调用失败:', error);
    throw new Error('AI诊断服务暂时不可用，请稍后重试。');
  } finally {
    clearTimeout(timeoutId); // 清除超时定时器
  }
}

exports.handler = async (event, context) => {
  // 生成请求ID用于追踪
  const requestId = Math.random().toString(36).substring(2, 15);
  console.log(`[${requestId}] Diagnosis function called - 完整版本`);
  console.log(`[${requestId}] Event method:`, event.httpMethod);
  
  // 设置函数超时时间（Netlify Functions默认10秒，我们设置8秒内完成）
  const functionTimeout = setTimeout(() => {
    console.error(`[${requestId}] Function timeout after 8 seconds`);
  }, 8000);
  
  // 处理CORS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }
  
  // 只处理POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Method not allowed. Use POST.'
      })
    };
  }
  
  try {
    // 加载预设数据 - 每个请求独立获取
    console.log(`[${requestId}] Loading preset data...`);
    const presetData = await loadPresetData();
    console.log(`[${requestId}] Preset data loaded, count:`, presetData?.length || 0);
    
    console.log(`[${requestId}] Request body:`, event.body);
    
    let requestData;
    try {
      requestData = JSON.parse(event.body || '{}');
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Invalid JSON in request body'
        })
      };
    }
    
    const { input, language = 'zh' } = requestData;
    console.log(`[${requestId}] Input:`, input);
    console.log(`[${requestId}] Language:`, language);
    
    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Input is required and must be a non-empty string'
        })
      };
    }
    
    // 首先尝试匹配预设数据 - 传递预设数据作为参数
    console.log(`[${requestId}] Attempting to match preset data...`);
    const presetMatch = matchPresetData(input.trim(), presetData);
    
    if (presetMatch) {
      console.log(`[${requestId}] Using preset data for diagnosis report`);
      // 返回预设数据
      let report;
      if (language === 'en' && presetMatch.report.en) {
        report = presetMatch.report.en;
      } else if (language === 'ja' && presetMatch.report.ja) {
        report = presetMatch.report.ja;
      } else {
        report = presetMatch.report.zh;
      }
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          success: true,
          data: {
            report,
            source: 'preset',
            timestamp: new Date().toISOString()
          }
        })
      };
    }

    // 如果没有匹配到预设数据，调用Deepseek API
    console.log(`[${requestId}] No preset match found, calling Deepseek API...`);
    try {
      const report = await callDeepseekAPI(input.trim(), language);
      console.log(`[${requestId}] Deepseek API call successful`);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          success: true,
          data: {
            report,
            source: 'api',
            timestamp: new Date().toISOString()
          }
        })
      };
    } catch (apiError) {
      console.error(`[${requestId}] Deepseek API call failed:`, apiError);
      // API调用失败时返回默认响应
      let defaultReport;
      
      if (language === 'zh') {
        defaultReport = `## 诊断建议

根据您描述的症状，建议您：

1. **及时就医**：请到正规医院的中医科进行详细检查
2. **保持良好作息**：规律睡眠，避免熬夜
3. **饮食调理**：清淡饮食，避免辛辣刺激
4. **适当运动**：根据体质选择合适的运动方式

> **重要提醒**：本系统仅供参考，不能替代专业医师诊断，请及时就医。`;
      } else {
        defaultReport = `## Diagnosis Recommendation

Based on your symptoms, we recommend:

1. **Seek Medical Attention**: Visit a qualified TCM practitioner for detailed examination
2. **Maintain Good Routine**: Regular sleep schedule, avoid staying up late
3. **Dietary Adjustment**: Light diet, avoid spicy and irritating foods
4. **Appropriate Exercise**: Choose suitable exercise according to your constitution

> **Important Notice**: This system is for reference only and cannot replace professional medical diagnosis. Please seek medical attention promptly.`;
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          success: true,
          data: {
            report: defaultReport,
            source: 'fallback',
            timestamp: new Date().toISOString()
          }
        })
      };
    }
    
  } catch (error) {
    console.error(`[${requestId}] Function error:`, error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message,
        requestId,
        timestamp: new Date().toISOString()
      })
    };
  } finally {
    clearTimeout(functionTimeout);
    console.log(`[${requestId}] Function execution completed`);
  }
};