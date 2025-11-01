# app/config.py

# ----------------------------------------------------------------------
# 【新規追加】アプリケーションの論理的なバージョン
# ----------------------------------------------------------------------
APP_VERSION = "1.0.0"

# 燃料の標準原単位（kg-CO2/単位）
FUEL_EMISSION_FACTORS = {
    "version": "R4_2024_Public", # 令和4年度実績（2024年頃公表データ）
    "data_source": "環境省 温室効果ガス排出量 算定・報告・公表制度",
    
    "fuel": {
        "city_gas": {"unit": "kg-CO2/m3", "factor": 2.21},
        "lp_gas": {"unit": "kg-CO2/kg", "factor": 3.00},
        "kerosene": {"unit": "kg-CO2/L", "factor": 2.51}, # 灯油（ケロシン）
        "gasoline": {"unit": "kg-CO2/L", "factor": 2.32}
    }
}

# 電力係数の新しい階層構造（事業者ID > メニューID > 係数詳細）
POWER_EMISSION_FACTORS = {
    "version": "R4_2024_Public (Extended HO & HG Area)", 
    "unit": "kg-CO2/kWh",
    
    # ----------------------------------------------------
    # 【全国平均】: デフォルト値として利用
    # ----------------------------------------------------
    "national_average": {
        "basic_plan": {"factor": 0.450, "factor_type": "basic", "name": "標準電力プラン (基礎)", "source": "全国平均 R4"},
        "adjusted_plan": {"factor": 0.435, "factor_type": "adjusted", "name": "標準電力プラン (調整後)", "source": "全国平均 R4"}
    },
    
    # ----------------------------------------------------
    # 【北海道電力】
    # ----------------------------------------------------
    "hokkaido_electric": {
        "standard_plan": {"factor": 0.518, "factor_type": "basic", "name": "ほくでん 従量電灯B/C (標準)", "source": "北海道電力 R4 基礎"},
        "eco_plan": {"factor": 0.516, "factor_type": "adjusted", "name": "ほくでん 従量電灯B/C (調整後)", "source": "北海道電力 R4 調整後"}
    },
    
    # ----------------------------------------------------
    # 【トドック電力 / コープ総合サービス】
    # ----------------------------------------------------
    "todock_power": {
        "standard_plan": {
            "factor": 0.508,
            "factor_type": "basic",
            "name": "トドック電力プラン (基礎)",
            "source": "コープ総合サービス R4 基礎"
        },
        "adjusted_plan": {
            "factor": 0.451,
            "factor_type": "adjusted",
            "name": "トドック電力プラン (調整後)",
            "source": "コープ総合サービス R4 調整後"
        }
    },
    
    # ----------------------------------------------------
    # 【北海道ガス】
    # ----------------------------------------------------
    "hokkaido_gas": {
        "standard_plan": {
            "factor": 0.508,
            "factor_type": "basic",
            "name": "北ガスでんき (標準)",
            "source": "北海道ガス R4 基礎"
        },
        "adjusted_plan": {
            "factor": 0.450,
            "factor_type": "adjusted",
            "name": "北ガスでんき (調整後)",
            "source": "北海道ガス R4 調整後"
        }
    }
}