// APIへ送信するリクエストの型 (FastAPIのCalculationRequestに対応)
export interface CalculationRequest {
  usage_kwh: number;       // 電力使用量 [kWh]
  factor_type: 'basic' | 'adjusted'; // 電力排出係数の種類
  city_gas_m3: number;     // 都市ガス使用量 [m3]
  lp_gas_kg: number;       // LPガス使用量 [kg]
  kerosene_l: number;      // 灯油使用量 [L]
  gasoline_l: number;      // ガソリン使用量 [L]
}

// 排出量の内訳の型
export interface EmissionDetail {
  source: string;        // エネルギー源 (例: 'electricity', 'city_gas')
  amount_kg_co2: number; // そのエネルギー源からの排出量 [kg-CO2]
  factor_used: number;   // 算定に使用された排出係数
  unit: string;          // 算定に使用された単位
}

// APIから受信するレスポンスの型 (FastAPIのCalculationResponseに対応)
export interface CalculationResponse {
  total_emission_kg_co2: number; // 合計排出量 [kg-CO2]
  details: EmissionDetail[];     // 内訳
  version: string;               // 係数バージョン情報
}
