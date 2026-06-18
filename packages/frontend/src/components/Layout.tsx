import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Code2, BookOpen, Cpu,
  MessageSquare, BarChart2,
  CalendarDays, Settings, Timer, FileEdit, Brain, Braces, Building2, LogOut,
  FileText, Users, AlertCircle, List
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import './Layout.css';

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dsa',          icon: Code2,           label: 'DSA Patterns' },
  { to: '/aptitude',     icon: BookOpen,        label: 'Aptitude' },
  { to: '/core-cs',      icon: Cpu,             label: 'Core CS' },
  { to: '/ai-interview', icon: MessageSquare,   label: 'AI Interview' },
  { to: '/mock-contest', icon: Timer,           label: 'Mock Contest' },
  { to: '/company-prep', icon: Building2,       label: 'Company Kits' },
  { to: '/analytics',    icon: BarChart2,       label: 'Analytics' },
];

const bottomItems = [
  { to: '/snippets',      icon: Braces,       label: 'Snippets' },
  { to: '/concept-cards', icon: Brain,        label: 'Concept Cards' },
  { to: '/hr-questions',  icon: Users,        label: 'HR Questions' },
  { to: '/mistakes',      icon: AlertCircle,  label: 'Mistakes' },
  { to: '/notes',         icon: FileText,     label: 'Notes' },
  { to: '/resume',        icon: FileEdit,     label: 'Resume' },
  { to: '/lists',         icon: List,         label: 'Lists' },
  { to: '/study-plan',    icon: CalendarDays, label: 'Study Plan' },
  { to: '/settings',      icon: Settings,     label: 'Settings' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '??';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">PP</div>
          <div className="brand-text">
            <span className="brand-name">PrepOS</span>
            <span className="brand-tagline">Placement Platform</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={15} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
          <div className="nav-divider" />
          <div className="nav-section">
            {bottomItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={15} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <span className="user-name">{user?.fullName ?? 'User'}</span>
            <span className="user-college">{user?.college ?? `Level ${user?.currentLevel ?? 1}`}</span>
          </div>
          <button className="user-streak" onClick={handleLogout} title="Logout" aria-label="Logout">
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      <div className="main-area">


        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
