import React, { useState, useCallback } from 'react';
import type { MonthlyActivity, BatchCalculationRequest, BatchCalculationResponse } from '../types/api';
import { POWER_FACTORS_CONFIG } from '../config/powerFactors';
import { MonthlyInputRow } from './MonthlyInputRow.tsx'; // ステップ5で作成

// 初期データ生成ロジック
const generateInitialMonthlyData = (year: number): MonthlyActivity[] => {
  const activities: MonthlyActivity[] = [];
  // 4月から翌年3月までの12ヶ月を生成
  for (let i = 0; i < 12; i++) {
    const month = (i + 4) % 12 || 12; // 4, 5, ..., 12, 1, 2, 3
    let targetYear = year;
    if (month >= 1 && month <= 3) {
      targetYear = year + 1; // 翌年1月〜3月
    }

    activities.push({
      target_month: `${targetYear}-${String(month).padStart(2, '0')}`,
      usage_kwh: 0,
      power_supplier_id: 'hokkaido_electric', // デフォルト値
      power_menu_type: 'standard_plan', // デフォルト値
      usage_city_gas_m3: 0,
      usage_kerosene_liter: 0,
      usage_lpg_kg: 0,
    });
  }
  return activities;
};

// =======================================================================
// メインコンポーネント
// =======================================================================

const AnnualInputTable: React.FC = () => {
  const currentFiscalYear = 2025; // 2025年度から開始と仮定
  const [monthlyActivities, setMonthlyActivities] = useState<MonthlyActivity[]>(
    generateInitialMonthlyData(currentFiscalYear)
  );
  const [results, setResults] = useState<BatchCalculationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 月ごとの入力変更を処理するハンドラ
  const handleMonthlyChange = useCallback((index: number, updatedActivity: MonthlyActivity) => {
    setMonthlyActivities(prevActivities => {
      const newActivities = [...prevActivities];
      newActivities[index] = updatedActivity;
      return newActivities;
    });
  }, []);

  // APIコール関数
  const calculateEmissions = async () => {
    setError(null);
    setIsLoading(true);

    // APIリクエストのペイロードを作成
    const requestBody: BatchCalculationRequest = {
      target_fiscal_year: currentFiscalYear,
      // NOTE: 0 と null の扱い:
      // フロントエンドでは未入力（ユーザーが触っていない）を 0 として扱い、
      // バックエンドAPIは 0 の場合は計算をスキップするロジックを期待する。
      // 現状、生成ロジックで全て 0 に初期化しているため、ここではそのまま送信。
      monthly_activities: monthlyActivities.map(activity => ({
        ...activity,
        // 数値入力欄が空文字で送信される可能性があるため、明示的に 0 に変換
        usage_kwh: Number(activity.usage_kwh) || 0,
        usage_city_gas_m3: Number(activity.usage_city_gas_m3) || 0,
        usage_kerosene_liter: Number(activity.usage_kerosene_liter) || 0,
        usage_lpg_kg: Number(activity.usage_lpg_kg) || 0,
      }))
    };

    try {
      const apiUrl = 'https://co2-calculator-api-453499863155.asia-northeast1.run.app/api/v1/calculate_fiscal_year'; // <--- ★あなたのデプロイURLに合わせて修正
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data: BatchCalculationResponse = await response.json();
      setResults(data);
    } catch (e) {
      setError(`計算中にエラーが発生しました: ${(e as Error).message}`);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">
        {currentFiscalYear}年度使用量入力
      </h2>

      {/* エラー表示 */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* 入力テーブルヘッダー */}
      <div className="grid grid-cols-12 gap-2 text-sm font-medium bg-gray-100 p-2 rounded-t-lg">
        <div className="col-span-1">月</div>
        <div className="col-span-3 text-center">電力 (kWh)</div>
        <div className="col-span-3 text-center">電力メニュー</div>
        <div className="col-span-2 text-center">都市ガス (m³)</div>
        <div className="col-span-2 text-center">灯油 (L)</div>
        <div className="col-span-1 text-center">LPG (kg)</div>
      </div>

      {/* 月ごとの入力行 */}
      {monthlyActivities.map((activity, index) => (
        <MonthlyInputRow
          key={activity.target_month}
          monthIndex={index}
          activity={activity}
          onChange={handleMonthlyChange}
          // 係数データを渡す
          powerFactorsConfig={POWER_FACTORS_CONFIG}
        />
      ))}

      {/* 計算ボタン */}
      <div className="mt-6 pt-4 border-t flex justify-end">
        <button
          onClick={calculateEmissions}
          disabled={isLoading}
          className={`px-6 py-2 rounded-lg text-white font-semibold transition-colors ${
            isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isLoading ? '計算中...' : 'CO2 排出量を計算'}
        </button>
      </div>
      
      {/* 結果表示 (次のステップでMonthlyResultsコンポーネントに置き換え) */}
      {results && (
        <div className="mt-8 p-4 border rounded-lg bg-green-50">
          <h3 className="text-lg font-bold mb-2">年間合計排出量: {results.emission_total_annual.toFixed(3)} t-CO2</h3>
          <p className="text-sm text-gray-600">（詳細はコンソールを確認してください）</p>
        </div>
      )}
    </div>
  );
};

export default AnnualInputTable;