import React, { useState } from 'react';
import './TCSCAnalysis.css';

interface Approach {
  id: string;
  name: string;
  code: string;
  timeComplexity: string;
  spaceComplexity: string;
  notes: string;
}

interface TCSCAnalysisData {
  problemTitle: string;
  problemDescription: string;
  approaches: Approach[];
  hints: string[];
  bruteForceCode: string;
  totalApproachesLearned: number;
  generalNotes: string;
}

const TCSCAnalysis: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<TCSCAnalysisData>({
    problemTitle: '',
    problemDescription: '',
    approaches: [],
    hints: [],
    bruteForceCode: '',
    totalApproachesLearned: 0,
    generalNotes: ''
  });

  const [currentHint, setCurrentHint] = useState('');
  const [currentApproach, setCurrentApproach] = useState<Approach>({
    id: '',
    name: '',
    code: '',
    timeComplexity: '',
    spaceComplexity: '',
    notes: ''
  });

  const addHint = () => {
    if (currentHint.trim()) {
      setAnalysisData({
        ...analysisData,
        hints: [...analysisData.hints, currentHint]
      });
      setCurrentHint('');
    }
  };

  const removeHint = (index: number) => {
    setAnalysisData({
      ...analysisData,
      hints: analysisData.hints.filter((_, i) => i !== index)
    });
  };

  const addApproach = () => {
    if (currentApproach.name.trim()) {
      setAnalysisData({
        ...analysisData,
        approaches: [
          ...analysisData.approaches,
          {
            ...currentApproach,
            id: Date.now().toString()
          }
        ],
        totalApproachesLearned: analysisData.totalApproachesLearned + 1
      });
      setCurrentApproach({
        id: '',
        name: '',
        code: '',
        timeComplexity: '',
        spaceComplexity: '',
        notes: ''
      });
    }
  };

  const removeApproach = (id: string) => {
    setAnalysisData({
      ...analysisData,
      approaches: analysisData.approaches.filter(a => a.id !== id),
      totalApproachesLearned: Math.max(0, analysisData.totalApproachesLearned - 1)
    });
  };

  const saveAnalysis = () => {
    const dataToSave = JSON.stringify(analysisData, null, 2);
    const blob = new Blob([dataToSave], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysisData.problemTitle || 'tc-sc-analysis'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadAnalysis = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setAnalysisData(data);
        } catch (error) {
          alert('Error loading file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="tcsc-analysis">
      <div className="tcsc-header">
        <h1>TC/SC Analysis Workspace</h1>
        <div className="header-actions">
          <button onClick={saveAnalysis} className="btn-primary">Save Analysis</button>
          <label className="btn-secondary">
            Load Analysis
            <input type="file" accept=".json" onChange={loadAnalysis} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div className="tcsc-content">
        {/* Problem Section */}
        <div className="section">
          <h2>Problem</h2>
          <div className="form-group">
            <label>Problem Title</label>
            <input
              type="text"
              value={analysisData.problemTitle}
              onChange={(e) => setAnalysisData({ ...analysisData, problemTitle: e.target.value })}
              placeholder="Enter problem title"
            />
          </div>
          <div className="form-group">
            <label>Problem Description</label>
            <textarea
              value={analysisData.problemDescription}
              onChange={(e) => setAnalysisData({ ...analysisData, problemDescription: e.target.value })}
              placeholder="Describe the problem statement..."
              rows={6}
            />
          </div>
        </div>

        {/* Approaches Section */}
        <div className="section">
          <h2>Approaches ({analysisData.totalApproachesLearned})</h2>
          
          {/* Add New Approach Form */}
          <div className="approach-form">
            <h3>Add New Approach</h3>
            <div className="form-group">
              <label>Approach Name</label>
              <input
                type="text"
                value={currentApproach.name}
                onChange={(e) => setCurrentApproach({ ...currentApproach, name: e.target.value })}
                placeholder="e.g., Two Pointer Approach, Dynamic Programming, etc."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Time Complexity</label>
                <input
                  type="text"
                  value={currentApproach.timeComplexity}
                  onChange={(e) => setCurrentApproach({ ...currentApproach, timeComplexity: e.target.value })}
                  placeholder="e.g., O(n), O(n²), O(log n)"
                />
              </div>
              <div className="form-group">
                <label>Space Complexity</label>
                <input
                  type="text"
                  value={currentApproach.spaceComplexity}
                  onChange={(e) => setCurrentApproach({ ...currentApproach, spaceComplexity: e.target.value })}
                  placeholder="e.g., O(1), O(n), O(n²)"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Code Implementation</label>
              <textarea
                value={currentApproach.code}
                onChange={(e) => setCurrentApproach({ ...currentApproach, code: e.target.value })}
                placeholder="Write your code implementation here..."
                rows={10}
                className="code-editor"
              />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={currentApproach.notes}
                onChange={(e) => setCurrentApproach({ ...currentApproach, notes: e.target.value })}
                placeholder="Add notes about this approach..."
                rows={4}
              />
            </div>
            <button onClick={addApproach} className="btn-primary">Add Approach</button>
          </div>

          {/* Listed Approaches */}
          <div className="approaches-list">
            {analysisData.approaches.map((approach) => (
              <div key={approach.id} className="approach-card">
                <div className="approach-header">
                  <h4>{approach.name}</h4>
                  <button onClick={() => removeApproach(approach.id)} className="btn-danger">Remove</button>
                </div>
                <div className="complexity-tags">
                  <span className="tag tc">TC: {approach.timeComplexity}</span>
                  <span className="tag sc">SC: {approach.spaceComplexity}</span>
                </div>
                <pre className="approach-code">{approach.code}</pre>
                {approach.notes && (
                  <div className="approach-notes">
                    <strong>Notes:</strong>
                    <p>{approach.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Brute Force Section */}
        <div className="section">
          <h2>Brute Force Solution</h2>
          <div className="form-group">
            <label>Brute Force Code</label>
            <textarea
              value={analysisData.bruteForceCode}
              onChange={(e) => setAnalysisData({ ...analysisData, bruteForceCode: e.target.value })}
              placeholder="Write your brute force solution here..."
              rows={10}
              className="code-editor"
            />
          </div>
        </div>

        {/* Hints Section */}
        <div className="section">
          <h2>Hints</h2>
          <div className="hints-input">
            <input
              type="text"
              value={currentHint}
              onChange={(e) => setCurrentHint(e.target.value)}
              placeholder="Add a hint..."
              onKeyPress={(e) => e.key === 'Enter' && addHint()}
            />
            <button onClick={addHint} className="btn-primary">Add Hint</button>
          </div>
          <div className="hints-list">
            {analysisData.hints.map((hint, index) => (
              <div key={index} className="hint-item">
                <span>{hint}</span>
                <button onClick={() => removeHint(index)} className="btn-danger">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* General Notes Section */}
        <div className="section">
          <h2>General Notes</h2>
          <div className="form-group">
            <textarea
              value={analysisData.generalNotes}
              onChange={(e) => setAnalysisData({ ...analysisData, generalNotes: e.target.value })}
              placeholder="Add any general notes about the problem, learnings, or key takeaways..."
              rows={6}
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="section stats-section">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Approaches</h3>
              <p className="stat-number">{analysisData.totalApproachesLearned}</p>
            </div>
            <div className="stat-card">
              <h3>Hints Collected</h3>
              <p className="stat-number">{analysisData.hints.length}</p>
            </div>
            <div className="stat-card">
              <h3>Has Brute Force</h3>
              <p className="stat-number">{analysisData.bruteForceCode ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TCSCAnalysis;
