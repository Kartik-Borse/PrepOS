import { useState, useRef } from 'react';
import { Plus, Trash2, Download, Eye } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import './ResumeBuilder.css';

export default function ResumeBuilder() {
  const { resumeData, setResumeData } = useAppStore();
  const [preview, setPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const addProject = () =>
    setResumeData({ projects: [...resumeData.projects, { title: '', tech: '', description: '' }] });

  const removeProject = (i: number) =>
    setResumeData({ projects: resumeData.projects.filter((_, idx) => idx !== i) });

  const updateProject = (i: number, field: string, val: string) =>
    setResumeData({ projects: resumeData.projects.map((p, idx) => idx === i ? { ...p, [field]: val } : p) });

  const printResume = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>${resumeData.name || 'Resume'}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; font-size: 11pt; color: #000; padding: 20mm 18mm; line-height: 1.5; }
        h1 { font-size: 20pt; font-weight: 700; }
        h2 { font-size: 11pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin: 14px 0 6px; }
        h3 { font-size: 11pt; font-weight: 700; }
        .header-contact { font-size: 10pt; color: #333; }
        .flex-row { display: flex; justify-content: space-between; }
        .section { margin-bottom: 10px; }
        .proj-desc { font-size: 10pt; color: #222; margin-top: 3px; }
        ul { padding-left: 16px; margin-top: 4px; }
        li { font-size: 10pt; margin-bottom: 2px; }
        @media print { body { padding: 10mm 12mm; } }
      </style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  const r = resumeData;

  return (
    <div className="resume-builder-page">
      <div className="rb-header">
        <div><h1>Resume Builder</h1><p className="sub">Build and export a clean single-page resume</p></div>
        <div className="rb-actions">
          <button className="rb-btn preview" onClick={() => setPreview(!preview)}>
            <Eye size={14} /> {preview ? 'Edit' : 'Preview'}
          </button>
          <button className="rb-btn export" onClick={printResume}>
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>

      {!preview ? (
        <div className="rb-form">
          {/* Personal Info */}
          <section className="rb-section">
            <h2>Personal Information</h2>
            <div className="rb-grid-2">
              <div className="rb-field"><label>Full Name</label><input value={r.name} onChange={(e) => setResumeData({ name: e.target.value })} placeholder="Rahul Sharma" /></div>
              <div className="rb-field"><label>Email</label><input value={r.email} onChange={(e) => setResumeData({ email: e.target.value })} placeholder="rahul@iitd.ac.in" /></div>
              <div className="rb-field"><label>Phone</label><input value={r.phone} onChange={(e) => setResumeData({ phone: e.target.value })} placeholder="+91 98765 43210" /></div>
              <div className="rb-field"><label>LinkedIn / GitHub / Portfolio</label><input value={r.links} onChange={(e) => setResumeData({ links: e.target.value })} placeholder="linkedin.com/in/rahul | github.com/rahul" /></div>
            </div>
          </section>

          {/* Education */}
          <section className="rb-section">
            <h2>Education</h2>
            <div className="rb-grid-2">
              <div className="rb-field"><label>College / University</label><input value={r.college} onChange={(e) => setResumeData({ college: e.target.value })} placeholder="IIT Delhi" /></div>
              <div className="rb-field"><label>Degree</label><input value={r.degree} onChange={(e) => setResumeData({ degree: e.target.value })} placeholder="B.Tech Computer Science" /></div>
              <div className="rb-field"><label>Graduation Year</label><input value={r.graduationYear} onChange={(e) => setResumeData({ graduationYear: e.target.value })} placeholder="2026" /></div>
              <div className="rb-field"><label>CGPA / Percentage</label><input value={r.cgpa} onChange={(e) => setResumeData({ cgpa: e.target.value })} placeholder="8.5 / 10" /></div>
            </div>
          </section>

          {/* Skills */}
          <section className="rb-section">
            <h2>Technical Skills</h2>
            <div className="rb-field">
              <label>Skills (comma separated or free text)</label>
              <textarea value={r.skills} onChange={(e) => setResumeData({ skills: e.target.value })} rows={3} placeholder="Languages: C++, Python, Java&#10;Frameworks: React, Node.js, Spring Boot&#10;Tools: Git, Docker, AWS, PostgreSQL" />
            </div>
          </section>

          {/* Projects */}
          <section className="rb-section">
            <div className="rb-section-header">
              <h2>Projects</h2>
              <button className="add-row-btn" onClick={addProject}><Plus size={13} /> Add Project</button>
            </div>
            {r.projects.map((proj, i) => (
              <div key={i} className="project-card">
                <div className="proj-row">
                  <div className="rb-field flex-1"><label>Project Title</label><input value={proj.title} onChange={(e) => updateProject(i, 'title', e.target.value)} placeholder="E-Commerce Platform" /></div>
                  <div className="rb-field flex-1"><label>Tech Stack</label><input value={proj.tech} onChange={(e) => updateProject(i, 'tech', e.target.value)} placeholder="React, Node.js, MongoDB" /></div>
                  <button className="del-proj-btn" onClick={() => removeProject(i)} title="Remove project"><Trash2 size={14} /></button>
                </div>
                <div className="rb-field">
                  <label>Description (2–3 bullet points)</label>
                  <textarea value={proj.description} onChange={(e) => updateProject(i, 'description', e.target.value)} rows={3} placeholder="• Built REST APIs handling 10k requests/day reducing latency by 40%&#10;• Implemented JWT authentication with role-based access control&#10;• Deployed on AWS EC2 with CI/CD pipeline using GitHub Actions" />
                </div>
              </div>
            ))}
          </section>

          {/* Achievements */}
          <section className="rb-section">
            <h2>Achievements & Certifications</h2>
            <div className="rb-field">
              <textarea value={r.achievements} onChange={(e) => setResumeData({ achievements: e.target.value })} rows={4} placeholder="• LeetCode: 500+ problems solved, Knight rating&#10;• Finalist, Smart India Hackathon 2024&#10;• AWS Cloud Practitioner Certified&#10;• Secured 98 percentile in GATE CS 2025" />
            </div>
          </section>
        </div>
      ) : (
        <div className="rb-preview-wrapper">
          <div className="rb-preview" ref={printRef}>
            {/* Header */}
            <div className="rp-header">
              <h1>{r.name || 'Your Name'}</h1>
              <div className="rp-contact">
                {r.email && <span>{r.email}</span>}
                {r.phone && <span>• {r.phone}</span>}
                {r.links && <span>• {r.links}</span>}
              </div>
            </div>

            {/* Education */}
            {(r.college || r.degree) && (
              <div className="rp-section">
                <h2 className="rp-section-title">Education</h2>
                <div className="rp-row-space">
                  <div>
                    <strong>{r.college}</strong>
                    <div className="rp-sub">{r.degree}</div>
                  </div>
                  <div className="rp-right">
                    <div>{r.graduationYear}</div>
                    {r.cgpa && <div className="rp-sub">CGPA: {r.cgpa}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* Skills */}
            {r.skills && (
              <div className="rp-section">
                <h2 className="rp-section-title">Technical Skills</h2>
                <div className="rp-skills">{r.skills}</div>
              </div>
            )}

            {/* Projects */}
            {r.projects.filter((p) => p.title).length > 0 && (
              <div className="rp-section">
                <h2 className="rp-section-title">Projects</h2>
                {r.projects.filter((p) => p.title).map((proj, i) => (
                  <div key={i} className="rp-project">
                    <div className="rp-row-space">
                      <strong>{proj.title}</strong>
                      {proj.tech && <span className="rp-tech">| {proj.tech}</span>}
                    </div>
                    <div className="rp-desc">{proj.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Achievements */}
            {r.achievements && (
              <div className="rp-section">
                <h2 className="rp-section-title">Achievements & Certifications</h2>
                <div className="rp-desc">{r.achievements}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
