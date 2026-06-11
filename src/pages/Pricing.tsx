import { useState } from 'react';
import { BadgeDollarSign, Clock, MapPin, Tag, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Calculator } from 'lucide-react';
import { useAppStore } from '@/store';
import { clsx } from 'clsx';

export default function Pricing() {
  const rules = useAppStore((s) => s.pricingRules);
  const updatePricingRule = useAppStore((s) => s.updatePricingRule);
  const [calcMinutes, setCalcMinutes] = useState(30);
  const [calcKm, setCalcKm] = useState(5);
  const [calcType, setCalcType] = useState('base');

  const typeConfig: Record<string, { label: string; icon: typeof Clock; color: string; bg: string }> = {
    base: { label: '基础定价', icon: BadgeDollarSign, color: 'text-blue-600', bg: 'bg-blue-100' },
    time: { label: '时段定价', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
    area: { label: '区域定价', icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    promotion: { label: '优惠活动', icon: Tag, color: 'text-orange-600', bg: 'bg-orange-100' },
  };

  const groupedRules = {
    base: rules.filter(r => r.type === 'base'),
    time: rules.filter(r => r.type === 'time'),
    area: rules.filter(r => r.type === 'area'),
    promotion: rules.filter(r => r.type === 'promotion'),
  };

  const toggleRule = (id: string, active: boolean) => updatePricingRule(id, { active: !active });

  const currentRule = rules.find(r => r.type === calcType) || rules[0];
  const calculatePrice = () => {
    const base = currentRule?.basePrice || 2;
    const perMin = currentRule?.perMinute || 0.1;
    const perKm = currentRule?.perKm || 0.5;
    let total = base + (calcMinutes * perMin) + (calcKm * perKm);
    if (currentRule?.discount) total = total * (1 - currentRule.discount / 100);
    return total.toFixed(2);
  };

  const renderRuleCard = (rule: typeof rules[0]) => {
    const cfg = typeConfig[rule.type];
    const Icon = cfg.icon;
    return (
      <div key={rule.id} className={clsx(
        'bg-white rounded-xl p-4 shadow-sm border transition-all',
        rule.active ? 'border-slate-200' : 'border-slate-100 opacity-60'
      )}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', cfg.bg)}>
              <Icon className={clsx('w-5 h-5', cfg.color)} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">{rule.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {rule.timeRange && `时段：${rule.timeRange}`}
                {rule.area && `区域：${rule.area}`}
              </p>
            </div>
          </div>
          <button onClick={() => toggleRule(rule.id, rule.active)}>
            {rule.active
              ? <ToggleRight className="w-8 h-8 text-blue-600" />
              : <ToggleLeft className="w-8 h-8 text-slate-300" />
            }
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {rule.basePrice !== undefined && (
            <div className="flex justify-between text-sm py-1 border-b border-slate-50">
              <span className="text-slate-500">起步价</span>
              <span className="font-semibold text-slate-700">¥{rule.basePrice}</span>
            </div>
          )}
          {rule.perMinute !== undefined && (
            <div className="flex justify-between text-sm py-1 border-b border-slate-50">
              <span className="text-slate-500">时长费</span>
              <span className="font-semibold text-slate-700">¥{rule.perMinute}/分钟</span>
            </div>
          )}
          {rule.perKm !== undefined && (
            <div className="flex justify-between text-sm py-1 border-b border-slate-50">
              <span className="text-slate-500">里程费</span>
              <span className="font-semibold text-slate-700">¥{rule.perKm}/公里</span>
            </div>
          )}
          {rule.discount !== undefined && (
            <div className="flex justify-between text-sm py-1 border-b border-slate-50">
              <span className="text-slate-500">折扣</span>
              <span className="font-semibold text-orange-600">{100 - rule.discount}% OFF</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200">
            <Pencil className="w-3.5 h-3.5" /> 编辑
          </button>
          <button className="flex items-center justify-center p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-slate-200">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">价格规则管理</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md shadow-blue-600/30">
              <Plus className="w-4 h-4" /> 新增规则
            </button>
          </div>

          {(['base', 'time', 'area', 'promotion'] as const).map((type) => {
            const cfg = typeConfig[type];
            const Icon = cfg.icon;
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', cfg.bg)}>
                    <Icon className={clsx('w-4 h-4', cfg.color)} />
                  </div>
                  <h3 className="font-semibold text-slate-700">{cfg.label}</h3>
                  <span className="text-xs text-slate-400">({groupedRules[type].length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {groupedRules[type].map(renderRuleCard)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 h-fit sticky top-0">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">价格计算器</h3>
              <p className="text-xs text-slate-500">实时预估车费</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">选择规则</label>
              <select
                value={calcType}
                onChange={(e) => setCalcType(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                {rules.map(r => (
                  <option key={r.id} value={r.type}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <label className="font-medium text-slate-700">骑行时长</label>
                <span className="text-blue-600 font-semibold">{calcMinutes} 分钟</span>
              </div>
              <input
                type="range"
                min="1"
                max="120"
                value={calcMinutes}
                onChange={(e) => setCalcMinutes(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <label className="font-medium text-slate-700">骑行距离</label>
                <span className="text-blue-600 font-semibold">{calcKm} 公里</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="30"
                step="0.5"
                value={calcKm}
                onChange={(e) => setCalcKm(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-5 text-white text-center shadow-lg shadow-blue-500/30">
                <p className="text-sm text-blue-100">预估费用</p>
                <p className="text-4xl font-bold mt-1">¥{calculatePrice()}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>起步价</span>
                <span className="text-slate-700 font-medium">¥{currentRule?.basePrice || 2}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>时长费 ({calcMinutes}分钟)</span>
                <span className="text-slate-700 font-medium">¥{(calcMinutes * (currentRule?.perMinute || 0.1)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>里程费 ({calcKm}km)</span>
                <span className="text-slate-700 font-medium">¥{(calcKm * (currentRule?.perKm || 0.5)).toFixed(2)}</span>
              </div>
              {currentRule?.discount && (
                <div className="flex justify-between text-orange-500">
                  <span>优惠折扣</span>
                  <span className="font-medium">-{currentRule.discount}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
