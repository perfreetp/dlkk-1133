import {
  Bike, Signal, Zap, AlertTriangle, TrendingUp, AlertCircle,
  MapPin, Battery
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import StatCard from '@/components/StatCard';
import { useAppStore } from '@/store';
import { mockOrderTrend, mockAlerts, hotZones } from '@/data/mockData';
import StatusBadge from '@/components/StatusBadge';
import { clsx } from 'clsx';

export default function Dashboard() {
  const vehicles = useAppStore((s) => s.vehicles);
  const stations = useAppStore((s) => s.stations);

  const totalVehicles = vehicles.length;
  const onlineCount = vehicles.filter(v => v.status === 'online' || v.status === 'riding').length;
  const rideableCount = vehicles.filter(v => v.status === 'online' && v.battery > 20).length;
  const lowBatteryCount = vehicles.filter(v => v.battery < 20).length;
  const abnormalParking = vehicles.filter(v => !v.stationId && v.status !== 'riding').length;

  const alertIconMap: Record<string, typeof AlertCircle> = {
    low_battery: Battery,
    abnormal_parking: MapPin,
    offline: Signal,
    fault: AlertTriangle,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="车辆总数" value={totalVehicles} icon={<Bike className="w-6 h-6" />} color="blue" trend="3.2%" trendUp />
        <StatCard title="在线车辆" value={onlineCount} icon={<Signal className="w-6 h-6" />} color="green" trend="5.1%" trendUp />
        <StatCard title="可骑车辆" value={rideableCount} icon={<Bike className="w-6 h-6" />} color="purple" trend="2.8%" trendUp />
        <StatCard title="低电量" value={lowBatteryCount} icon={<Zap className="w-6 h-6" />} color="orange" trend="8.3%" trendUp={false} />
        <StatCard title="异常停放" value={abnormalParking} icon={<AlertTriangle className="w-6 h-6" />} color="red" trend="15%" trendUp={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">订单走势</h3>
              <p className="text-sm text-slate-500">近7日订单量和营收</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium">近7日</span>
              <span className="text-xs px-3 py-1.5 text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer">近30日</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockOrderTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="orders" name="订单量" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" name="营收(元)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">实时告警</h3>
            <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full font-medium">{mockAlerts.length} 条</span>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {mockAlerts.map((alert) => {
              const Icon = alertIconMap[alert.type] || AlertCircle;
              return (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    alert.type === 'low_battery' && 'bg-orange-100 text-orange-600',
                    alert.type === 'abnormal_parking' && 'bg-amber-100 text-amber-600',
                    alert.type === 'offline' && 'bg-slate-200 text-slate-600',
                    alert.type === 'fault' && 'bg-red-100 text-red-600',
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">{alert.vehicleCode}</span>
                      <StatusBadge status={alert.type === 'fault' ? 'maintenance' : 'online'} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{alert.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">骑行热区 TOP 8</h3>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {hotZones.map((zone, idx) => (
              <div key={zone.name} className="flex items-center gap-4">
                <span className={clsx(
                  'w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white',
                  idx < 3 ? 'bg-gradient-to-br from-orange-400 to-red-500' : 'bg-slate-200 text-slate-600'
                )}>
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-slate-700 w-24">{zone.name}</span>
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${(zone.rides / hotZones[0].rides) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-slate-700 w-16 text-right">{zone.rides} 次</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">站点车辆分布</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stations.map(s => ({ name: s.name, 当前: s.currentCount, 容量: s.capacity }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="容量" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="当前" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
