import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, LogOut, BotMessageSquare, Sparkles } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { cn } from '../../utils/cn';
import { AIAssistantPanel } from '../ui/AIAssistantPanel';

export function PageShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50/50">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 bg-white/70 backdrop-blur-xl border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-20">
        <div className="flex h-20 items-center px-8">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 shadow-lg shadow-primary-500/30 mr-3">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            AI Manager
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                              (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden',
                    isActive
                      ? 'text-primary-700 bg-primary-50/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 w-1 h-6 bg-primary-600 rounded-r-full" />
                  )}
                  <item.icon 
                    className={cn(
                      'mr-3.5 h-5 w-5 transition-transform duration-300', 
                      isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600 group-hover:scale-110'
                    )} 
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200/50 bg-slate-50/30">
          <div className="flex items-center p-3 rounded-xl hover:bg-white/60 transition-colors cursor-pointer group mb-2 border border-transparent hover:border-slate-200/50 shadow-sm hover:shadow">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-100 to-indigo-100 flex items-center justify-center text-primary-700 font-bold border border-white shadow-sm group-hover:scale-105 transition-transform">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50/50 transition-all group"
          >
            <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-slate-50/50 relative">
        <Outlet />
      </div>

      {/* AI Assistant Panel */}
      <AIAssistantPanel />
    </div>
  );
}
