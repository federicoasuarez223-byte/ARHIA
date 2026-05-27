import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AttendancePage } from '@/pages/AttendancePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { AutomationPage } from '@/pages/AutomationPage';
import { ChatPage } from '@/pages/ChatPage';
import { ContractsPage } from '@/pages/ContractsPage';
import { CulturePage } from '@/pages/CulturePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { EmployeesPage } from '@/pages/EmployeesPage';
import { IntegrationsPage } from '@/pages/IntegrationsPage';
import { PayrollPage } from '@/pages/PayrollPage';
import { PerformancePage } from '@/pages/PerformancePage';
import { RecruitmentPage } from '@/pages/RecruitmentPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { RiskPage } from '@/pages/RiskPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { TrainingPage } from '@/pages/TrainingPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="risk" element={<RiskPage />} />
            <Route path="recruitment" element={<RecruitmentPage />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="payroll" element={<PayrollPage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="training" element={<TrainingPage />} />
            <Route path="culture" element={<CulturePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="automation" element={<AutomationPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="chat" element={<ChatPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
