import { useState } from 'react';
import { Flame, Zap } from 'lucide-react';
import './Leaderboard.css';

const users = [
  { rank: 1, name: 'Priya Sharma', college: 'IIT Bombay', xp: 12840, streak: 45, solved: 312, avatar: 'PS' },
  { rank: 2, name: 'Arjun Mehta', college: 'NIT Trichy', xp: 11200, streak: 30, solved: 289, avatar: 'AM' },
  { rank: 3, name: 'Kavya Reddy', college: 'IIT Delhi', xp: 10450, streak: 22, solved: 267, avatar: 'KR' },
  { rank: 4, name: 'Rahul Sharma', college: 'IIT Delhi', xp: 9820, streak: 12, solved: 247, avatar: 'RS', isMe: true },
  { rank: 5, name: 'Sneha Patel', college: 'BITS Pilani', xp: 9100, streak: 18, solved: 234, avatar: 'SP' },
  { rank: 6, name: 'Vikram Nair', college: 'IIT Madras', xp: 8750, streak: 9, solved: 218, avatar: 'VN' },
  { rank: 7, name: 'Ananya Singh', college: 'IIT Bombay', xp: 8200, streak: 25, solved: 201, avatar: 'AS' },
  { rank: 8, name: 'Rohan Gupta', college: 'NIT Warangal', xp: 7890, streak: 7, solved: 195, avatar: 'RG' },
  { rank: 9, name: 'Deepa Krishna', college: 'IIT Hyderabad', xp: 7400, streak: 14, solved: 188, avatar: 'DK' },
  { rank: 10, name: 'Aakash Verma', college: 'BITS Pilani', xp: 7200, streak: 5, solved: 179, avatar: 'AV' },
];

const rankColors = ['#f59e0b', '#94a3b8', '#cd7f32'];
const rankEmojis = ['🥇', '🥈', '🥉'];

type Tab = 'global' | 'college' | 'friends';
type Period = 'weekly' | 'alltime';

export default function Leaderboard() {
  const [tab, setTab] = useState<Tab>('global');
  const [period, setPeriod] = useState<Period>('alltime');

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="leaderboard-page">
      <div className="lb-header">
        <div>
          <h1>Leaderboard</h1>
          <p className="sub">Compete with peers from your college and around the world</p>
        </div>
        <div className="lb-controls">
          <div className="lb-tabs">
            {(['global', 'college', 'friends'] as Tab[]).map(t => (
              <button key={t} className={`lb-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="lb-tabs">
            {(['weekly', 'alltime'] as Period[]).map(p => (
              <button key={p} className={`lb-tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                {p === 'weekly' ? 'This Week' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Podium */}
      <div className="podium">
        {[top3[1], top3[0], top3[2]].map((u, i) => {
          const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
          const height = actualRank === 1 ? 110 : actualRank === 2 ? 85 : 70;
          return (
            <div key={u.rank} className="podium-item" style={{ order: actualRank === 1 ? 2 : actualRank === 2 ? 1 : 3 }}>
              <div className="podium-avatar" style={{ borderColor: rankColors[actualRank - 1] }}>
                {u.avatar}
                <span className="podium-rank-badge">{rankEmojis[actualRank - 1]}</span>
              </div>
              <div className="podium-name">{u.name.split(' ')[0]}</div>
              <div className="podium-xp"><Zap size={12} />{u.xp.toLocaleString()}</div>
              <div className="podium-base" style={{ height, background: rankColors[actualRank - 1] + '22', borderColor: rankColors[actualRank - 1] + '44' }}>
                <span style={{ color: rankColors[actualRank - 1] }}>#{actualRank}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="lb-table">
        <div className="lb-thead">
          <span className="col-rank">Rank</span>
          <span className="col-user">User</span>
          <span className="col-college">College</span>
          <span className="col-solved">Solved</span>
          <span className="col-streak">Streak</span>
          <span className="col-xp">XP</span>
        </div>
        {rest.map(u => (
          <div key={u.rank} className={`lb-row ${u.isMe ? 'is-me' : ''}`}>
            <span className="col-rank rank-num">#{u.rank}</span>
            <span className="col-user">
              <div className="lb-avatar">{u.avatar}</div>
              <div>
                <div className="lb-name">{u.name} {u.isMe && <span className="you-tag">You</span>}</div>
              </div>
            </span>
            <span className="col-college text-dim">{u.college}</span>
            <span className="col-solved">{u.solved}</span>
            <span className="col-streak">
              <Flame size={13} style={{ color: 'var(--primary)' }} />
              {u.streak}d
            </span>
            <span className="col-xp xp-val">
              <Zap size={12} />
              {u.xp.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
