// TypeScript interfaces for RepoMind AI

export type AnalysisStatus = 'pending' | 'running' | 'completed' | 'failed';
export type AgentStatus    = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
export type Severity       = 'critical' | 'high' | 'medium' | 'low';
export type Impact         = 'high' | 'medium' | 'low';
export type InterviewLevel = 'beginner' | 'intermediate' | 'advanced' | 'system_design' | 'coding';

// ─── Agent progress ────────────────────────────────────────────────────────────
export interface AgentProgress {
  agent_id:     string;
  agent_name:   string;
  status:       AgentStatus;
  progress:     number;
  started_at:   string | null;
  completed_at: string | null;
  error:        string | null;
}

export interface AnalysisStatusResponse {
  id:         string;
  status:     AnalysisStatus;
  repo_name:  string;
  agents:     AgentProgress[];
  created_at: string;
  error:      string | null;
}

// ─── History ───────────────────────────────────────────────────────────────────
export interface HistoryItem {
  id:           string;
  repo_name:    string;
  repo_url:     string | null;
  source_type:  string;
  status:       AnalysisStatus;
  created_at:   string;
  language:     string | null;
  framework:    string | null;
  overall_score: number | null;
}

// ─── Repository scan ──────────────────────────────────────────────────────────
export interface FileNode {
  name:     string;
  path:     string;
  type:     'file' | 'directory';
  children: FileNode[];
  size:     number | null;
  language: string | null;
}

export interface RepositoryResult {
  languages:        string[];
  primary_language: string;
  frameworks:       string[];
  entry_points:     string[];
  file_tree:        FileNode[];
  total_files:      number;
  total_lines:      number;
  summary:          string;
}

// ─── Architecture ─────────────────────────────────────────────────────────────
export interface ArchitectureSection {
  title:       string;
  description: string;
  details:     string[];
}

export interface ArchitectureResult {
  overview:     string;
  sections:     ArchitectureSection[];
  tech_stack:   string[];
  request_flow: string;
  api_design:   string | null;
  auth_pattern: string | null;
  database_design: string | null;
}

// ─── Code review ──────────────────────────────────────────────────────────────
export interface CodeIssue {
  id:          string;
  severity:    Severity;
  category:    string;
  title:       string;
  description: string;
  file_path:   string | null;
  line_number: number | null;
  suggestion:  string;
}

export interface ReviewResult {
  issues:         CodeIssue[];
  total_issues:   number;
  critical_count: number;
  high_count:     number;
  medium_count:   number;
  low_count:      number;
  summary:        string;
  overall_quality: string;
}

// ─── Security ─────────────────────────────────────────────────────────────────
export interface SecurityVulnerability {
  id:             string;
  vuln_type:      string;
  severity:       Severity;
  title:          string;
  description:    string;
  file_path:      string | null;
  line_number:    number | null;
  recommendation: string;
  cwe_id:         string | null;
}

export interface SecurityResult {
  vulnerabilities: SecurityVulnerability[];
  total_issues:    number;
  critical_count:  number;
  high_count:      number;
  risk_level:      string;
  summary:         string;
  recommendations: string[];
}

// ─── Performance ──────────────────────────────────────────────────────────────
export interface PerformanceFinding {
  id:          string;
  category:    string;
  impact:      Impact;
  title:       string;
  description: string;
  file_path:   string | null;
  suggestion:  string;
}

export interface PerformanceResult {
  findings:           PerformanceFinding[];
  total_findings:     number;
  high_impact:        number;
  summary:            string;
  top_recommendations: string[];
}

// ─── Documentation ────────────────────────────────────────────────────────────
export interface DocumentationResult {
  readme:             string;
  api_docs:           string | null;
  folder_guide:       string;
  installation_guide: string;
  summary:            string;
}

// ─── Interview ────────────────────────────────────────────────────────────────
export interface InterviewQuestion {
  id:       string;
  level:    InterviewLevel;
  topic:    string;
  question: string;
  hint:     string | null;
}

export interface InterviewResult {
  questions:   InterviewQuestion[];
  total:       number;
  by_level:    Record<InterviewLevel, InterviewQuestion[]>;
  focus_areas: string[];
}

// ─── Scores ───────────────────────────────────────────────────────────────────
export interface CategoryScore {
  category:     string;
  score:        number;
  reasoning:    string;
  improvements: string[];
}

export interface ScoringResult {
  architecture:    CategoryScore;
  security:        CategoryScore;
  performance:     CategoryScore;
  documentation:   CategoryScore;
  maintainability: CategoryScore;
  overall:         number;
  grade:           string;
  summary:         string;
}

// ─── Full results ─────────────────────────────────────────────────────────────
export interface FullResults {
  id:         string;
  repo_name:  string;
  status:     AnalysisStatus;
  language:   string | null;
  framework:  string | null;
  file_count: number;
  created_at: string;
  results: {
    repository?:    RepositoryResult;
    architecture?:  ArchitectureResult;
    review?:        ReviewResult;
    security?:      SecurityResult;
    performance?:   PerformanceResult;
    documentation?: DocumentationResult;
    interview?:     InterviewResult;
    scoring?:       ScoringResult;
  };
}
