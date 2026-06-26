import pytest
from httpx import ASGITransport, AsyncClient
from src.main import app


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.anyio
async def test_health_check(client):
    async with client as c:
        resp = await c.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.anyio
async def test_rewrite_empty_text(client):
    async with client as c:
        resp = await c.post("/rewrite", json={"text": "", "style": "轻松活泼"})
    assert resp.status_code == 400


@pytest.mark.anyio
async def test_rewrite_invalid_style(client):
    async with client as c:
        resp = await c.post("/rewrite", json={"text": "hello", "style": "无效风格"})
    assert resp.status_code == 400
