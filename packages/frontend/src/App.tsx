import { Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import Dashboard from './pages/Dashboard';
import DSAPatterns from './pages/DSAPatterns';
import ProblemList from './pages/ProblemList';
import ProblemDetail from './pages/ProblemDetail';
import Aptitude from './pages/Aptitude';
import CoreCS from './pages/CoreCS';
import AIInterview from './pages/AIInterview';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';
import Bookmarks from './pages/Bookmarks';
import StudyPlan from './pages/StudyPlan';
import Settings from './pages/Settings';
import Notes from './pages/Notes';
import HRQuestions from './pages/HRQuestions';
import ProgressExport from './pages/ProgressExport';
import MistakeJournal from './pages/MistakeJournal';
import MockContest from './pages/MockContest';
import ResumeBuilder from './pages/ResumeBuilder';
import ConceptCards from './pages/ConceptCards';
import CodeSnippets from './pages/CodeSnippets';
import CompanyPrepKits from './pages/CompanyPrepKits';
import Login from './pages/Login';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dsa" element={<DSAPatterns />} />
        <Route path="/dsa/:patternId" element={<ProblemList />} />
        <Route path="/problem/:id" element={<ProblemDetail />} />
        <Route path="/aptitude" element={<Aptitude />} />
        <Route path="/core-cs" element={<CoreCS />} />
        <Route path="/concept-cards" element={<ConceptCards />} />
        <Route path="/ai-interview" element={<AIInterview />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/study-plan" element={<StudyPlan />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/hr-questions" element={<HRQuestions />} />
        <Route path="/progress" element={<ProgressExport />} />
        <Route path="/mistakes" element={<MistakeJournal />} />
        <Route path="/mock-contest" element={<MockContest />} />
        <Route path="/resume" element={<ResumeBuilder />} />
        <Route path="/snippets" element={<CodeSnippets />} />
        <Route path="/company-prep" element={<CompanyPrepKits />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
