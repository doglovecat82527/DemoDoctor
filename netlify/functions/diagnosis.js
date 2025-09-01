// 使用内置的fetch API，无需导入
const fs = require('fs');
const path = require('path');

// 加载预设数据
let presetData = [];
let presetDataStatus = 'not_loaded';
try {
  // 在Netlify Functions中，使用相对路径
  const presetPath = path.join(__dirname, '../../api/data/preset-diagnosis.json');
  const alternativePath = path.join(process.cwd(), 'api/data/preset-diagnosis.json');
  const netlifyPath = path.join(process.cwd(), 'netlify/functions/../../api/data/preset-diagnosis.json');
  
  console.log('尝试加载预设数据');
  console.log('__dirname:', __dirname);
  console.log('process.cwd():', process.cwd());
  console.log('预设路径1:', presetPath);
  console.log('预设路径2:', alternativePath);
  console.log('预设路径3:', netlifyPath);
  console.log('路径1存在:', fs.existsSync(presetPath));
  console.log('路径2存在:', fs.existsSync(alternativePath));
  console.log('路径3存在:', fs.existsSync(netlifyPath));
  
  let finalPath = presetPath;
  if (!fs.existsSync(presetPath)) {
    if (fs.existsSync(alternativePath)) {
      finalPath = alternativePath;
    } else if (fs.existsSync(netlifyPath)) {
      finalPath = netlifyPath;
    }
  }
  
  console.log('最终使用路径:', finalPath);
  console.log('最终路径存在:', fs.existsSync(finalPath));
  
  const presetContent = fs.readFileSync(finalPath, 'utf8');
  presetData = JSON.parse(presetContent);
  presetDataStatus = 'loaded';
  console.log('预设数据加载成功，条目数量:', presetData.length);
  console.log('预设数据示例:', presetData.slice(0, 2).map(item => ({
    id: item.id,
    keywords: item.keywords,
    hasReport: !!item.report
  })));
} catch (error) {
  presetDataStatus = 'failed';
  console.error('预设数据加载失败:', error.message);
  console.error('错误详情:', error.stack);
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
  const startTime = Date.now();
  console.log('=== Netlify Function 开始执行 ===');
  console.log('执行时间:', new Date().toISOString());
  console.log('HTTP Method:', event.httpMethod);
  console.log('User-Agent:', event.headers['user-agent']);
  console.log('Origin:', event.headers.origin);
  console.log('Body length:', event.body?.length || 0);
  console.log('预设数据状态:', presetDataStatus);
  console.log('预设数据条目数:', presetData.length);
  
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
    console.log('API密钥检查:', apiKey ? `存在 (长度: ${apiKey.length}, 前缀: ${apiKey.substring(0, 8)}...)` : '不存在');
    console.log('所有环境变量数量:', Object.keys(process.env).length);
    console.log('DEEPSEEK相关环境变量:', Object.keys(process.env).filter(key => key.includes('DEEPSEEK')));
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('NETLIFY:', process.env.NETLIFY);
    
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
    console.log('API请求体大小:', JSON.stringify(requestBody).length, 'bytes');
    console.log('Prompt长度:', prompt.length);
    
    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('API调用超时，中止请求');
      controller.abort();
    }, 25000); // 25秒超时
    
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log('API响应状态:', response.status);
      console.log('API响应头Content-Type:', response.headers.get('content-type'));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API调用失败:', response.status, errorText);
        throw new Error(`API调用失败: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API响应数据结构:', {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length || 0,
        hasUsage: !!data.usage,
        model: data.model
      });
      
      if (data.choices && data.choices.length > 0) {
        const diagnosis = data.choices[0].message.content;
        console.log('诊断结果长度:', diagnosis.length);
        console.log('诊断结果前100字符:', diagnosis.substring(0, 100));
        
        const executionTime = Date.now() - startTime;
        console.log('总执行时间:', executionTime, 'ms');
        
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
              source: 'deepseek_api',
              executionTime: executionTime
            }
          })
        };
      } else {
        console.error('API响应格式异常:', data);
        throw new Error('API响应格式异常');
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('API调用异常:', fetchError.message);
      console.error('异常类型:', fetchError.name);
      console.error('异常堆栈:', fetchError.stack);
      
      if (fetchError.name === 'AbortError') {
        console.log('请求被中止（超时）');
        throw new Error('API调用超时，请稍后重试');
      }
      throw fetchError;
    }

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('=== 诊断服务错误 ===');
    console.error('错误时间:', new Date().toISOString());
    console.error('执行时间:', executionTime, 'ms');
    console.error('错误消息:', error.message);
    console.error('错误类型:', error.name);
    console.error('错误堆栈:', error.stack);
    console.error('预设数据状态:', presetDataStatus);
    console.error('环境变量DEEPSEEK_API_KEY存在:', !!process.env.DEEPSEEK_API_KEY);
    
    // 根据错误类型提供更具体的错误信息
    let errorMessage = '诊断服务暂时不可用，请稍后重试';
    if (error.message.includes('超时')) {
      errorMessage = '诊断服务响应超时，请稍后重试';
    } else if (error.message.includes('API密钥')) {
      errorMessage = '服务配置错误，请联系管理员';
    } else if (error.message.includes('网络')) {
      errorMessage = '网络连接异常，请检查网络后重试';
    }
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        details: error.message,
        executionTime: executionTime,
        timestamp: new Date().toISOString()
      })
    };
  }
};