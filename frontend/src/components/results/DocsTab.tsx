import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, BookOpen, FolderOpen, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { DocumentationResult } from '../../types';
import { markdownReportUrl } from '../../lib/api';

interface DocsTabProps { docs: DocumentationResult; analysisId: string; }

const TABS = [
  { key: 'readme', label: 'README', icon: BookOpen },
  { key: 'folder_guide', label: 'Folder Guide', icon: FolderOpen },
  { key: 'installation_guide', label: 'Installation', icon: Terminal },
] as const;

export function DocsTab({ docs, analysisId }: DocsTabProps) {
  const [activeDoc, setActiveDoc] = useState<'readme' | 'folder_guide' | 'installation_guide'>('readme');

  const content: Record<string, string> = {
    readme: docs.readme,
    folder_guide: docs.folder_guide,
    installation_guide: docs.installation_guide,
  };

  return (
    <div className="space-y-6">
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-white text-lg">Generated Documentation</h3>
            <p className="text-sm text-slate-400 mt-1">{docs.summary}</p>
          </div>
          <a
            id="download-md-btn"
            href={markdownReportUrl(analysisId)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm py-2"
          >
            <Download size={14} /> Download Markdown
          </a>
        </div>
      </motion.div>

      {/* Doc sub-tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-0">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            id={`doc-tab-${key}`}
            onClick={() => setActiveDoc(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px
              ${activeDoc === key ? 'border-primary text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeDoc}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card prose-dark overflow-auto max-h-[600px]"
      >
        <ReactMarkdown>{content[activeDoc] ?? ''}</ReactMarkdown>
      </motion.div>
    </div>
  );
}
