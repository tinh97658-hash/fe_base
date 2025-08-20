import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Student Pages
import LoginPage from './pages/LoginPage';
import SubjectsPage from './pages/student/SubjectsPage';

// Admin Pages  
import AdminLoginPage from './pages/admin/AdminLoginPage';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/student/login" />} />

        {/* Public Routes */}
        <Route path="/student/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        {/* Student Routes */}
        <Route path="/student/subjects" element={<SubjectsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/student/login" />} />
      </Routes>
    </div>
  );
}

export default App;