const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { input, language = 'zh' } = JSON.parse(event.body);
    
    if (!input) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '缺少必要参数' })
      };
    }

    // 调用Deepseek API
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API密钥未配置' })
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
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const diagnosis = data.choices[0].message.content;

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
          report: diagnosis,
          source: 'api'
        }
      })
    };

  } catch (error) {
    console.error('诊断API错误:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: '诊断服务暂时不可用，请稍后重试'
      })
    };
  }
};