# AI文案改写工具

> 用户输入文本后，调用 OpenAI API 进行文案改写，支持不同风格输出。

- 项目编号：016
- 创建日期：2026-06-26
- 负责人：huang
- 状态：进行中

## 项目目标

构建一个可运行的网页应用，用户输入文本后，调用 OpenAI API 进行文案改写，并支持不同风格输出。

## 技术栈

- Frontend: HTML + CSS + Vanilla JS
- Backend: Python FastAPI
- AI API: OpenAI GPT-4o-mini
- CORS: 允许跨域请求

## 目录结构

- src/ - 后端代码（FastAPI）
- rontend/ - 前端页面（HTML/CSS/JS）
- docs/ - 项目文档
- 	est/ - 测试代码
- ssets/ - 静态资源
- logs/ - 运行日志
- uild/ - 构建输出

## 使用方法

1. 安装依赖：pip install -r requirements.txt
2. 设置环境变量：复制 .env.example 为 .env 并填入 AGNES_API_KEY
   - 如果 `gpt-4o-mini` 在你的账户中不可用，请将 `AGNES_MODEL` 改为 `gpt-3.5-turbo` 或可用的模型。
3. 启动后端：uvicorn src.main:app --reload
4. 在浏览器中访问后端服务：http://127.0.0.1:8000

## 变更记录

| 日期 | 变更内容 | 备注 |
|------|----------|------|
| 2026-06-26 | 项目创建 | 初始版本 |
