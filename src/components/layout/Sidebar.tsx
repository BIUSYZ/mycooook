import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Calendar, 
  BarChart2, 
  Settings,
  ChefHat,
  Database
} from 'lucide-react';
import { clsx } from 'clsx';
import { useUIStore } from '../../store';

const navigation = [
  { name: '仪表盘', href: '/', icon: LayoutDashboard },
  { name: '食谱', href: '/recipes', icon: UtensilsCrossed },
  { name: '食材库', href: '/ingredients', icon: Database },
  { name: '膳食计划', href: '/calendar', icon: Calendar },
  { name: '统计', href: '/statistics', icon: BarChart2 },
  { name: '设置', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, closeSidebar } = useUIStore();

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className={clsx(
          "fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeSidebar}
      />

      {/* Sidebar component */}
      <div 
        className={clsx(
          "fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <ChefHat className="w-8 h-8 text-primary" />
          <span className="ml-3 text-xl font-bold text-gray-900">我的厨房</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                clsx(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )
              }
              onClick={() => {
                if (window.innerWidth < 1024) closeSidebar();
              }}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};
