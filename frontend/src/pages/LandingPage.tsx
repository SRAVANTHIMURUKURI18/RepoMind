import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Zap, ScanSearch, BookOpen, Code2, ShieldAlert,
  BarChart3, FileText, MessageSquareText, Star, Github,
} from 'lucide-react';
import { TypewriterText } from '../components/ui/TypewriterText';
import { useState } from 'react';

const AGENTS = [
  { icon: ScanSearch,        label: 'Repository Scanner',     color: 'from-violet-500 to-purple-500', desc: 'Detects languages, frameworks & entry points' },
  { icon: BookOpen,          label: 'Architecture Explainer',  color: 'from-blue-500 to-cyan-500',    desc: 'Explains folder structure & request flows' },
  { icon: Code2,             label: 'Code Reviewer',           color: 'from-orange-500 to-amber-500', desc: 'Finds code smells, duplicates & long functions' },
  { icon: ShieldAlert,       label: 'Security Reviewer',       color: 'from-red-500 to-rose-500',     desc: 'Detects SQLi, XSS & hardcoded secrets' },
  { icon: Zap,               label: 'Performance Analyzer',    color: 'from-yellow-500 to-amber-400', desc: 'Spots N+1 queries & async opportunities' },
  { icon: FileText,          label: 'Docs Generator',          color: 'from-green-500 to-emerald-500',desc: 'Generates README, API docs & guides' },
  { icon: MessageSquareText, label: 'Interview Generator',     color: 'from-pink-500 to-rose-400',    desc: 'Creates tiered interview questions' },
  { icon: BarChart3,         label: 'Project Score',           color: 'from-primary to-accent',       desc: 'Scores architecture, security & more' },
];

const SCORES = [
  { label: 'Architecture',    score: 9.1 },
  { label: 'Security',        score: 7.2 },
  { label: 'Performance',     score: 8.7 },
  { label: 'Documentation',   score: 5.8 },
  { label: 'Maintainability', score: 8.9 },
];

const TAGLINES = [
  'Understand any codebase in minutes.',
  'Review code like a senior engineer.',
  'Audit security vulnerabilities instantly.',
  'Generate docs automatically.',
  'Ace your technical interviews.',
];

export function LandingPage() {
  const navigate = useNavigate();
  const [taglineIdx, setTaglineIdx] = useState(0);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 backdrop-blur-xl bg-bg/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">RepoMind <span className="text-gradient-primary">AI</span></span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn-ghost hidden sm:flex">
              <Github size={16} /> GitHub
            </a>
            <button id="get-started-nav" onClick={() => navigate('/dashboard')} className="btn-primary py-2 px-4 text-sm">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
            <span className="text-sm text-primary-400 font-medium">8 Specialized AI Agents</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight text-white mb-6"
          >
            Understand Any
            <br />
            <span className="text-gradient-primary">Codebase</span> in Minutes
          </motion.h1>

          {/* Typewriter subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-slate-400 mb-10 h-8"
          >
            <TypewriterText
              key={taglineIdx}
              text={TAGLINES[taglineIdx]}
              speed={40}
              onDone={() => setTimeout(() => setTaglineIdx((i) => (i + 1) % TAGLINES.length), 1500)}
            />
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <button
              id="hero-analyze-btn"
              onClick={() => navigate('/dashboard')}
              className="btn-primary text-base px-8 py-4"
            >
              Analyze Repository <ArrowRight size={18} />
            </button>
            <button
              id="hero-demo-btn"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary text-base px-8 py-4"
            >
              View Demo
            </button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-500"
          >
            {['No account required', 'Mock mode included', 'Open source'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <Star size={12} className="text-yellow-400" />
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Scores preview ───────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white">Sample Project Analysis</h3>
              <span className="text-gradient-primary font-black text-3xl">8.3</span>
            </div>
            <div className="space-y-3">
              {SCORES.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4"
                >
                  <span className="w-36 text-sm text-slate-400 flex-shrink-0">{s.label}</span>
                  <div className="flex-1 progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(s.score / 10) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 + 0.3, duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="w-10 text-right font-bold text-slate-300 text-sm">{s.score}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Agents grid ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-white mb-4">8 Specialized AI Agents</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Each agent is purpose-built for a specific analysis task, working together to give you a complete picture of your codebase.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AGENTS.map(({ icon: Icon, label, color, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="card group cursor-default"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                  <Icon size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">{label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl font-black text-white mb-4">Start Analyzing Now</h2>
          <p className="text-slate-400 mb-8">Upload a ZIP file or paste a GitHub URL. Get comprehensive AI analysis in minutes.</p>
          <button id="cta-btn" onClick={() => navigate('/dashboard')} className="btn-primary text-base px-10 py-4">
            Analyze Repository <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-sm text-slate-600">
        RepoMind AI · Built with ❤️ using React, FastAPI & Ollama
      </footer>
    </div>
  );
}
