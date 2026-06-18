import { useState } from 'react';
import { Link2, Loader2, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import './LeetcodeImport.css';

interface Props {
  patterns: { id: string; name: string }[];
  onClose: () => void;
  onImported?: (problem: any, patternId: string) => void;
}

export default function LeetcodeImport({ patterns, onClose, onImported }: Props) {
  const [url, setUrl] = useState('');
  const [selectedPattern, setSelectedPattern] = useState(patterns[0]?.id || '');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [problem, setProblem] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    if (!url.trim()) return;
    setState('loading');
    setError('');
    try {
      const { problem: p } = await api.fetchLeetcode(url.trim());
      setProblem(p);
      setState('success');
      onImported?.(p, selectedPattern);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch problem');
      setState('error');
    }
  };

  const diffColor = (d: string) =>
    d === 'Easy' ? '#22c55e' : d === 'Medium' ? '#f59e0b' : '#ef4444';

  return (
    <div className="lc-overlay" onClick={onClose}>
      <div className="lc-modal" onClick={e => e.stopPropagation()}>
        <div className="lc-modal-header">
          <div className="lc-modal-title">
            <Link2 size={16} />
            Import from LeetCode
          </div>
          <button className="lc-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <div className="lc-modal-body">
          <p className="lc-hint">Paste any LeetCode problem URL to fetch and save it to your problem set.</p>

          <div className="lc-input-row" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              className="lc-url-input"
              placeholder="https://leetcode.com/problems/two-sum/"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFetch()}
              autoFocus
              style={{ flex: 1 }}
            />
            <select
              className="lc-url-input"
              value={selectedPattern}
              onChange={e => setSelectedPattern(e.target.value)}
              style={{ width: '200px' }}
            >
              {patterns.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              className="lc-fetch-btn"
              onClick={handleFetch}
              disabled={state === 'loading' || !url.trim()}
            >
              {state === 'loading' ? <Loader2 size={15} className="spin" /> : 'Fetch'}
            </button>
          </div>

          {state === 'error' && (
            <div className="lc-error">{error}</div>
          )}

          {state === 'success' && problem && (
            <div className="lc-result">
              <div className="lc-result-header">
                <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
                <span>Problem imported successfully</span>
              </div>

              <div className="lc-problem-card">
                <div className="lc-problem-top">
                  <h3 className="lc-problem-title">{problem.title}</h3>
                  <span className="lc-diff-badge" style={{ color: diffColor(problem.difficulty) }}>
                    {problem.difficulty}
                  </span>
                </div>

                {problem.acceptance && (
                  <div className="lc-problem-meta">Acceptance: {problem.acceptance.toFixed(1)}%</div>
                )}

                {problem.topicTags?.length > 0 && (
                  <div className="lc-tags">
                    {problem.topicTags.slice(0, 6).map((t: string) => (
                      <span key={t} className="lc-tag">{t}</span>
                    ))}
                  </div>
                )}

                {problem.companyTags?.length > 0 && (
                  <div className="lc-companies">
                    {problem.companyTags.slice(0, 5).map((c: string) => (
                      <span key={c} className="lc-company">{c}</span>
                    ))}
                  </div>
                )}

                <div className="lc-description-preview">
                  {problem.description?.slice(0, 300)}
                  {problem.description?.length > 300 ? '…' : ''}
                </div>

                <div className="lc-result-actions">
                  <a
                    href={problem.leetcodeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="lc-btn-secondary"
                  >
                    <ExternalLink size={13} /> View on LeetCode
                  </a>
                  <button className="lc-btn-primary" onClick={onClose}>
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="lc-examples">
            <span>Example URLs:</span>
            {[
              'https://leetcode.com/problems/two-sum/',
              'https://leetcode.com/problems/valid-parentheses/',
              'https://leetcode.com/problems/merge-intervals/',
            ].map(u => (
              <button key={u} className="lc-example-url" onClick={() => setUrl(u)}>
                {u.replace('https://leetcode.com/problems/', '')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
