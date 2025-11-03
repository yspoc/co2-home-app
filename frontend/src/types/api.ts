// =======================================================================
// 1. リクエストボディの型定義 (BatchCalculationRequest)
// =======================================================================

// 月次の活動量データ (MonthlyActivity)
export interface MonthlyActivity {
  target_month: string; // "YYYY-MM" 形式 (例: "2025-04")

  // 電力情報: 使用量がある場合、事業者IDとメニューIDは必須
  // UI側では未入力の場合 null | 0 を扱い、API送信前に 0 に変換する
  usage_kwh: number;
  power_supplier_id: string | null;
  power_menu_type: string | null;
  
  // 燃料情報
  usage_city_gas_m3: number;
  usage_kerosene_liter: number;
  usage_lpg_kg: number;
}

// バッチ計算リクエスト全体の型
export interface BatchCalculationRequest {
  target_fiscal_year: number; // 計算対象の年度 (例: 2025)
  monthly_activities: MonthlyActivity[]; // 12ヶ月分のリスト
}


// =======================================================================
// 2. レスポンスボディの型定義 (BatchCalculationResponse)
// =======================================================================

// 月次の排出量サマリ (MonthlyEmissionSummary)
export interface MonthlyEmissionSummary {
  target_month: string;
  
  // 排出量 (t-CO2)
  emission_electricity: number;
  emission_city_gas: number;
  emission_kerosene: number;
  emission_lpg: number;
  emission_total_monthly: number;
}

// バッチ計算レスポンス全体の型
export interface BatchCalculationResponse {
  factors_version: string; // 係数バージョン
  annual_total_co2_kg: number; // 年間合計排出量 (kg-CO2)
  monthly_summaries: MonthlyEmissionSummary[];}

// =======================================================================
// 3. 排出係数設定の型定義 (POWER_EMISSION_FACTORS)
// =======================================================================

// 個別の排出係数メニューの定義
export interface PowerMenuConfig {
    factor: number;
    factor_type: 'basic' | 'adjusted';
    name: string;
    source: string;
}

// 特定の事業者（サプライヤー）が持つメニューの集合
export interface PowerSupplier {
    [menuId: string]: PowerMenuConfig;
}

// 電力係数設定全体の型
export interface PowerFactorsConfig {
    version: string;
    unit: string;
    // 事業者IDをキーとした、事業者の集合
    [supplierId: string]: PowerSupplier | string; // supplierId は 'national_average', 'hokkaido_electric' など
}