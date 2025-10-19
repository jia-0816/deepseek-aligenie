export default function handler(req, res) {
  console.log('✅ API被调用！方法:', req.method);
  
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 返回成功响应
  res.status(200).json({
    success: true,
    message: '🎉 Vercel API配置成功！',
    timestamp: new Date().toISOString(),
    method: req.method
  });
}
