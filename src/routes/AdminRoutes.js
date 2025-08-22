import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Admin Pages
import AdminSubjectsPage from '../pages/admin/AdminSubjectsPage';
import AdminQuestionsPage from '../pages/admin/AdminQuestionsPage';
import AdminStudentsPage from '../pages/admin/AdminStudentsPage';
import AdminResultsPage from '../pages/admin/AdminResultsPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';

const AdminRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  // Check if user is authenticated and is an admin
  if (!isAuthenticated || user?.type !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="subjects" element={<AdminSubjectsPage />} />
      <Route path="questions/:subjectId?" element={<AdminQuestionsPage />} />
      <Route path="students" element={<AdminStudentsPage />} />
      <Route path="results" element={<AdminResultsPage />} />
      <Route path="reports" element={<AdminReportsPage />} />
      <Route path="*" element={<Navigate to="/admin" />} />
    </Routes>
  );
};

export default AdminRoutes;