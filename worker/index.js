import { Hono } from 'hono';

const app = new Hono();

// CORS 中间件
app.use('*', async (c, next) => {
  await next();
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type');
});

// 风格提示词
const STYLE_PROMPTS = {
  '轻松活泼': '请将以下文案改写为轻松活泼的风格，使用口语化表达，适当加入感叹词和网络流行语，让读者感到亲切有趣。',
  '小红书种草': '请将以下文案改写为小红书种草风格，使用emoji表情，语气热情真诚，突出产品/服务的亮点和用户体验，适合社交媒体分享。',
  '商务': '请将以下文案改写为专业商务风格，用词严谨得体，语气正式但不生硬，适合商业邮件或正式场合使用。',
  '口播': '请将以下文案改写为口播稿风格，句子简短有力，节奏感强，适合短视频或直播口播，注意口语化和感染力。',
};

const AGNES_BASE_URL = process.env.AGNES_BASE_URL || 'https://apihub.agnes-ai.com/v1';
const AGNES_MODEL = process.env.AGNES_MODEL || 'agnes-2.0-flash';

// 健康检查
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// 改写接口
app.post('/rewrite', async (c) => {
  const { text, style } = await c.req.json();

  if (!text || !text.trim()) {
    return c.json({ error: '输入文本不能为空' }, 400);
  }

  if (!STYLE_PROMPTS[style]) {
    return c.json({ error: `不支持的风格，可选：${Object.keys(STYLE_PROMPTS).join(', ')}` }, 400);
  }

  const prompt = `${STYLE_PROMPTS[style]}\n\n原文：${text}`;

  try {
    const response = await fetch(`${AGNES_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AGNES_API_KEY}`,
      },
      body: JSON.stringify({
        model: AGNES_MODEL,
        messages: [
          { role: 'system', content: '你是一个专业的文案改写助手，擅长根据不同风格和场景调整文案表达方式。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return c.json({ error: `改写失败: ${err}` }, response.status);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;
    return c.json({ result });
  } catch (err) {
    return c.json({ error: `改写失败: ${err.message}` }, 500);
  }
});

export default app;
