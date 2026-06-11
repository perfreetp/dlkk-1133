import { useState, useEffect } from 'react';
import {
  BadgeDollarSign, Clock, MapPin, Tag, Plus, Pencil, Trash2,
  ToggleLeft, ToggleRight, Calculator, X, CheckCircle, AlertCircle
} from 'lucide-react';
import { useAppStore } from '@/store';
import { clsx } from 'clsx';
import type { PricingRule } from '@/types';

type RuleType = PricingRule['type'];

interface FormState {
  name: string;
  type: RuleType;
  basePrice: string;
  perMinute: string;
  perKm: string;
  timeRange: string;
  area: string;
  discount: string;
  active: boolean;
}

const emptyForm: FormState = {
  name: '',
  type: 'time',
  basePrice: '',
  perMinute: '',
  perKm: '',
  timeRange: '',
  area: '',
  discount: '',
  active: true,
};

const typeConfig: Record<string, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  base: { label: '基础定价', icon: BadgeDollarSign, color: 'text-blue-600', bg: 'bg-blue-100' },
  time: { label: '时段定价', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
  area: { label: '区域定价', icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  promotion: { label: '优惠活动', icon: Tag, color: 'text-orange-600', bg: 'bg-orange-100' },
};

export default function Pricing() {
  const rules = useAppStore((s) => s.pricingRules);
  const addPricingRule = useAppStore((s) => s.addPricingRule);
  const updatePricingRule = useAppStore((s) => s.updatePricingRule);
  const deletePricingRule = useAppStore((s) => s.deletePricingRule);

  const [calcMode, setCalcMode] = useState<'single' | 'combo'>('single');
  const [calcRuleId, setCalcRuleId] = useState<string>('');
  const [baseRuleId, setBaseRuleId] = useState<string>('');
  const [timeRuleId, setTimeRuleId] = useState<string>('');
  const [areaRuleId, setAreaRuleId] = useState<string>('');
  const [promoRuleId, setPromoRuleId] = useState<string>('');
  const [calcMinutes, setCalcMinutes] = useState(30);
  const [calcKm, setCalcKm] = useState(5);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!calcRuleId && rules.length > 0) {
      setCalcRuleId(rules[0].id);
    }
  }, [rules, calcRuleId]);

  useEffect(() => {
    const baseRules = rules.filter((r) => r.type === 'base');
    if (!baseRuleId && baseRules.length > 0) {
      setBaseRuleId(baseRules[0].id);
    }
    if (baseRuleId && !baseRules.find((r) => r.id === baseRuleId)) {
      setBaseRuleId(baseRules.length > 0 ? baseRules[0].id : '');
    }
  }, [rules, baseRuleId]);

  useEffect(() => {
    const timeRules = rules.filter((r) => r.type === 'time');
    if (!timeRuleId && timeRules.length > 0) {
      setTimeRuleId(timeRules[0].id);
    }
    if (timeRuleId && !timeRules.find((r) => r.id === timeRuleId)) {
      setTimeRuleId(timeRules.length > 0 ? timeRules[0].id : '');
    }
  }, [rules, timeRuleId]);

  useEffect(() => {
    const areaRules = rules.filter((r) => r.type === 'area');
    if (!areaRuleId && areaRules.length > 0) {
      setAreaRuleId(areaRules[0].id);
    }
    if (areaRuleId && !areaRules.find((r) => r.id === areaRuleId)) {
      setAreaRuleId(areaRules.length > 0 ? areaRules[0].id : '');
    }
  }, [rules, areaRuleId]);

  useEffect(() => {
    const promoRules = rules.filter((r) => r.type === 'promotion');
    if (!promoRuleId && promoRules.length > 0) {
      setPromoRuleId(promoRules[0].id);
    }
    if (promoRuleId && !promoRules.find((r) => r.id === promoRuleId)) {
      setPromoRuleId(promoRules.length > 0 ? promoRules[0].id : '');
    }
  }, [rules, promoRuleId]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (rule: PricingRule) => {
    setEditingId(rule.id);
    setForm({
      name: rule.name,
      type: rule.type,
      basePrice: rule.basePrice !== undefined ? String(rule.basePrice) : '',
      perMinute: rule.perMinute !== undefined ? String(rule.perMinute) : '',
      perKm: rule.perKm !== undefined ? String(rule.perKm) : '',
      timeRange: rule.timeRange || '',
      area: rule.area || '',
      discount: rule.discount !== undefined ? String(rule.discount) : '',
      active: rule.active,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const updateForm = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      showToast('请输入规则名称', 'error');
      return;
    }

    const ruleData: Omit<PricingRule, 'id'> = {
      name: form.name.trim(),
      type: form.type,
      active: form.active,
    };

    if (form.type === 'base') {
      ruleData.basePrice = Number(form.basePrice) || 0;
      ruleData.perMinute = Number(form.perMinute) || 0;
      ruleData.perKm = Number(form.perKm) || 0;
    } else if (form.type === 'time') {
      ruleData.basePrice = Number(form.basePrice) || 0;
      ruleData.perMinute = Number(form.perMinute) || 0;
      ruleData.timeRange = form.timeRange.trim();
    } else if (form.type === 'area') {
      ruleData.basePrice = Number(form.basePrice) || 0;
      ruleData.perKm = Number(form.perKm) || 0;
      ruleData.area = form.area.trim();
    } else if (form.type === 'promotion') {
      ruleData.discount = Number(form.discount) || 0;
    }

    if (editingId) {
      updatePricingRule(editingId, ruleData);
      showToast('规则已更新');
    } else {
      addPricingRule(ruleData);
      showToast('规则已创建');
    }

    closeModal();
  };

  const handleDelete = (id: string) => {
    deletePricingRule(id);
    if (calcRuleId === id) {
      const remaining = rules.filter((r) => r.id !== id);
      setCalcRuleId(remaining.length > 0 ? remaining[0].id : '');
    }
    if (baseRuleId === id) {
      const remaining = rules.filter((r) => r.type === 'base' && r.id !== id);
      setBaseRuleId(remaining.length > 0 ? remaining[0].id : '');
    }
    if (timeRuleId === id) {
      const remaining = rules.filter((r) => r.type === 'time' && r.id !== id);
      setTimeRuleId(remaining.length > 0 ? remaining[0].id : '');
    }
    if (areaRuleId === id) {
      const remaining = rules.filter((r) => r.type === 'area' && r.id !== id);
      setAreaRuleId(remaining.length > 0 ? remaining[0].id : '');
    }
    if (promoRuleId === id) {
      const remaining = rules.filter((r) => r.type === 'promotion' && r.id !== id);
      setPromoRuleId(remaining.length > 0 ? remaining[0].id : '');
    }
    showToast('规则已删除');
  };

  const toggleRule = (id: string, active: boolean) => {
    updatePricingRule(id, { active: !active });
  };

  const groupedRules = {
    base: rules.filter((r) => r.type === 'base'),
    time: rules.filter((r) => r.type === 'time'),
    area: rules.filter((r) => r.type === 'area'),
    promotion: rules.filter((r) => r.type === 'promotion'),
  };

  const currentRule = rules.find((r) => r.id === calcRuleId);
  const calculatePrice = () => {
    if (!currentRule) return '0.00';
    const base = currentRule.basePrice || 0;
    const perMin = currentRule.perMinute || 0;
    const perKm = currentRule.perKm || 0;
    let total = base + calcMinutes * perMin + calcKm * perKm;
    if (currentRule.discount) total = total * (1 - currentRule.discount / 100);
    return total.toFixed(2);
  };

  const baseRule = rules.find((r) => r.id === baseRuleId);
  const timeRule = rules.find((r) => r.id === timeRuleId);
  const areaRule = rules.find((r) => r.id === areaRuleId);
  const promoRule = rules.find((r) => r.id === promoRuleId);

  const calculateCombo = () => {
    if (!baseRule) return null;

    const basePrice = baseRule.basePrice || 0;

    const basePerMinute = baseRule.perMinute || 0;
    const timePerMinute = timeRule?.perMinute || 0;
    const effectivePerMinute = Math.max(basePerMinute, timePerMinute);
    const perMinuteRule = timePerMinute >= basePerMinute && timeRule ? timeRule : baseRule;

    const basePerKm = baseRule.perKm || 0;
    const areaPerKm = areaRule?.perKm || 0;
    const effectivePerKm = Math.max(basePerKm, areaPerKm);
    const perKmRule = areaPerKm >= basePerKm && areaRule ? areaRule : baseRule;

    const minuteCost = calcMinutes * effectivePerMinute;
    const kmCost = calcKm * effectivePerKm;
    const subtotal = basePrice + minuteCost + kmCost;

    let discountAmount = 0;
    let finalTotal = subtotal;
    if (promoRule && promoRule.discount !== undefined) {
      discountAmount = subtotal * (promoRule.discount / 100);
      finalTotal = subtotal - discountAmount;
    }

    return {
      basePrice,
      baseRuleName: baseRule.name,
      effectivePerMinute,
      perMinuteRuleName: perMinuteRule.name,
      minuteCost,
      effectivePerKm,
      perKmRuleName: perKmRule.name,
      kmCost,
      subtotal,
      discount: promoRule?.discount,
      discountAmount,
      promoRuleName: promoRule?.name,
      finalTotal,
    };
  };

  const renderFormField = (label: string, field: keyof FormState, type: string = 'text', placeholder: string = '') => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[field] as string}
        onChange={(e) => updateForm(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
    </div>
  );

  const renderRuleCard = (rule: PricingRule) => {
    const cfg = typeConfig[rule.type];
    const Icon = cfg.icon;
    return (
      <div
        key={rule.id}
        className={clsx(
          'bg-white rounded-xl p-4 shadow-sm border transition-all',
          rule.active ? 'border-slate-200' : 'border-slate-100 opacity-60'
        )}
      >
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
            {rule.active ? (
              <ToggleRight className="w-8 h-8 text-blue-600" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-300" />
            )}
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
          <button
            onClick={() => openEditModal(rule)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
          >
            <Pencil className="w-3.5 h-3.5" /> 编辑
          </button>
          <button
            onClick={() => handleDelete(rule.id)}
            className="flex items-center justify-center p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  const comboResult = calculateCombo();

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={clsx(
            'fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-slide-in',
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
          )}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? '编辑规则' : '新增规则'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">规则名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  placeholder="请输入规则名称"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">规则类型</label>
                <select
                  value={form.type}
                  onChange={(e) => updateForm('type', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  {Object.entries(typeConfig).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              {(form.type === 'base' || form.type === 'time' || form.type === 'area') &&
                renderFormField('起步价 (¥)', 'basePrice', 'number', '0')}

              {(form.type === 'base' || form.type === 'time') &&
                renderFormField('时长费 (¥/分钟)', 'perMinute', 'number', '0.1')}

              {(form.type === 'base' || form.type === 'area') &&
                renderFormField('里程费 (¥/公里)', 'perKm', 'number', '0.5')}

              {form.type === 'time' &&
                renderFormField('时段范围', 'timeRange', 'text', '例如：08:00-20:00')}

              {form.type === 'area' &&
                renderFormField('区域', 'area', 'text', '例如：市中心')}

              {form.type === 'promotion' &&
                renderFormField('折扣百分比 (%)', 'discount', 'number', '20')}

              <div className="flex items-center gap-3 pt-1">
                <label className="text-sm font-medium text-slate-700">启用状态</label>
                <button
                  type="button"
                  onClick={() => updateForm('active', !form.active)}
                  className="focus:outline-none"
                >
                  {form.active ? (
                    <ToggleRight className="w-8 h-8 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-300" />
                  )}
                </button>
                <span className={clsx('text-sm', form.active ? 'text-blue-600 font-medium' : 'text-slate-400')}>
                  {form.active ? '已启用' : '已禁用'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md shadow-blue-600/30"
              >
                {editingId ? '保存修改' : '创建规则'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">价格规则管理</h2>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md shadow-blue-600/30"
            >
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

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 h-fit sticky top-0 lg:col-span-1">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">价格计算器</h3>
              <p className="text-xs text-slate-500">实时预估车费</p>
            </div>
          </div>

          <div className="mb-5">
            <div className="bg-slate-100 rounded-lg p-1 flex">
              <button
                onClick={() => setCalcMode('single')}
                className={clsx(
                  'flex-1 py-2 text-sm font-medium rounded-md transition-all',
                  calcMode === 'single'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                单规则试算
              </button>
              <button
                onClick={() => setCalcMode('combo')}
                className={clsx(
                  'flex-1 py-2 text-sm font-medium rounded-md transition-all',
                  calcMode === 'combo'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                组合试算
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {calcMode === 'single' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">选择规则</label>
                <select
                  value={calcRuleId}
                  onChange={(e) => setCalcRuleId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  {rules.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <span className="inline-flex items-center gap-1">
                      <BadgeDollarSign className="w-3.5 h-3.5 text-blue-600" />
                      基础定价
                    </span>
                  </label>
                  <select
                    value={baseRuleId}
                    onChange={(e) => setBaseRuleId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    {groupedRules.base.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      时段定价
                    </span>
                  </label>
                  <select
                    value={timeRuleId}
                    onChange={(e) => setTimeRuleId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="">不使用</option>
                    {groupedRules.time.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      区域定价
                    </span>
                  </label>
                  <select
                    value={areaRuleId}
                    onChange={(e) => setAreaRuleId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="">不使用</option>
                    {groupedRules.area.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <span className="inline-flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-orange-600" />
                      优惠活动
                    </span>
                  </label>
                  <select
                    value={promoRuleId}
                    onChange={(e) => setPromoRuleId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="">不使用</option>
                    {groupedRules.promotion.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

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

            {calcMode === 'single' ? (
              <>
                <div className="pt-4 border-t border-slate-100">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-5 text-white text-center shadow-lg shadow-blue-500/30">
                    <p className="text-sm text-blue-100">预估费用</p>
                    <p className="text-4xl font-bold mt-1">¥{calculatePrice()}</p>
                  </div>
                </div>

                {currentRule && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>起步价</span>
                      <span className="text-slate-700 font-medium">¥{currentRule.basePrice || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>时长费 ({calcMinutes}分钟)</span>
                      <span className="text-slate-700 font-medium">
                        ¥{(calcMinutes * (currentRule.perMinute || 0)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>里程费 ({calcKm}km)</span>
                      <span className="text-slate-700 font-medium">
                        ¥{(calcKm * (currentRule.perKm || 0)).toFixed(2)}
                      </span>
                    </div>
                    {currentRule.discount !== undefined && currentRule.discount > 0 && (
                      <div className="flex justify-between text-orange-500">
                        <span>优惠折扣</span>
                        <span className="font-medium">-{currentRule.discount}%</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                {comboResult ? (
                  <>
                    <div className="pt-4 border-t border-slate-100">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-5 text-white text-center shadow-lg shadow-blue-500/30">
                        <p className="text-sm text-blue-100">应付金额</p>
                        <p className="text-4xl font-bold mt-1">¥{comboResult.finalTotal.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between text-slate-500">
                        <span>起步价 ({comboResult.baseRuleName})</span>
                        <span className="text-slate-700 font-medium">¥{comboResult.basePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>时长费 ({comboResult.perMinuteRuleName}, ¥{comboResult.effectivePerMinute}/min × {calcMinutes})</span>
                        <span className="text-slate-700 font-medium">¥{comboResult.minuteCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>里程费 ({comboResult.perKmRuleName}, ¥{comboResult.effectivePerKm}/km × {calcKm})</span>
                        <span className="text-slate-700 font-medium">¥{comboResult.kmCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                        <span className="font-medium">小计</span>
                        <span className="font-semibold">¥{comboResult.subtotal.toFixed(2)}</span>
                      </div>
                      {comboResult.discount !== undefined && comboResult.discount > 0 && (
                        <div className="flex justify-between text-orange-500">
                          <span>优惠折扣 ({comboResult.promoRuleName}, -{comboResult.discount}%)</span>
                          <span className="font-medium">-¥{comboResult.discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="pt-4 border-t border-slate-100">
                    <div className="bg-slate-100 rounded-xl p-5 text-center">
                      <p className="text-sm text-slate-500">请先创建基础定价规则</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
