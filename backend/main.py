import time
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import CORS_ORIGINS, FRONTEND_BUILD_DIR
from routers import analyze

app = FastAPI(
    title="WriteLens API",
    description="AI-Generated Text Detection — Educational Self-Assessment Tool",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Latency-Ms"],
)


@app.middleware("http")
async def log_latency(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    latency_ms = (time.perf_counter() - start) * 1000
    response.headers["X-Latency-Ms"] = f"{latency_ms:.1f}"
    return response


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "writelens-api"}


app.include_router(analyze.router, prefix="/api")


if FRONTEND_BUILD_DIR.exists():
    app.mount(
        "/",
        StaticFiles(directory=str(FRONTEND_BUILD_DIR), html=True),
        name="static",
    )
