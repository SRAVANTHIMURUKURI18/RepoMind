import { Moon, Sun, Bell, Search, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Navbar() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <header className="h-16 border-b border-white/5 bg-bg-secondary/30 backdrop-blur-sm flex items-center px-6 gap-4">
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="navbar-search"
            type="text"
            placeholder="Search analyses…"
            className="input pl-9 py-2 text-xs"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Mock AI indicator */}
        <motion.div
          animate={{ opacity: [0.7, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="hidden sm:flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1"
        >
          <Zap size={11} className="text-primary-400" />
          <span className="text-xs text-primary-400 font-medium">Mock Mode</span>
        </motion.div>

        {/* Dark / Light toggle */}
        <button
          id="theme-toggle"
          onClick={() => setDark(!dark)}
          className="btn-ghost rounded-lg p-2"
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notification */}
        <button id="notifications-btn" className="btn-ghost rounded-lg p-2 relative" aria-label="Notifications">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary-400" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
          R
        </div>
      </div>
    </header>
  );
}
