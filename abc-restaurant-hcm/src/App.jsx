import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SchedulePage from './pages/SchedulePage';
import EmployeesPage from './pages/EmployeesPage';
import PayrollPage from './pages/PayrollPage';
import ReimbursementsPage from './pages/ReimbursementsPage';
import ProfilePage from './pages/ProfilePage';
import ManagerProfile from './pages/ManagerProfile';
import EmployeeProfile from './pages/EmployeeProfile';
import ViewSchedule from './pages/ViewSchedule';

import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>


          <Route 
            element={<ProtectedRoute><MainLayout /></ProtectedRoute>}> 
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/schedule" element={<SchedulePage />} />


            <Route
                  path="/employees"
                  element={
                    <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                      <EmployeesPage />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/payroll"
                  element={
                    <ProtectedRoute allowedRoles={['MANAGER', 'FINANCE', 'ADMIN']}>
                      <PayrollPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="/reimbursements" element={<ReimbursementsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/manager-profile" element={<ManagerProfile />} />
                <Route path="/employee-profile" element={<EmployeeProfile />} />
                <Route path="/view-schedule" element={<ViewSchedule />} />
          </Route>
              
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;