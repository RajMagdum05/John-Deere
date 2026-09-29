import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeModeProvider } from './context/ThemeModeContext';
import RoleSelectionPage from './pages/RoleSelectionPage';
import LoginPage from './pages/LoginPage';
import ConnectDevicesPage from './pages/ConnectDevicesPage';
import SyncSimulationPage from './pages/SyncSimulationPage';
import FarmerTodayPage from './pages/FarmerTodayPage';
import PatternDetailsPage from './pages/PatternDetailsPage';
import FarmerActionPlanPage from './pages/FarmerActionPlanPage';
import FarmerMachinesPage from './pages/FarmerMachinesPage';
import FarmerAssistantPage from './pages/FarmerAssistantPage';
import FarmerHistoryPage from './pages/FarmerHistoryPage';
import PMDashboard from './pages/PMDashboard';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeModeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<RoleSelectionPage />} />
            <Route path="/login/:role" element={<LoginPage />} />
            <Route path="/farmer/connect" element={<ConnectDevicesPage />} />
            <Route path="/farmer/sync" element={<SyncSimulationPage />} />
            <Route path="/farmer/today" element={<FarmerTodayPage />} />
            <Route path="/farmer/alerts/:alertId/pattern" element={<PatternDetailsPage />} />
            <Route path="/farmer/alerts/:alertId/action" element={<FarmerActionPlanPage />} />
            <Route path="/farmer/alerts/:alertId/recorded" element={<FarmerTodayPage />} />
            <Route path="/farmer/action-plan" element={<FarmerActionPlanPage />} />
            <Route path="/farmer/machines" element={<FarmerMachinesPage />} />
            <Route path="/farmer/assistant" element={<FarmerAssistantPage />} />
            <Route path="/farmer/history" element={<FarmerHistoryPage />} />
            <Route path="/pm/dashboard" element={<PMDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeModeProvider>
    </LanguageProvider>
  );
};

export default App;
