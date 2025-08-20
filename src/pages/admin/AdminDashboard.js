// src/pages/admin/AdminDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/student/login');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#1e293b', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h1>🛡️ Admin Dashboard</h1>
        <p>Chào mừng đến với trang quản trị hệ thống!</p>
        <button 
          onClick={handleLogout}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Đăng xuất
        </button>
      </div>
      
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Thống kê hệ thống</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div style={{ background: '#dbeafe', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: '#1d4ed8', margin: '0 0 10px 0' }}>5000</h3>
            <p style={{ margin: 0, color: '#374151' }}>Tổng sinh viên</p>
          </div>
          <div style={{ background: '#d1fae5', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: '#059669', margin: '0 0 10px 0' }}>3250</h3>
            <p style={{ margin: 0, color: '#374151' }}>Đã hoàn thành</p>
          </div>
          <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: '#d97706', margin: '0 0 10px 0' }}>1500</h3>
            <p style={{ margin: 0, color: '#374151' }}>Đang thực hiện</p>
          </div>
          <div style={{ background: '#fee2e2', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: '#dc2626', margin: '0 0 10px 0' }}>250</h3>
            <p style={{ margin: 0, color: '#374151' }}>Chưa bắt đầu</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;