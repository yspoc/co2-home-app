# app/main.py

from fastapi import FastAPI
from .routers import calculator
from .config import POWER_EMISSION_FACTORS, APP_VERSION 

app = FastAPI(
    title="CO2排出量計算API",
    description="電力と燃料の使用量に基づき、CO2排出量を算定します。排出係数には最新の環境省公表の標準原単位を利用しています。",
    version=APP_VERSION 
)

# ルーターの登録
app.include_router(calculator.router, prefix="/api/v1")

@app.get("/", summary="ヘルスチェック")
def read_root():
    return {"status": "ok", "service": "CO2 Emission Calculator API"}