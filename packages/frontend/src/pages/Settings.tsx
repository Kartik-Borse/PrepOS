import { useState } from 'react';
import './Settings.css';

export default function Settings() {
  const [dailyGoal, setDailyGoal] = useState('5');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [notifTime, setNotifTime] = useState('19:00');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [streakAutoFreeze, setStreakAutoFreeze] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-page">
      <div className="page-header-row">
        <div>
          <h1>Settings</h1>
          <p className="sub">Preferences, notifications, and account</p>
        </div>
        <button className="btn-primary-sm" onClick={save}>
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      <div className="settings-grid">
        {/* Profile */}
        <section className="settings-card">
          <h2>Profile</h2>
          <div className="profile-top">
            <div className="avatar-lg">RS</div>
            <button className="btn-outline-xs">Change photo</button>
          </div>
          <div className="fields">
            <div className="field-row">
              <label>Full Name</label>
              <input defaultValue="Rahul Sharma" />
            </div>
            <div className="field-row">
              <label>Email</label>
              <input defaultValue="rahul@iitd.ac.in" type="email" />
            </div>
            <div className="field-row">
              <label>College</label>
              <input defaultValue="IIT Delhi" />
            </div>
            <div className="field-row">
              <label>Graduation Year</label>
              <input defaultValue="2026" type="number" />
            </div>
          </div>
        </section>

        {/* Goals */}
        <section className="settings-card">
          <h2>Daily Goals</h2>
          <div className="fields">
            <div className="field-row">
              <label>Daily Problem Goal</label>
              <div className="goal-options">
                {['1', '2', '5', '10'].map(g => (
                  <button key={g} className={`goal-chip ${dailyGoal === g ? 'active' : ''}`} onClick={() => setDailyGoal(g)}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="field-row">
              <label>Timezone</label>
              <select value={timezone} onChange={e => setTimezone(e.target.value)}>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="settings-card">
          <h2>Notifications</h2>
          <div className="fields">
            <div className="toggle-row">
              <div>
                <div className="toggle-label">Push Notifications</div>
                <div className="toggle-sub">Streak reminders and revision alerts</div>
              </div>
              <button className={`toggle ${pushEnabled ? 'on' : ''}`} onClick={() => setPushEnabled(!pushEnabled)} aria-label="Toggle push notifications" role="switch" aria-checked={pushEnabled}>
                <span className="toggle-thumb" />
              </button>
            </div>
            <div className="toggle-row">
              <div>
                <div className="toggle-label">Email Notifications</div>
                <div className="toggle-sub">Weekly focus report and streak alerts</div>
              </div>
              <button className={`toggle ${emailEnabled ? 'on' : ''}`} onClick={() => setEmailEnabled(!emailEnabled)} aria-label="Toggle email notifications" role="switch" aria-checked={emailEnabled}>
                <span className="toggle-thumb" />
              </button>
            </div>
            <div className="toggle-row">
              <div>
                <div className="toggle-label">Auto-apply Streak Freeze</div>
                <div className="toggle-sub">Automatically use a freeze on missed days</div>
              </div>
              <button className={`toggle ${streakAutoFreeze ? 'on' : ''}`} onClick={() => setStreakAutoFreeze(!streakAutoFreeze)} aria-label="Toggle streak auto-freeze" role="switch" aria-checked={streakAutoFreeze}>
                <span className="toggle-thumb" />
              </button>
            </div>
            <div className="field-row">
              <label>Daily Reminder Time</label>
              <input type="time" value={notifTime} onChange={e => setNotifTime(e.target.value)} style={{ width: 'auto' }} />
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="settings-card">
          <h2>Appearance</h2>
          <div className="fields">
            <div className="field-row">
              <label>Theme</label>
              <div className="goal-options">
                <button className="goal-chip active">Dark</button>
                <button className="goal-chip">Light</button>
              </div>
            </div>
            <div className="field-row">
              <label>Font Size</label>
              <div className="goal-options">
                {['Small', 'Medium', 'Large'].map(s => (
                  <button key={s} className={`goal-chip ${s === 'Medium' ? 'active' : ''}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
