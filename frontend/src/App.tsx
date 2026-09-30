import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeModeProvider } from './context/ThemeModeContext';
import SplashScreen from './components/SplashScreen';
import JDAIBadge from './components/JDAIBadge';
import LandingPage from './pages/LandingPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import LoginPage from './pages/LoginPage';
import ConnectDevicesPage from './pages/ConnectDevicesPage';
import SyncSimulationPage from './pages/SyncSimulationPage';
import DataPreparationPage from './pages/DataPreparationPage';
import FarmerTodayPage from './pages/FarmerTodayPage';
import PatternDetailsPage from './pages/PatternDetailsPage';
import FarmerActionPlanPage from './pages/FarmerActionPlanPage';
import ActionPlanPage from './pages/ActionPlanPage';
import ActionRecordedPage from './pages/ActionRecordedPage';
import BeforeAfterPage from './pages/BeforeAfterPage';
import LiveDashboard from './pages/LiveDashboard';
import FarmerMachinesPage from './pages/FarmerMachinesPage';
import ViewDataPage from './pages/ViewDataPage';
import PMDashboardPage from './pages/PMDashboardPage';

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    // Show splash screen on first launch
    return true;
  });

  return (
    <LanguageProvider>
      <ThemeModeProvider>
        {showSplash ? (
          <SplashScreen onComplete={() => setShowSplash(false)} durationMs={3000} />
        ) : (
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/role-selection" element={<RoleSelectionPage />} />
              <Route path="/login/:role" element={<LoginPage />} />
              <Route path="/farmer/connect" element={<ConnectDevicesPage />} />
              <Route path="/farmer/connect-devices" element={<ConnectDevicesPage />} />
              <Route path="/farmer/sync" element={<SyncSimulationPage />} />
              <Route path="/farmer/prepare-data" element={<DataPreparationPage />} />
              <Route path="/farmer/today" element={<FarmerTodayPage />} />
              <Route path="/farmer/live" element={<LiveDashboard />} />
              <Route path="/farmer/view-data" element={<ViewDataPage />} />
              <Route path="/farmer/alerts/:alertId/pattern" element={<PatternDetailsPage />} />
              <Route path="/farmer/pattern/:alertId" element={<PatternDetailsPage />} />
              <Route path="/farmer/action/:alertId" element={<ActionPlanPage />} />
              <Route path="/farmer/alerts/:alertId/action" element={<ActionPlanPage />} />
              <Route path="/farmer/action-plan" element={<ActionPlanPage />} />
              <Route path="/farmer/alerts/:alertId/recorded" element={<ActionRecordedPage />} />
              <Route path="/farmer/recorded" element={<ActionRecordedPage />} />
              <Route path="/farmer/alerts/:alertId/before-after" element={<BeforeAfterPage />} />
              <Route path="/farmer/before-after/:actionId" element={<BeforeAfterPage />} />
              <Route path="/farmer/before-after" element={<BeforeAfterPage />} />
              <Route path="/farmer/machines" element={<FarmerMachinesPage />} />
              <Route path="/pm/dashboard" element={<PMDashboardPage />} />
              <Route path="/pm" element={<PMDashboardPage />} />
              <Route path="/pm/analytics" element={<PMDashboardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <JDAIBadge />
          </Router>
        )}
      </ThemeModeProvider>
    </LanguageProvider>
  );
};

export default App;
