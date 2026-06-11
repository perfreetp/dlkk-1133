import { useState } from 'react';
import {
  BarChart3, TrendingUp, Users, Zap, Download, Calendar,
  Bike, AlertTriangle, Award
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { mockOrderTrend, hotZones, faultTrend, mockStaffPerformance } from '@/data/mockData';
import { useAppStore } from '@/store';
import StatCard from '@/components/StatCard';
import { clsx } from 'clsx';

export default function Reports() {
  const vehicles = useAppStore((s) => s.vehicles);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('week');

  const turnoverRate = (vehicles.length * 4.5).toFixed(1);
  const avgRides = (8920 / vehicles.length).toFixed(1);
  const faultRate = ((vehicles.filter(v => v.status === 'maintenance').length / vehicles.length) * 100).toFixed(1);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const faultTypeData = [
    { name: '轮胎故障', value: faultTrend.reduce((s, d) => s + d.tire, 0) },
    { name: '电池故障', value: faultTrend.reduce((s, d) => s + d.battery, 0) },
    { name: '刹车故障', value: faultTrend.reduce((s, d) => s + d.brake, 0) },
    { name: '车锁故障', value: faultTrend.reduce((s, d) => s + d.lock, 0) },
  ];

  const radarData = [
    { subject: '调度效率', A: 85, fullMark: 100 },
    { subject: '巡检及时', A: 78, fullMark: 100 },
    { subject: '车辆可用', A: 92, fullMark: 100 },
    { subject: '用户满意', A: 88, fullMark: 100 },
    { subject: '故障处理', A: 75, fullMark: 100 },
    { subject: '成本控制', A: 82, fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
          {(['week', 'month', 'quarter'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={clsx(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5',
                period === p ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <Calendar className="w-4 h-4" />
              {p === 'week' ? '本周' : p === 'month' ? '本月' : '本季度'}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md shadow-blue-600/30">
          <Download className="w-4 h-4" /> 导出报表
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="平均周转率" value={`${turnoverRate} 次/日`} icon={<TrendingUp className="w-6 h-6" />} color="blue" trend="8.2%" trendUp />
        <StatCard title="日均骑行次数" value={`${avgRides} 次`} icon={<Bike className="w-6 h-6" />} color="green" trend="5.6%" trendUp />
        <StatCard title="车辆故障率" value={`${faultRate}%`} icon={<AlertTriangle className="w-6 h-6" />} color="orange" trend="2.1%" trendUp={false} />
        <StatCard title="人均处理任务" value="26 个" icon={<Users className="w-6 h-6" />} color="purple" trend="12.3%" trendUp />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">订单与营收趋势</h3>
              <p className="text-xs text-slate-500">近期订单量和营收变化</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockOrderTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="orders" name="订单量" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                <Line type="monotone" dataKey="revenue" name="营收(元)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">骑行热区分布</h3>
              <p className="text-xs text-slate-500">各区域骑行热度排名</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hotZones} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="rides" name="骑行次数" radius={[0, 6, 6, 0]}>
                  {hotZones.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">故障分类统计</h3>
              <p className="text-xs text-slate-500">各类故障占比分析</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={faultTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {faultTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">故障趋势</h3>
              <p className="text-xs text-slate-500">近期各类故障数量变化</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={faultTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="battery" name="电池" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="brake" name="刹车" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tire" name="轮胎" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lock" name="车锁" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">运营综合评估</h3>
              <p className="text-xs text-slate-500">各项指标雷达图</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                <PolarRadiusAxis stroke="#94a3b8" fontSize={10} />
                <Radar name="评分" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">人员绩效排名</h3>
              <p className="text-xs text-slate-500">调度员与巡检员工作量统计</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">排名</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">姓名</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">角色</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">完成任务</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">完成率</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">平均响应</th>
                </tr>
              </thead>
              <tbody>
                {mockStaffPerformance
                  .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
                  .map((staff, idx) => {
                    const rate = Math.round((staff.tasksCompleted / staff.tasksTotal) * 100);
                    return (
                      <tr key={staff.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className={clsx(
                            'w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white',
                            idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                            idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
                            idx === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600' :
                            'bg-slate-200 text-slate-600'
                          )}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {staff.name.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-700">{staff.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={clsx(
                            'px-2.5 py-1 rounded-full text-xs font-medium',
                            staff.role === 'dispatcher' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                          )}>
                            {staff.role === 'dispatcher' ? '调度员' : '巡检员'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-700">{staff.tasksCompleted}</span>
                          <span className="text-slate-400 text-sm">/{staff.tasksTotal}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={clsx(
                                  'h-full rounded-full',
                                  rate >= 90 ? 'bg-emerald-500' : rate >= 75 ? 'bg-blue-500' : 'bg-amber-500'
                                )}
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{rate}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">{staff.avgResponseTime}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
