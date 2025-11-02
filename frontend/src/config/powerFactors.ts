import type { PowerFactorsConfig } from '../types/api';

// バックエンドの app/config.py に定義された POWER_EMISSION_FACTORS の内容を静的にコピー
// NOTE: 係数更新時はこのファイルも手動で更新が必要です。

export const POWER_FACTORS_CONFIG: PowerFactorsConfig = {
    version: "R4_2024_Public (Extended HO & HG Area)",
    unit: "kg-CO2/kWh",
    
    // 【全国平均】: デフォルト値として利用
    national_average: {
        basic_plan: {factor: 0.450, factor_type: "basic", name: "標準電力プラン (基礎)", source: "全国平均 R4"},
        adjusted_plan: {factor: 0.435, factor_type: "adjusted", name: "標準電力プラン (調整後)", source: "全国平均 R4"}
    },
    
    // 【北海道電力】
    hokkaido_electric: {
        standard_plan: {factor: 0.518, factor_type: "basic", name: "ほくでん 従量電灯B/C (標準)", source: "北海道電力 R4 基礎"},
        eco_plan: {factor: 0.516, factor_type: "adjusted", name: "ほくでん 従量電灯B/C (調整後)", source: "北海道電力 R4 調整後"}
    },
    
    // 【トドック電力 / コープ総合サービス】
    todock_power: {
        standard_plan: {
            factor: 0.508,
            factor_type: "basic",
            name: "トドック電力プラン (基礎)",
            source: "コープ総合サービス R4 基礎"
        },
        adjusted_plan: {
            factor: 0.451,
            factor_type: "adjusted",
            name: "トドック電力プラン (調整後)",
            source: "コープ総合サービス R4 調整後"
        }
    },
    
    // 【北海道ガス】
    hokkaido_gas: {
        standard_plan: {
            factor: 0.508,
            factor_type: "basic",
            name: "北ガスでんき (標準)",
            source: "北海道ガス R4 基礎"
        },
        adjusted_plan: {
            factor: 0.450,
            factor_type: "adjusted",
            name: "北ガスでんき (調整後)",
            source: "北海道ガス R4 調整後"
        }
    }
}