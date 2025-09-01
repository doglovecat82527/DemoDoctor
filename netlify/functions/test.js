// 简单的测试函数，用于验证Netlify Functions是否工作
exports.handler = async (event, context) => {
  console.log('Test function called');
  console.log('Event:', JSON.stringify(event, null, 2));
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    },
    body: JSON.stringify({
      success: true,
      message: 'Netlify Functions is working!',
      timestamp: new Date().toISOString(),
      method: event.httpMethod,
      path: event.path
    })
  };
};