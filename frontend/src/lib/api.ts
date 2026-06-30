import axios from 'axios';
import type { AnalysisStatusResponse, FullResults, HistoryItem } from '../types';

const BASE = import.meta.env.VITE_API_URL ?? '';

export const api = axios.create({
  baseURL: BASE,
  timeout: 60_000,
});

// ─── Analysis ─────────────────────────────────────────────────────────────────

export async function uploadZip(file: File, onProgress?: (pct: number) => void) {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<{ analysis_id: string; repo_name: string }>('/api/analysis/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return res.data;
}

export async function analyzeGithub(github_url: string, repo_name?: string) {
  const res = await api.post<{ analysis_id: string; repo_name: string }>('/api/analysis/github', {
    github_url, repo_name,
  });
  return res.data;
}

export async function getStatus(id: string): Promise<AnalysisStatusResponse> {
  const res = await api.get<AnalysisStatusResponse>(`/api/analysis/${id}/status`);
  return res.data;
}

export async function getResults(id: string): Promise<FullResults> {
  const res = await api.get<FullResults>(`/api/analysis/${id}/results`);
  return res.data;
}

// ─── History ──────────────────────────────────────────────────────────────────

export async function getHistory(limit = 20): Promise<HistoryItem[]> {
  const res = await api.get<{ items: HistoryItem[] }>('/api/history/', { params: { limit } });
  return res.data.items;
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export function markdownReportUrl(id: string) {
  return `${BASE}/api/reports/${id}/markdown`;
}

export function pdfReportUrl(id: string) {
  return `${BASE}/api/reports/${id}/pdf`;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function checkHealth() {
  try {
    const res = await api.get('/health');
    return res.data as { status: string; mock_ai: boolean; ollama_model: string };
  } catch {
    return null;
  }
}
