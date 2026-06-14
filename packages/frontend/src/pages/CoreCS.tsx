import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import './CoreCS.css';

const subjects = [
  { id: 'os', label: 'Operating Systems', icon: '🖥️', topics: 12, color: '#f59e0b', desc: 'Processes, threads, scheduling, memory management, deadlocks' },
  { id: 'dbms', label: 'DBMS', icon: '🗄️', topics: 10, color: '#10b981', desc: 'Normalization, transactions, SQL, indexes, ACID, NoSQL' },
  { id: 'cn', label: 'Computer Networks', icon: '🌐', topics: 9, color: '#3b82f6', desc: 'OSI model, TCP/IP, HTTP, DNS, routing protocols' },
  { id: 'oop', label: 'OOP & Design Patterns', icon: '🧩', topics: 8, color: '#8b5cf6', desc: 'SOLID principles, 4 pillars, 10 design patterns' },
  { id: 'sd', label: 'System Design', icon: '🏗️', topics: 14, color: '#ef4444', desc: 'HLD, LLD, 10 classic system design problems' },
  { id: 'ds', label: 'Data Structures', icon: '🌳', topics: 11, color: '#06b6d4', desc: 'Arrays, trees, graphs, heaps, tries, segment trees' },
];

const sqlSandbox = `-- Sample: employees table
SELECT e.name, e.salary, d.name AS department
FROM employees e
JOIN departments d ON e.dept_id = d.id
WHERE e.salary > 50000
ORDER BY e.salary DESC
LIMIT 5;`;

export default function CoreCS() {
  const [activeSubject, setActiveSubject] = useState('os');
  const [sqlCode, setSqlCode] = useState(sqlSandbox);
  const [sqlResult, setSqlResult] = useState<null | string[][]>(null);

  const runSQL = () => {
    setSqlResult([
      ['Alice', '90000', 'Engineering'],
      ['Bob', '85000', 'Product'],
      ['Carol', '75000', 'Engineering'],
      ['Dave', '65000', 'Design'],
      ['Eve', '55000', 'Marketing'],
    ]);
  };

  return (
    <div className="core-cs-page">
      <div className="page-header-row">
        <div>
          <h1>Core CS Subjects</h1>
          <p className="sub">Theory, MCQs, and interactive SQL editor</p>
        </div>
      </div>

      <div className="cs-layout">
        {/* Subject cards */}
        <div className="cs-subjects">
          {subjects.map(s => (
            <button
              key={s.id}
              className={`subject-card ${activeSubject === s.id ? 'active' : ''}`}
              onClick={() => setActiveSubject(s.id)}
            >
              <span className="subject-icon">{s.icon}</span>
              <div className="subject-info">
                <h3>{s.label}</h3>
                <p>{s.topics} topics</p>
              </div>
              <ChevronRight size={15} className="subject-arrow" />
              <div className="subject-accent" style={{ background: s.color }} />
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="cs-content">
          {activeSubject === 'dbms' ? (
            <div className="sql-panel">
              <div className="card-header-sm mb-12">
                <span className="eyebrow">DBMS Interactive</span>
                <h2>SQL Sandbox</h2>
              </div>
              <div className="sql-editor-wrap">
                <div className="sql-toolbar">
                  <span className="sql-label">SQL Editor</span>
                  <button className="btn-sm btn-primary" onClick={runSQL}>▶ Run Query</button>
                </div>
                <textarea
                  className="sql-textarea"
                  value={sqlCode}
                  onChange={e => setSqlCode(e.target.value)}
                  aria-label="SQL editor"
                  rows={8}
                />
              </div>
              {sqlResult && (
                <div className="sql-results">
                  <table className="result-table">
                    <thead>
                      <tr>{['name','salary','department'].map(h => <th key={h}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {sqlResult.map((row, i) => (
                        <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="sql-sub">{sqlResult.length} rows returned</p>
                </div>
              )}
            </div>
          ) : (
            <div className="topic-content">
              <div className="topic-hero">
                <span className="topic-subject-label">{subjects.find(s => s.id === activeSubject)?.label}</span>
                <h2>Processes & Scheduling</h2>
                <div className="topic-badges">
                  <span className="diff-badge easy">Beginner</span>
                  <span className="chip chip-dim">8 min read</span>
                </div>
              </div>

              <div className="topic-body">
                <p>A <strong>process</strong> is an instance of a program in execution. Each process has its own address space, stack, heap, and PCB (Process Control Block).</p>

                <h3>CPU Scheduling Algorithms</h3>
                <div className="algo-cards">
                  {[
                    { name: 'FCFS', desc: 'First Come First Served — non-preemptive, simple but causes convoy effect' },
                    { name: 'SJF', desc: 'Shortest Job First — optimal for average waiting time but requires knowing burst time' },
                    { name: 'Round Robin', desc: 'Each process gets a time quantum; preemptive and fair for interactive systems' },
                    { name: 'Priority', desc: 'Highest priority runs first. Can cause starvation — solved by aging' },
                  ].map(a => (
                    <div key={a.name} className="algo-card">
                      <strong>{a.name}</strong>
                      <p>{a.desc}</p>
                    </div>
                  ))}
                </div>

                <h3>MCQ Practice</h3>
                <div className="mcq-preview">
                  <p className="mcq-q">Which scheduling algorithm minimizes average waiting time for a given set of processes?</p>
                  <div className="mcq-options">
                    {['FCFS', 'SJF (non-preemptive)', 'Round Robin', 'LIFO'].map((o, i) => (
                      <button key={i} className={`option ${i === 1 ? 'correct' : ''}`}>
                        <span className="opt-letter">{String.fromCharCode(65+i)}</span>{o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
