import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth'; 

// Student Pages
import LoginPage from './pages/LoginPage';
import SubjectsPage from './pages/student/SubjectsPage';
import QuizPage from './pages/student/QuizPage'; 
import SubjectResultPage from './pages/student/SubjectResultPage';

// Admin Pages
import AdminDashBoard from './pages/admin/AdminDashBoard'; // Update import name
import AdminSubjectsPage from './pages/admin/AdminSubjectsPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';

function App() {
  // Using destructured values to avoid ESLint warnings
  const { loading } = useAuth();

  // Show a loading screen while authentication status is being determined
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Đang tải...</span>
        </div>
        <p style={{ marginTop: '20px', fontSize: '18px', color: '#555' }}>Đang tải dữ liệu, vui lòng đợi...</p>
      </div>
    );
  }
  
  // Thêm component kiểm tra quyền admin cho trang subjects
  function AdminSubjectsRoute() {
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (localUser?.type === 'admin') {
      return <AdminSubjectsPage />;
    }
    return <Navigate to="/admin/login" />;
  }

  // Thêm component kiểm tra quyền admin cho trang students
  function AdminStudentsRoute() {
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (localUser?.type === 'admin') {
      return <AdminStudentsPage />;
    }
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminDashBoard />} /> {/* Updated component name */}
        
        {/* Protected Student Routes */}
        <Route 
          path="/student/subjects" 
          element={
            (() => {
              const localUser = JSON.parse(localStorage.getItem('user') || '{}');
              return localUser?.type === 'student' ? <SubjectsPage /> : <Navigate to="/login" />;
            })()
          }
        />
        <Route 
          path="/student/quiz/:subjectId" 
          element={
            (() => {
              const localUser = JSON.parse(localStorage.getItem('user') || '{}');
              return localUser?.type === 'student' ? <QuizPage /> : <Navigate to="/login" />;
            })()
          }
        />
        <Route 
          path="/student/result/:subjectId" 
          element={
            (() => {
              const localUser = JSON.parse(localStorage.getItem('user') || '{}');
              return localUser?.type === 'student' ? <SubjectResultPage /> : <Navigate to="/login" />;
            })()
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/subjects"
          element={<AdminSubjectsRoute />}
        />
        
        {/* Thêm route cho trang quản lý sinh viên */}
        <Route
          path="/admin/students"
          element={<AdminStudentsRoute />}
        />
        
        {/* Thêm route cho dashboard admin */}
        <Route
          path="/admin"
          element={
            (() => {
              const localUser = JSON.parse(localStorage.getItem('user') || '{}');
              return localUser?.type === 'admin' ? <AdminDashBoard /> : <Navigate to="/admin/login" />; // Updated component name
            })()
          }
        />
            
        {/* Fallback for any other path */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;