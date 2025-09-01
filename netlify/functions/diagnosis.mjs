// Netlify Functions for diagnosis service - 简化版本用于调试

exports.handler = async (event, context) => {
  console.log('Diagnosis function called');
  console.log('Event method:', event.httpMethod);
  console.log('Event path:', event.path);
  console.log('Event headers:', JSON.stringify(event.headers, null, 2));
  
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
    console.log('Request body:', event.body);
    
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
    console.log('Input:', input);
    console.log('Language:', language);
    
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
    
    // 简单的测试响应
    const testReport = language === 'zh' 
      ? `## 测试诊断报告\n\n### 症状分析\n患者描述：${input}\n\n### 初步建议\n这是一个测试响应，表明Netlify Functions正在工作。\n\n### 注意事项\n请咨询专业医生获取准确诊断。`
      : `## Test Diagnosis Report\n\n### Symptom Analysis\nPatient description: ${input}\n\n### Preliminary Advice\nThis is a test response indicating that Netlify Functions is working.\n\n### Important Note\nPlease consult a professional doctor for accurate diagnosis.`;
    
    console.log('Returning test response');
    
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
          report: testReport,
          source: 'test',
          timestamp: new Date().toISOString(),
          environment: 'netlify'
        }
      })
    };
    
  } catch (error) {
    console.error('Function error:', error);
    
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
        timestamp: new Date().toISOString()
      })
    };
  }
};