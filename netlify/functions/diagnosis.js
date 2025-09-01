// 使用内置的fetch API，无需导入
const fs = require('fs');
const path = require('path');

// 加载预设数据
let presetData = [];
try {
  const presetPath = path.join(__dirname, '../../api/data/preset-diagnosis.json');
  const presetContent = fs.readFileSync(presetPath, 'utf8');
  presetData = JSON.parse(presetContent);
} catch (error) {
  console.log('Failed to load preset data:', error.message);
}

// 关键词匹配函数
function matchPresetData(input) {
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

exports.handler = async (event, context) => {
  console.log('=== Netlify Function 开始执行 ===');
  console.log('HTTP Method:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers, null, 2));
  console.log('Body:', event.body);
  
  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    console.log('错误: 不支持的HTTP方法');
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { input, language = 'zh' } = JSON.parse(event.body);
    console.log('解析的输入参数:', { input: input?.substring(0, 100) + '...', language });
    
    if (!input) {
      console.log('错误: 缺少输入参数');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '缺少必要参数' })
      };
    }

    // 首先尝试匹配预设数据
    const matchedPreset = matchPresetData(input);
    if (matchedPreset) {
      console.log('Found matching preset data for input:', input);
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
            report: matchedPreset.report[language] || matchedPreset.report.zh,
            source: 'preset'
          }
        })
      };
    }

    console.log('No preset match found, calling Deepseek API for input:', input);

    // 调用Deepseek API
    const apiKey = process.env.DEEPSEEK_API_KEY;
    console.log('API密钥检查:', apiKey ? `存在 (长度: ${apiKey.length})` : '不存在');
    console.log('环境变量列表:', Object.keys(process.env).filter(key => key.includes('DEEPSEEK')));
    
    if (!apiKey) {
      console.log('错误: API密钥未配置');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          success: false,
          error: 'API密钥未配置',
          debug: {
            env_keys: Object.keys(process.env).filter(key => key.includes('DEEPSEEK')),
            all_env_keys: Object.keys(process.env).length
          }
        })
      };
    }

    let prompt;
    
    if (language === 'zh') {
      prompt = `你是一位经验丰富的中医师，请根据患者描述的症状进行中医诊断分析。

患者症状描述：${input}

请按照以下格式提供详细的中医诊断报告：

## 关于患者的中医诊断与调理方案

### 一、四诊合参
- **主诉**：[主要症状]
- **望诊**：[舌象等]
- **闻诊**：[声音气味等]
- **问诊**：[详细询问结果]
- **切诊**：[脉象等]

### 二、中医诊断
- **病名**：[中医病名]
- **证型**：[具体证型]
- **病机**：[发病机理]

### 三、治疗原则
[治疗大法和具体原则]

### 四、治疗方案

#### 方药治疗
**方名**：[方剂名称]
**组成**：
- 药材1 用量
- 药材2 用量
- 药材3 用量
[继续列出所有药材]

**用法**：[煎服方法]
**功效**：[方剂功效]
**方解**：[方剂分析]

#### 其他治疗
- **针灸**：[穴位和方法]
- **推拿**：[手法和部位]
- **食疗**：[饮食建议]

### 五、调护建议
- **起居**：[作息建议]
- **饮食**：[饮食宜忌]
- **情志**：[情绪调节]
- **运动**：[运动建议]

### 六、复诊安排
[复诊时间和注意事项]

请提供专业、详细的中医诊断报告。`;
    } else {
      prompt = `You are an experienced Traditional Chinese Medicine (TCM) practitioner. Please provide a TCM diagnosis based on the patient's symptoms.

Patient symptoms: ${input}

Please provide a detailed TCM diagnosis report in the following format:

## TCM Diagnosis and Treatment Plan

### I. Four Diagnostic Methods Summary
- **Chief Complaint**: [Main symptoms]
- **Inspection**: [Tongue examination, etc.]
- **Auscultation & Olfaction**: [Sound and smell observations]
- **Inquiry**: [Detailed questioning results]
- **Palpation**: [Pulse examination, etc.]

### II. TCM Diagnosis
- **Disease Name**: [TCM disease name]
- **Pattern**: [Specific pattern]
- **Pathogenesis**: [Disease mechanism]

### III. Treatment Principles
[Treatment methods and specific principles]

### IV. Treatment Plan

#### Herbal Formula
**Formula Name**: [Formula name]
**Composition**:
- Herb 1 dosage
- Herb 2 dosage
- Herb 3 dosage
[Continue listing all herbs]

**Usage**: [Preparation and administration]
**Effects**: [Formula effects]
**Analysis**: [Formula analysis]

#### Additional Treatments
- **Acupuncture**: [Points and methods]
- **Tuina Massage**: [Techniques and locations]
- **Dietary Therapy**: [Dietary recommendations]

### V. Lifestyle Recommendations
- **Daily Routine**: [Schedule recommendations]
- **Diet**: [Dietary guidelines]
- **Emotional**: [Emotional regulation]
- **Exercise**: [Exercise recommendations]

### VI. Follow-up
[Follow-up schedule and precautions]

Please provide a professional and detailed TCM diagnosis report.`;
    }

    console.log('开始调用Deepseek API...');
    const requestBody = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };
    console.log('API请求体:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('API响应状态:', response.status);
    console.log('API响应头:', JSON.stringify([...response.headers.entries()], null, 2));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('API错误响应:', errorText);
      throw new Error(`API请求失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API响应数据结构:', {
      choices_length: data.choices?.length,
      has_message: !!data.choices?.[0]?.message,
      content_length: data.choices?.[0]?.message?.content?.length
    });
    
    const diagnosis = data.choices[0].message.content;

    console.log('成功生成诊断报告，长度:', diagnosis.length);
    const successResponse = {
      success: true,
      data: {
        report: diagnosis,
        source: 'netlify-api'
      }
    };
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify(successResponse)
    };

  } catch (error) {
    console.error('=== 诊断API错误详情 ===');
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('=== 错误详情结束 ===');
    
    const errorResponse = {
      success: false,
      error: '诊断服务暂时不可用，请稍后重试',
      debug: {
        error_message: error.message,
        error_type: error.constructor.name,
        timestamp: new Date().toISOString(),
        env_check: {
          has_api_key: !!process.env.DEEPSEEK_API_KEY,
          api_key_length: process.env.DEEPSEEK_API_KEY?.length || 0
        }
      }
    };
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(errorResponse)
    };
  }
};