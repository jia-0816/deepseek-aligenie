// 在这里填入你的DeepSeek API Key
const DEEPSEEK_API_KEY = "sk-53f24f64baed4d148bf49630a9dc7ee4";

export default async function handler(req, res) {
  // 设置CORS头，允许天猫精灵访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理OPTIONS请求（预检请求）
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  try {
    console.log('收到请求:', JSON.stringify(req.body));
    
    // 提取用户问题
    const userQuestion = extractQuestion(req.body);
    console.log('用户问题:', userQuestion);

    // 调用DeepSeek获取回答
    const aiReply = await callDeepSeek(userQuestion);
    console.log('AI回复:', aiReply);

    // 返回给天猫精灵的格式
    const response = {
      returnCode: "0",
      returnErrorSolution: "",
      returnMessage: "",
      returnValue: {
        reply: aiReply,
        resultType: "RESULT"
      }
    };

    console.log('返回响应:', JSON.stringify(response));
    res.status(200).json(response);

  } catch (error) {
    console.error('处理错误:', error);
    const errorResponse = {
      returnCode: "0",
      returnErrorSolution: "",
      returnMessage: "",
      returnValue: {
        reply: "抱歉，服务暂时不可用，请稍后再试。",
        resultType: "RESULT"
      }
    };
    res.status(200).json(errorResponse);
  }
}

// 从天猫精灵请求中提取用户问题
function extractQuestion(data) {
  try {
    // 天猫精灵的标准请求格式
    if (data && data.request && data.request.slotEntities) {
      const slots = data.request.slotEntities;
      for (const slot of slots) {
        if (slot.intentParameterId === 'question') {
          return slot.standardValue || '你好，请告诉我你想问什么？';
        }
      }
    }
    
    // 如果没找到问题，返回默认提示
    return "你好，我是AI助手，有什么可以帮你的？";
    
  } catch (error) {
    console.error('提取问题错误:', error);
    return "你好，请告诉我你想问什么？";
  }
}

// 调用DeepSeek API
async function callDeepSeek(question) {
  // 如果是问候语，直接回复
  if (!question || question.includes('你好') || question.includes('有什么可以帮你的')) {
    return "你好！我是你的AI助手，可以回答各种问题，比如天气、知识、生活建议等。请问你想了解什么？";
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个有用的AI助手，回答要简洁明了，适合语音播报，控制在80字以内。避免使用复杂符号。"
          },
          {
            role: "user", 
            content: question
          }
        ],
        stream: false,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    let reply = data.choices[0].message.content.trim();
    
    // 清理回复，移除可能影响语音的符号
    reply = reply
      .replace(/\*\*/g, '')
      .replace(/`/g, '')
      .replace(/#/g, '')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ');
    
    // 限制长度
    if (reply.length > 100) {
      reply = reply.substring(0, 100) + '...';
    }
    
    return reply || '抱歉，我没有理解你的问题。';
    
  } catch (error) {
    console.error('调用DeepSeek失败:', error);
    return "抱歉，网络有点问题，请稍后再试。";
  }
}