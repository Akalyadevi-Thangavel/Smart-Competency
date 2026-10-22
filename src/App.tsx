import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import AppShell from './components/layout/AppShell';

// Lazy-loaded pages for code splitting
const LandingPage      = lazy(() => import('./pages/LandingPage'));
const AuthPage         = lazy(() => import('./pages/AuthPage'));
const OnboardingPage   = lazy(() => import('./pages/OnboardingPage'));
const DashboardPage    = lazy(() => import('./pages/DashboardPage'));
const SkillMatrixPage  = lazy(() => import('./pages/SkillMatrixPage'));
const SkillGapPage     = lazy(() => import('./pages/SkillGapPage'));
const JobRoleMatchPage = lazy(() => import('./pages/JobRoleMatchPage'));
const AssessmentListPage   = lazy(() => import('./pages/AssessmentListPage'));
const AssessmentTakingPage = lazy(() => import('./pages/AssessmentTakingPage'));
const AssessmentResultPage = lazy(() => import('./pages/AssessmentResultPage'));
const LearningRoadmapPage  = lazy(() => import('./pages/LearningRoadmapPage'));
const CodingLabPage        = lazy(() => import('./pages/CodingLabPage'));
const InterviewPrepPage    = lazy(() => import('./pages/InterviewPrepPage'));
const ProjectPortfolioPage = lazy(() => import('./pages/ProjectPortfolioPage'));
const ResumeAnalyzerPage   = lazy(() => import('./pages/ResumeAnalyzerPage'));
const AICoachPage          = lazy(() => import('./pages/AICoachPage'));
const DailyPlanPage        = lazy(() => import('./pages/DailyPlanPage'));
const LeaderboardPage      = lazy(() => import('./pages/LeaderboardPage'));
const AdminPortalPage      = lazy(() => import('./pages/AdminPortalPage'));
const SettingsPage         = lazy(() => import('./pages/SettingsPage'));

// Loading Spinner Component
const PageLoader: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg-main)',
      flexDirection: 'column',
      gap: '16px',
    }}
  >
    <div className="spinner" />
    <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'var(--font-sans)' }}>
      Loading Smart Competency…
    </span>
  </div>
);

// Protected Route guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, profile } = useAuth();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  // Force onboarding if profile is not yet set up
  if (profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// Public Route guard — redirect logged-in users away from auth pages
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth */}
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        {/* Onboarding — accessible when logged in but not yet onboarded */}
        <Route
          path="/onboarding"
          element={
            isAuthenticated ? <OnboardingPage /> : <Navigate to="/auth" replace />
          }
        />

        {/* Protected App Routes — wrapped in AppShell (sidebar + topbar) */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard"          element={<DashboardPage />} />
          <Route path="/daily-plan"         element={<DailyPlanPage />} />
          <Route path="/skills"             element={<SkillMatrixPage />} />
          <Route path="/skill-gap"          element={<SkillGapPage />} />
          <Route path="/roles"              element={<JobRoleMatchPage />} />
          <Route path="/assessments"        element={<AssessmentListPage />} />
          <Route path="/assessments/:id"    element={<AssessmentTakingPage />} />
          <Route path="/assessments/:id/result" element={<AssessmentResultPage />} />
          <Route path="/learning"           element={<LearningRoadmapPage />} />
          <Route path="/coding"             element={<CodingLabPage />} />
          <Route path="/interview"          element={<InterviewPrepPage />} />
          <Route path="/projects"           element={<ProjectPortfolioPage />} />
          <Route path="/resume"             element={<ResumeAnalyzerPage />} />
          <Route path="/leaderboard"        element={<LeaderboardPage />} />
          <Route path="/ai-coach"           element={<AICoachPage />} />
          <Route path="/admin"              element={<AdminPortalPage />} />
          <Route path="/settings"           element={<SettingsPage />} />

          {/* Route aliases for backwards compatibility with database seed records */}
          <Route path="/learning-path"      element={<Navigate to="/learning" replace />} />
          <Route path="/coding-lab"         element={<Navigate to="/coding" replace />} />
          <Route path="/interview-prep"     element={<Navigate to="/interview" replace />} />
          <Route path="/aptitude"           element={<Navigate to="/assessments" replace />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
