import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderGit2, FileText, History,
  Settings, ChevronLeft, ChevronRight, Zap,
} from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/history',    icon: History,         label: 'History'   },
  { to: '/reports',    icon: FileText,         label: 'Reports'   },
  { to: '/settings',   icon: Settings,         label: 'Settings'  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-full border-r border-white/5 bg-bg-secondary/50 backdrop-blur-sm"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-white/5 min-h-[64px]">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Zap size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden"
            >
              <span className="font-bold text-white text-base leading-none">RepoMind</span>
              <span className="block text-xs text-primary-400 leading-none mt-0.5">AI Analyzer</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = location.pathname.startsWith(to);
          return (
            <NavLink key={to} to={to}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 cursor-pointer
                  ${active
                    ? 'bg-primary/20 text-primary-400 border border-primary/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && !collapsed && (
                  <motion.div
                    layoutId="active-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400"
                  />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full rounded-xl py-2 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
