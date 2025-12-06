import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Books } from './pages/Books';
import { Authors } from './pages/Authors';
import { Users } from './pages/Users';
import { Layout } from './components/Layout';
import { useAuthStore } from './store';
import { UserRole } from './types';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const user = useAuthStore((state) => state.user);
  if (user?.role !== UserRole.ADMIN) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="authors" element={<Authors />} />
          <Route path="users" element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          } />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;