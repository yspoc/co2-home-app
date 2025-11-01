# tests/test_calculator.py
from fastapi.testclient import TestClient
from app.main import app
import pytest

# TestClientを使用してFastAPIアプリケーションをロード
client = TestClient(app)

# -----------------------------------------------------------
# 💡 テストデータ: 4月と5月の2か月分
# -----------------------------------------------------------
TEST_INPUT_DATA = {
  "target_fiscal_year": 2025,
  "monthly_activities": [
    {
      # 4月：北海道電力(0.518), 都市ガス(2.21), 灯油(2.51), ガソリン(2.32)
      "target_month": "2025-04",
      "usage_kwh": 350.5,
      "power_supplier_id": "hokkaido_electric",
      "power_menu_type": "standard_plan",
      "city_gas_m3": 40.0,
      "lp_gas_kg": 0.0,
      "kerosene_l": 50.0,
      "gasoline_l": 20.0
    },
    {
      # 5月：トドック電力・調整後(0.451), 都市ガス(2.21), 灯油(2.51), ガソリン(2.32)
      "target_month": "2025-05",
      "usage_kwh": 320.0,
      "power_supplier_id": "todock_power",
      "power_menu_type": "adjusted_plan",
      "city_gas_m3": 30.5,
      "lp_gas_kg": 0.0,
      "kerosene_l": 30.0,
      "gasoline_l": 15.0
    }
  ]
}

# -----------------------------------------------------------
# 🎯 期待される計算結果 (手計算で検証済み)
# -----------------------------------------------------------
# 4月合計 (kg-CO2): (350.5 * 0.518) + (40.0 * 2.21) + (50.0 * 2.51) + (20.0 * 2.32) = 181.559 + 88.4 + 125.5 + 46.4 = 441.859
# 5月合計 (kg-CO2): (320.0 * 0.451) + (30.5 * 2.21) + (30.0 * 2.51) + (15.0 * 2.32) = 144.320 + 67.405 + 75.3 + 34.8 = 321.825
# 年度合計: 441.859 + 321.825 = 763.684

EXPECTED_ANNUAL_TOTAL = 763.684
EXPECTED_APRIL_TOTAL = 441.859
EXPECTED_MAY_TOTAL = 321.825

# -----------------------------------------------------------
# 実行するテスト関数
# -----------------------------------------------------------
def test_fiscal_year_calculation_success():
    """
    正常なデータでAPIを呼び出し、計算結果が期待値と一致することを確認する。
    """
    response = client.post("/api/v1/calculate_fiscal_year", json=TEST_INPUT_DATA)
    
    # 1. ステータスコードの検証
    assert response.status_code == 200
    
    data = response.json()
    
    # 2. 合計排出量の検証 (小数点以下3桁の丸めを考慮)
    annual_total = data["annual_total_co2_kg"]
    assert pytest.approx(annual_total) == EXPECTED_ANNUAL_TOTAL
    
    # 3. 月別合計の検証
    # 4月
    april_summary = data["monthly_summaries"][0]
    assert april_summary["target_month"] == "2025-04"
    assert pytest.approx(april_summary["total_co2_kg"]) == EXPECTED_APRIL_TOTAL
    
    # 5月
    may_summary = data["monthly_summaries"][1]
    assert may_summary["target_month"] == "2025-05"
    assert pytest.approx(may_summary["total_co2_kg"]) == EXPECTED_MAY_TOTAL

def test_missing_supplier_id_returns_error():
    """
    電力使用量があるにもかかわらず、事業者IDがない場合にエラーが返ることを確認する。
    """
    # 4月の電力情報のみを削除
    error_input = TEST_INPUT_DATA.copy()
    error_input["monthly_activities"][0]["power_supplier_id"] = None
    
    # ただし、FastAPIのPydanticモデルはデフォルトでNoneを許可しているため、
    # サーバー側でKeyErrorが発生することを確認する
    response = client.post("/api/v1/calculate_fiscal_year", json=error_input)
    
    # 係数が見つからない（KeyError）ため、HTTP 400 が返ることを期待
    assert response.status_code == 400
    
    # 【修正】検証するエラーメッセージの内容を変更
    expected_error_message_part = "電力事業者IDまたはメニューIDが指定されていません"
    assert expected_error_message_part in response.json()["detail"]