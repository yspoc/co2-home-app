# app/routers/calculator.py

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Tuple, List

# Pydanticモデルと定数定義を更新
from ..models.emission import (
    BatchCalculationRequest, BatchCalculationResponse,
    MonthlyActivity, MonthlyEmissionSummary, EmissionResult
)
from ..config import FUEL_EMISSION_FACTORS, POWER_EMISSION_FACTORS

router = APIRouter()

# ----------------------------------------------------------------------
# 【新規】月ごとのCO2排出量を計算するコアロジック関数
# ----------------------------------------------------------------------
def calculate_monthly_emission(activity: MonthlyActivity) -> MonthlyEmissionSummary:
    """
    MonthlyActivityに基づき、単月分のCO2排出量を計算する。
    """
    total_co2_kg = 0.0
    details: List[EmissionResult] = []
    
    # 1. 電力排出量の計算 (月ごとの事業者・メニューIDを使用)
    if activity.usage_kwh > 0:
        supplier_id = activity.power_supplier_id
        menu_id = activity.power_menu_type

        #必須項目チェック
        if not supplier_id or not menu_id:
            raise HTTPException(
                status_code=400, 
                detail=f"電力使用量 ({activity.usage_kwh}kWh) が0ではありませんが、電力事業者IDまたはメニューIDが指定されていません。(月: {activity.target_month})"
            )

        try:
            # 係数検索処理
            elec_config = POWER_EMISSION_FACTORS.get(supplier_id, {}).get(menu_id)
            if not elec_config:
                # ユーザーの入力ミスや設定不足
                raise KeyError("指定された電力事業者またはメニューIDが見つかりません。")
                
            factor = elec_config["factor"]
            unit_str = POWER_EMISSION_FACTORS["unit"] # 'kg-CO2/kWh'
            usage_unit = unit_str.split('/')[-1] # kWh
            
            co2_kg = activity.usage_kwh * factor
            total_co2_kg += co2_kg
            
            details.append(EmissionResult(
                activity_type="electricity",
                usage_value=activity.usage_kwh,
                usage_unit=usage_unit,
                factor_used=factor,
                co2_kg=round(co2_kg, 3)
            ))
            
        except KeyError as e:
            raise HTTPException(status_code=400, detail=f"電力係数エラー (月: {activity.target_month}): {e}")

    # 2. 燃料排出量の計算
    fuel_config_map = FUEL_EMISSION_FACTORS["fuel"]
    
    fuel_activities: Dict[str, Tuple[float, str]] = {
        "city_gas": (activity.city_gas_m3, "m³"),
        "lp_gas": (activity.lp_gas_kg, "kg"),
        "kerosene": (activity.kerosene_l, "L"),
        "gasoline": (activity.gasoline_l, "L"),
    }

    for fuel_key, (usage_value, usage_unit) in fuel_activities.items():
        if usage_value > 0:
            fuel_data = fuel_config_map.get(fuel_key)
            if fuel_data:
                factor = fuel_data["factor"]
                co2_kg = usage_value * factor
                total_co2_kg += co2_kg
                
                details.append(EmissionResult(
                    activity_type=fuel_key,
                    usage_value=usage_value,
                    usage_unit=usage_unit,
                    factor_used=factor,
                    co2_kg=round(co2_kg, 3)
                ))

    # 月ごとの集計結果を返す
    return MonthlyEmissionSummary(
        target_month=activity.target_month,
        total_co2_kg=round(total_co2_kg, 3),
        details=details
    )


# ----------------------------------------------------------------------
# 【新規APIエンドポイント】年度バッチ計算
# ----------------------------------------------------------------------
@router.post(
    "/calculate_fiscal_year", 
    response_model=BatchCalculationResponse, 
    summary="年度単位のCO2排出量バッチ計算"
)
def calculate_annual_emissions(request: BatchCalculationRequest):
    """
    12か月分の活動量リストに基づき、年度全体のCO2排出量を計算し、月別および年度合計を返します。
    """
    annual_total_co2_kg = 0.0
    monthly_summaries: List[MonthlyEmissionSummary] = []
    
    # 全ての月をループ処理
    for activity in request.monthly_activities:
        # 月ごとの計算ロジックを呼び出す
        monthly_summary = calculate_monthly_emission(activity)
        
        # 結果を集計
        monthly_summaries.append(monthly_summary)
        annual_total_co2_kg += monthly_summary.total_co2_kg
        
    # 最終レスポンスの作成
    factors_version = POWER_EMISSION_FACTORS["version"]
    
    return BatchCalculationResponse(
        factors_version=factors_version,
        annual_total_co2_kg=round(annual_total_co2_kg, 3),
        monthly_summaries=monthly_summaries
    )

# ----------------------------------------------------------------------
# 【注記】従来の /calculate エンドポイントは削除または無効化が必要です。
# ----------------------------------------------------------------------