# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import calculator
from .config import POWER_EMISSION_FACTORS, APP_VERSION 

app = FastAPI(
    title="CO2排出量計算API",
    description="電力と燃料の使用量に基づき、CO2排出量を算定します。排出係数には最新の環境省公表の標準原単位を利用しています。",
    version=APP_VERSION 
)

origins = [
    # 開発サーバーのURLを許可 (http://localhost:5173 ではなく、
    # npm run devで開発サーバー起動時に示され、ブラウザで開く 127.0.0.1:5173 を追加)
    "http://127.0.0.1:5173",
    "http://localhost:5173", # 念のため localhost も追加
    # フロントエンドの本番URL
    "https://co2-home-app-frontend-453499863155.asia-northeast1.run.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターの登録
app.include_router(calculator.router, prefix="/api/v1")

@app.get("/", summary="ヘルスチェック")
def read_root():
    return {"status": "ok", "service": "CO2 Emission Calculator API"}