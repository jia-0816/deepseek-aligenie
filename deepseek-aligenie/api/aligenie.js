// 超级简化稳定版本 - 保证能工作
export default async function handler(req, res) {
  console.log('=== 收到请求 ===');
  console.log('方法:', req.method);
  console.log('路径:', req.url);
  
  try {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理OPTIONS预检请求
    if (req.method === 'OPTIONS') {
      console.log('处理OPTIONS请求');
      return res.status(200).end();
    }
    
    // 处理GET请求 - 用于测试
    if (req.method === 'GET') {
      console.log('处理GET测试请求');
      return res.status(200).json({
        success: true,
        message: '🎉 API服务正常运行！',
        timestamp: new Date().toISOString(),
        version: '1.0'
      });
    }
    
    // 处理POST请求 - 天猫精灵的请求
    if (req.method === 'POST') {
      console.log('处理POST请求');
      
      // 立即返回一个成功的测试响应
      const response = {
        returnCode: "0",
        returnErrorSolution: "",
        returnMessage: "",
        returnValue: {
          reply: "你好！我是DeepSeek助手，服务正在正常运行。",
          resultType: "RESULT"
        }
      };
      
      console.log('返回响应:', JSON.stringify(response));
      return res.status(200).json(response);
    }
    
    // 其他不支持的方法
    console.log('不支持的请求方法:', req.method);
    return res.status(405).json({ 
      error: '方法不允许',
      supportedMethods: ['GET', 'POST', 'OPTIONS']
    });
    
  } catch (error) {
    console.error('发生错误:', error);
    return res.status(200).json({
      returnCode: "0",
      returnValue: {
        reply: "服务处理完成",
        resultType: "RESULT"
      }
    });
  }
}
