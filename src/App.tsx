/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import ProjectsSelection from './pages/ProjectsSelection';
import TurnoSelection from './pages/TurnoSelection';
import PresencaFlow from './pages/PresencaFlow';
import Dashboard from './pages/Dashboard';
import Relatorios from './pages/Relatorios';
import AdminFuncionarios from './pages/AdminFuncionarios';
import AdminProjects from './pages/AdminProjects';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminAuditoria from './pages/AdminAuditoria';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<ProjectsSelection />} />
            <Route path="/projects/:id/turno" element={<TurnoSelection />} />
            <Route path="/projects/:id/presenca" element={<PresencaFlow />} />
            
            {/* Admin Only Routes */}
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="ADMIN"><Dashboard /></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute requiredRole="ADMIN"><Relatorios /></ProtectedRoute>} />
            <Route path="/admin/funcionarios" element={<ProtectedRoute requiredRole="ADMIN"><AdminFuncionarios /></ProtectedRoute>} />
            <Route path="/admin/projects" element={<ProtectedRoute requiredRole="ADMIN"><AdminProjects /></ProtectedRoute>} />
            <Route path="/admin/usuarios" element={<ProtectedRoute requiredRole="ADMIN"><AdminUsuarios /></ProtectedRoute>} />
            <Route path="/admin/auditoria" element={<ProtectedRoute requiredRole="ADMIN"><AdminAuditoria /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

