import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from openai import AsyncOpenAI
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

app = FastAPI(title="AI文案改写工具", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AGNES_BASE_URL = os.getenv("AGNES_BASE_URL", "https://apihub.agnes-ai.com/v1")
AGNES_MODEL = os.getenv("AGNES_MODEL", "agnes-2.0-flash")

_openai_client = None

def get_openai_client():
    global _openai_client
    if _openai_client is None:
        api_key = os.getenv("AGNES_API_KEY") or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="未配置 AGNES_API_KEY，请在 .env 文件中设置你的 Agnes AI API Key"
            )
        _openai_client = AsyncOpenAI(
            api_key=api_key,
            base_url=AGNES_BASE_URL,
        )
    return _openai_client

STYLE_PROMPTS = {
    "轻松活泼": "请将以下文案改写为轻松活泼的风格，使用口语化表达，适当加入感叹词和网络流行语，让读者感到亲切有趣。",
    "小红书种草": "请将以下文案改写为小红书种草风格，使用emoji表情，语气热情真诚，突出产品/服务的亮点和用户体验，适合社交媒体分享。",
    "商务": "请将以下文案改写为专业商务风格，用词严谨得体，语气正式但不生硬，适合商业邮件或正式场合使用。",
    "口播": "请将以下文案改写为口播稿风格，句子简短有力，节奏感强，适合短视频或直播口播，注意口语化和感染力。",
}

class RewriteRequest(BaseModel):
    text: str
    style: str

class RewriteResponse(BaseModel):
    result: str

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/rewrite")
async def rewrite_text(req: RewriteRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="输入文本不能为空")
    
    if req.style not in STYLE_PROMPTS:
        raise HTTPException(status_code=400, detail=f"不支持的风格，可选：{list(STYLE_PROMPTS.keys())}")
    
    prompt = f"{STYLE_PROMPTS[req.style]}\n\n原文：{req.text}"
    
    try:
        client = get_openai_client()
        response = await client.chat.completions.create(
            model=AGNES_MODEL,
            messages=[
                {"role": "system", "content": "你是一个专业的文案改写助手，擅长根据不同风格和场景调整文案表达方式。"},
                {"role": "user", "content": prompt},
            ],
            temperature=0.8,
            max_tokens=2048,
        )
        return {"result": response.choices[0].message.content}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"改写失败: {str(e)}")

frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="static")
