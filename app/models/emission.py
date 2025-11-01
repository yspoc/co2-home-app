# app/models/emission.py

from pydantic import BaseModel, Field
from typing import Literal, Optional, List

# ----------------------------------------------------------------------
# --- 1. 月ごとの活動量入力モデル ---
# ----------------------------------------------------------------------
class MonthlyActivity(BaseModel):
    """ユーザーから受け取る月ごとの活動量データ"""
    target_month: str = Field(
        ..., 
        pattern=r"^\d{4}-\d{2}$", 
        description="計算対象月 (YYYY-MM形式, 例: '2025-04')"
    )
    
    # 電力入力
    usage_kwh: float = Field(0.0, ge=0, description="電力使用量 (kWh)")
    # 【月ごとの事業者・メニューID】
    power_supplier_id: Optional[str] = Field(
        None, 
        description="契約している電力事業者ID (例: 'hokkaido_electric')。Noneの場合は使用量0と見なす。"
    )
    power_menu_type: Optional[str] = Field(
        None, 
        description="契約している電力メニューID (例: 'standard_plan')。Noneの場合は使用量0と見なす。"
    )
    
    # 燃料入力
    city_gas_m3: float = Field(0.0, ge=0, description="都市ガス使用量 (m³)")
    lp_gas_kg: float = Field(0.0, ge=0, description="LPガス使用量 (kg)")
    kerosene_l: float = Field(0.0, ge=0, description="灯油使用量 (L)")
    gasoline_l: float = Field(0.0, ge=0, description="ガソリン使用量 (L)")


# ----------------------------------------------------------------------
# --- 2. 年度バッチ計算リクエストボディ ---
# ----------------------------------------------------------------------
class BatchCalculationRequest(BaseModel):
    """年度単位（12か月分）の計算リクエストボディ"""
    target_fiscal_year: int = Field(
        ...,              # <--- 必須フィールドであることを指定
        ge=2020, 
        description="計算対象の年度 (4月始まりの年, 例: 2025 は 2025年4月〜2026年3月)"
    )
    monthly_activities: List[MonthlyActivity] = Field(
        ...,              # <--- 必須フィールドであることを指定
        min_length=1,     # 最小要素数は1
        description="12か月分の活動量データのリスト"
    )

# ----------------------------------------------------------------------
# --- 3. 出力モデル ---
# ----------------------------------------------------------------------
class EmissionResult(BaseModel):
    """個別の排出量結果"""
    activity_type: str = Field(..., description="活動の種類 (例: electricity, city_gas)")
    usage_value: float = Field(..., description="入力された活動量 (例: 1000.5)")
    usage_unit: str = Field(..., description="活動量の単位 (例: kWh)")
    factor_used: float = Field(..., description="使用された排出係数 (kg-CO2/単位)")
    co2_kg: float = Field(..., description="算出されたCO2排出量 (kg-CO2)")


class MonthlyEmissionSummary(BaseModel):
    """月ごとの合計結果"""
    target_month: str = Field(..., description="計算対象月 (YYYY-MM)")
    total_co2_kg: float = Field(..., description="月間の合計CO2排出量 (kg-CO2)")
    details: List[EmissionResult]


class BatchCalculationResponse(BaseModel):
    """年度バッチ計算の結果レスポンス"""
    factors_version: str = Field(..., description="使用された排出係数のバージョン")
    annual_total_co2_kg: float = Field(..., description="年度全体の合計CO2排出量 (kg-CO2)")
    monthly_summaries: List[MonthlyEmissionSummary]