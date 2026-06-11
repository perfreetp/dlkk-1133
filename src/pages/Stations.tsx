import { useState } from 'react';
import { MapPin, Plus, Settings, AlertCircle, Users, Bike, Pencil, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { clsx } from 'clsx';

export default function Stations() {
  const stations = useAppStore((s) => s.stations);
  const [selectedType, setSelectedType] = useState<string>('all');

  const typeMap: Record<string, { label: string; class: string }> = {
    normal: { label: '普通站点', class: 'bg-blue-100 text-blue-700' },
    premium: { label: '核心站点', class: 'bg-purple-100 text-purple-700' },
    restricted: { label: '限制站点', class: 'bg-amber-100 text-amber-700' },
  };

  const filteredStations = selectedType === 'all'
    ? stations
    : stations.filter(s => s.type === selectedType);

  const getOccupancyRate = (current: number, capacity: number) => Math.round((current / capacity) * 100);

  const getOccupancyColor = (rate: number) => {
    if (rate > 90) return 'from-red-400 to-red-500';
    if (rate > 70) return 'from-amber-400 to-orange-500';
    if (rate < 20) return 'from-blue-400 to-blue-500';
    return 'from-emerald-400 to-emerald-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['all', 'premium', 'normal', 'restricted'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedType === type
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              )}
            >
              {type === 'all' ? '全部站点' : typeMap[type].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            <Settings className="w-4 h-4" /> 配置禁停区
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md shadow-blue-600/30">
            <Plus className="w-4 h-4" /> 新增站点
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stations.length}</p>
              <p className="text-xs text-slate-500">站点总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Bike className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stations.reduce((s, x) => s + x.currentCount, 0)}</p>
              <p className="text-xs text-slate-500">站点车辆</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {stations.filter(s => getOccupancyRate(s.currentCount, s.capacity) > 90).length}
              </p>
              <p className="text-xs text-slate-500">饱和站点</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {stations.filter(s => getOccupancyRate(s.currentCount, s.capacity) < 20).length}
              </p>
              <p className="text-xs text-slate-500">缺车站点</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredStations.map((station) => {
          const rate = getOccupancyRate(station.currentCount, station.capacity);
          const typeCfg = typeMap[station.type];
          return (
            <div key={station.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500 mt-2">{station.lat.toFixed(4)}, {station.lng.toFixed(4)}</p>
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium', typeCfg.class)}>
                    {typeCfg.label}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex gap-1">
                  <button className="p-1.5 bg-white/90 hover:bg-white rounded-lg transition-colors">
                    <Pencil className="w-4 h-4 text-slate-600" />
                  </button>
                  <button className="p-1.5 bg-white/90 hover:bg-white rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{station.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{station.address}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-500">车辆占用</span>
                    <span className="font-semibold text-slate-700">{station.currentCount} / {station.capacity}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full bg-gradient-to-r transition-all duration-500', getOccupancyColor(rate))}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">占用率 {rate}%</span>
                    <span className={clsx(
                      'text-xs font-medium',
                      rate > 90 ? 'text-red-600' : rate < 20 ? 'text-blue-600' : 'text-emerald-600'
                    )}>
                      {rate > 90 ? '接近饱和' : rate < 20 ? '车辆不足' : '状态正常'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="flex-1 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200">
                    编辑围栏
                  </button>
                  <button className="flex-1 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    查看详情
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
