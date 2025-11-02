import React, { useCallback, useMemo } from 'react';
import type { MonthlyActivity, PowerFactorsConfig } from '../types/api';

interface MonthlyInputRowProps {
  monthIndex: number;
  activity: MonthlyActivity;
  onChange: (index: number, updatedActivity: MonthlyActivity) => void;
  powerFactorsConfig: PowerFactorsConfig;
}

const getMonthName = (monthIndex: number): string => {
  const date = new Date(2000, (monthIndex + 3) % 12); // 4月始まりなので +3
  return date.toLocaleString('ja-JP', { month: 'long' });
};

// =======================================================================
// 行コンポーネント
// =======================================================================

export const MonthlyInputRow: React.FC<MonthlyInputRowProps> = ({
  monthIndex,
  activity,
  onChange,
  powerFactorsConfig,
}) => {

  const monthName = getMonthName(monthIndex);
  
  // 変更イベントハンドラ
  const handleChange = useCallback((
    field: keyof MonthlyActivity, 
    value: string | number | null
  ) => {
    // 数値フィールドの場合、空文字は 0 に変換（部分入力・未入力の許容）
    const finalValue = (typeof value === 'string' && value === '') ? 0 : value;

    const newActivity = {
      ...activity,
      [field]: finalValue,
    } as MonthlyActivity;

    // 電力事業者が変更されたら、メニューもリセット（またはデフォルト値に設定）
    if (field === 'power_supplier_id') {
      const supplierId = finalValue as string;
      const supplierKeys = Object.keys((powerFactorsConfig as any)[supplierId] || {});
      // 最初のメニューキーをデフォルトとして設定
      if (supplierKeys.length > 0) {
        newActivity.power_menu_type = supplierKeys[0]; 
      }
    }
    
    onChange(monthIndex, newActivity);
  }, [activity, monthIndex, onChange, powerFactorsConfig]);

// 事業者オプションの生成
  const supplierOptions = useMemo(() => {
    // IDと日本語表示名をマッピングするオブジェクトを定義
    const nameMap: { [key: string]: string } = {
      national_average: '全国平均',
      hokkaido_electric: '北海道電力',
      todock_power: 'トドック電力',
      hokkaido_gas: '北海道ガス',
    };
    
    return Object.entries(powerFactorsConfig)
      // versionとunitを除外し、オブジェクト型（事業者データ）のみをフィルタ
      .filter(([key, value]) => typeof value === 'object' && key !== 'version' && key !== 'unit')
      .map(([id, _supplier]) => {
        // nameMapから表示名を取得
        const name = nameMap[id] || id; 
        return { id, name };
      });
  }, [powerFactorsConfig]);

  // 選択された事業者IDからメニューオプションを生成
  const menuOptions = useMemo(() => {
    const supplierData = (powerFactorsConfig as any)[activity.power_supplier_id || ''] as Record<string, any> | undefined;
    if (!supplierData) return [];
    
    return Object.entries(supplierData).map(([id, menu]) => ({
      id,
      name: menu.name, // configファイルに定義された日本語名を使用
    }));
  }, [powerFactorsConfig, activity.power_supplier_id]);


  return (
    <div className={`grid grid-cols-12 gap-2 p-2 text-sm ${monthIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="col-span-1 font-medium pt-1">{monthName}</div>
      
      {/* 電力使用量 */}
      <div className="col-span-3">
        <input
          type="number"
          value={activity.usage_kwh || ''}
          onChange={(e) => handleChange('usage_kwh', e.target.value)}
          className="w-full border rounded px-2 py-1 text-right"
          placeholder="kWh"
          min="0"
        />
      </div>
      
      {/* 契約先 (事業者とメニュー) */}
      <div className="col-span-3 flex space-x-1">
        <select
          value={activity.power_supplier_id || ''}
          onChange={(e) => handleChange('power_supplier_id', e.target.value)}
          className="w-1/2 border rounded px-1 py-1"
        >
          {supplierOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <select
          value={activity.power_menu_type || ''}
          onChange={(e) => handleChange('power_menu_type', e.target.value)}
          className="w-1/2 border rounded px-1 py-1"
          disabled={menuOptions.length === 0}
        >
          {menuOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      {/* 都市ガス */}
      <div className="col-span-2">
        <input
          type="number"
          value={activity.usage_city_gas_m3 || ''}
          onChange={(e) => handleChange('usage_city_gas_m3', e.target.value)}
          className="w-full border rounded px-2 py-1 text-right"
          placeholder="m³"
          min="0"
        />
      </div>
      
      {/* 灯油 */}
      <div className="col-span-2">
        <input
          type="number"
          value={activity.usage_kerosene_liter || ''}
          onChange={(e) => handleChange('usage_kerosene_liter', e.target.value)}
          className="w-full border rounded px-2 py-1 text-right"
          placeholder="L"
          min="0"
        />
      </div>
      
      {/* LPG */}
      <div className="col-span-1">
        <input
          type="number"
          value={activity.usage_lpg_kg || ''}
          onChange={(e) => handleChange('usage_lpg_kg', e.target.value)}
          className="w-full border rounded px-2 py-1 text-right"
          placeholder="kg"
          min="0"
        />
      </div>
    </div>
  );
};