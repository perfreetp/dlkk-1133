import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Bike, MapPin, Truck,
  ClipboardCheck, MessageCircle, BadgeDollarSign,
  BarChart3, Menu, X, Bell, User, ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { to: '/dashboard', label: '运营看板', icon: LayoutDashboard },
  { to: '/vehicles', label: '车辆列表', icon: Bike },
  { to: '/stations', label: '站点管理', icon: MapPin },
  { to: '/dispatch', label: '调度任务', icon: Truck },
  { to: '/inspection', label: '巡检工单', icon: ClipboardCheck },
  { to: '/complaints', label: '用户投诉', icon: MessageCircle },
  { to: '/pricing', label: '价格规则', icon: BadgeDollarSign },
  { to: '/reports', label: '报表统计', icon: BarChart3 },
];

const pageTitleMap: Record<string, string> = {
  '/dashboard': '运营看板',
  '/vehicles': '车辆列表',
  '/stations': '站点管理',
  '/dispatch': '调度任务',
  '/inspection': '巡检工单',
  '/complaints': '用户投诉',
  '/pricing': '价格规则',
  '/reports': '报表统计',
};

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const currentTitle = pageTitleMap[location.pathname] || '运营管理系统';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside
        className={clsx(
          'bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-700">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Bike className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg">骑行运营</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  collapsed ? 'justify-center' : '',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                )
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-slate-700">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-xs text-slate-400">今日订单</p>
              <p className="text-2xl font-bold text-white mt-1">8,920</p>
              <p className="text-xs text-green-400 mt-1">↑ 12.5% 较昨日</p>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{currentTitle}</h1>
            <p className="text-xs text-slate-500">欢迎回来，管理员</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700">运营管理员</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">个人设置</button>
                  <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-50">退出登录</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
