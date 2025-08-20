// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Student Pages
import LoginPage from './pages/LoginPage';
import SubjectsPage from './pages/student/SubjectsPage';
import QuizPage from './pages/student/QuizPage';
import SubjectResultPage from './pages/student/SubjectResultPage';
import HistoryPage from './pages/student/HistoryPage';
import ProfilePage from './pages/student/ProfilePage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSubjectsPage from './pages/admin/AdminSubjectsPage';
import AdminQuestionsPage from './pages/admin/AdminQuestionsPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminResultsPage from './pages/admin/AdminResultsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

import './App.css';

// Protected Route Components
const ProtectedStudentRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.type === 'student' ? children : <Navigate to="/student/login" />;
};

const ProtectedAdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.type === 'admin' ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/student/login" />} />

        {/* Student Routes */}
        <Route path="/student/login" element={<LoginPage />} />
        <Route 
          path="/student/subjects" 
          element={
            <ProtectedStudentRoute>
              <SubjectsPage />
            </ProtectedStudentRoute>
          } 
        />
        <Route 
          path="/student/quiz/:subjectId" 
          element={
            <ProtectedStudentRoute>
              <QuizPage />
            </ProtectedStudentRoute>
          } 
        />
        <Route 
          path="/student/result/:subjectId" 
          element={
            <ProtectedStudentRoute>
              <SubjectResultPage />
            </ProtectedStudentRoute>
          } 
        />
        <Route 
          path="/student/history" 
          element={
            <ProtectedStudentRoute>
              <HistoryPage />
            </ProtectedStudentRoute>
          } 
        />
        <Route 
          path="/student/profile" 
          element={
            <ProtectedStudentRoute>
              <ProfilePage />
            </ProtectedStudentRoute>
          } 
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/subjects" 
          element={
            <ProtectedAdminRoute>
              <AdminSubjectsPage />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/questions/:subjectId?" 
          element={
            <ProtectedAdminRoute>
              <AdminQuestionsPage />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/students" 
          element={
            <ProtectedAdminRoute>
              <AdminStudentsPage />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/results" 
          element={
            <ProtectedAdminRoute>
              <AdminResultsPage />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedAdminRoute>
              <AdminReportsPage />
            </ProtectedAdminRoute>
          } 
        />

        {/* Fallback - redirect to login if no route matches */}
        <Route path="*" element={<Navigate to="/student/login" />} />
      </Routes>
    </div>
  );
}

export default App;