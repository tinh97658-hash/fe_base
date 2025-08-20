import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '72px', margin: '0', color: '#667eea' }}>404</h1>
      <h2 style={{ fontSize: '24px', margin: '16px 0', color: '#374151' }}>
        Trang không tồn tại
      </h2>
      <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>
        Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
      </p>
      <Link 
        to="/student/login" 
        style={{
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '600'
        }}
      >
        Về trang chủ
      </Link>
    </div>
  );
};
export default NotFoundPage;