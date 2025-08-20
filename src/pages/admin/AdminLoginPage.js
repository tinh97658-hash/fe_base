// src/pages/AdminLoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminLoginPage.module.css';

const AdminLoginPage = () => {
  const [stats, setStats] = useState({
    totalStudents: 5000,
    completedStudents: 3250,
    inProgressStudents: 1500,
    notStartedStudents: 250
  });
  
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, student: 'Nguyễn Văn A', action: 'Hoàn thành Chuyên đề 1', time: '2 phút trước', type: 'success' },
    { id: 2, student: 'Trần Thị B', action: 'Bắt đầu Chuyên đề 3', time: '5 phút trước', type: 'info' },
    { id: 3, student: 'Lê Văn C', action: 'Làm lại Chuyên đề 2', time: '10 phút trước', type: 'warning' },
    { id: 4, student: 'Phạm Thị D', action: 'Hoàn thành Chuyên đề 5', time: '15 phút trước', type: 'success' },
    { id: 5, student: 'Hoàng Văn E', action: 'Đăng nhập hệ thống', time: '20 phút trước', type: 'info' }
  ]);

  const [topicProgress, setTopicProgress] = useState([
    { name: 'Chuyên đề 1', completed: 85, total: 100 },
    { name: 'Chuyên đề 2', completed: 78, total: 100 },
    { name: 'Chuyên đề 3', completed: 92, total: 100 },
    { name: 'Chuyên đề 4', completed: 67, total: 100 },
    { name: 'Chuyên đề 5', completed: 73, total: 100 }
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        completedStudents: prev.completedStudents + Math.floor(Math.random() * 3),
        inProgressStudents: prev.inProgressStudents - Math.floor(Math.random() * 2)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const getCompletionPercentage = () => {
    return Math.round((stats.completedStudents / stats.totalStudents) * 100);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'warning': return 'fas fa-redo';
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-circle';
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.logo}>
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className={styles.headerText}>
              <h1>Admin Dashboard</h1>
              <p>Hệ thống Quản lý Trắc nghiệm Sinh hoạt Công dân</p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.adminInfo}>
              <div className={styles.adminAvatar}>
                <i className="fas fa-user-shield"></i>
              </div>
              <div className={styles.adminDetails}>
                <span className={styles.adminName}>Admin System</span>
                <span className={styles.adminRole}>Quản trị viên</span>
              </div>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <i className="fas fa-sign-out-alt"></i>
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Stats Overview */}
        <section className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>Tổng quan hệ thống</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon + ' ' + styles.blueIcon}>
                <i className="fas fa-users"></i>
              </div>
              <div className={styles.statContent}>
                <h3>Tổng sinh viên</h3>
                <div className={styles.statNumber}>{stats.totalStudents.toLocaleString()}</div>
                <p className={styles.statDescription}>Đã đăng ký hệ thống</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon + ' ' + styles.greenIcon}>
                <i className="fas fa-check-circle"></i>
              </div>
              <div className={styles.statContent}>
                <h3>Đã hoàn thành</h3>
                <div className={styles.statNumber}>{stats.completedStudents.toLocaleString()}</div>
                <p className={styles.statDescription}>{getCompletionPercentage()}% tổng số</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon + ' ' + styles.yellowIcon}>
                <i className="fas fa-clock"></i>
              </div>
              <div className={styles.statContent}>
                <h3>Đang thực hiện</h3>
                <div className={styles.statNumber}>{stats.inProgressStudents.toLocaleString()}</div>
                <p className={styles.statDescription}>Đang làm bài</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon + ' ' + styles.redIcon}>
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className={styles.statContent}>
                <h3>Chưa bắt đầu</h3>
                <div className={styles.statNumber}>{stats.notStartedStudents.toLocaleString()}</div>
                <p className={styles.statDescription}>Cần theo dõi</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className={styles.contentGrid}>
          {/* Topic Progress */}
          <section className={styles.progressSection}>
            <h3 className={styles.cardTitle}>Tiến độ theo chuyên đề</h3>
            <div className={styles.progressList}>
              {topicProgress.map((topic, index) => (
                <div key={index} className={styles.progressItem}>
                  <div className={styles.progressHeader}>
                    <span className={styles.topicName}>{topic.name}</span>
                    <span className={styles.progressPercent}>{topic.completed}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${topic.completed}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activities */}
          <section className={styles.activitySection}>
            <h3 className={styles.cardTitle}>Hoạt động gần đây</h3>
            <div className={styles.activityList}>
              {recentActivities.map((activity) => (
                <div key={activity.id} className={styles.activityItem}>
                  <div className={`${styles.activityIcon} ${styles[activity.type]}`}>
                    <i className={getActivityIcon(activity.type)}></i>
                  </div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityText}>
                      <strong>{activity.student}</strong> {activity.action}
                    </div>
                    <div className={styles.activityTime}>{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Quick Actions */}
        <section className={styles.actionsSection}>
          <h3 className={styles.sectionTitle}>Thao tác nhanh</h3>
          <div className={styles.actionsGrid}>
            <button className={styles.actionCard}>
              <div className={styles.actionIcon}>
                <i className="fas fa-users-cog"></i>
              </div>
              <div className={styles.actionContent}>
                <h4>Quản lý sinh viên</h4>
                <p>Xem danh sách và quản lý tài khoản sinh viên</p>
              </div>
            </button>

            <button className={styles.actionCard}>
              <div className={styles.actionIcon}>
                <i className="fas fa-tasks"></i>
              </div>
              <div className={styles.actionContent}>
                <h4>Quản lý chuyên đề</h4>
                <p>Chỉnh sửa câu hỏi và nội dung bài thi</p>
              </div>
            </button>

            <button className={styles.actionCard}>
              <div className={styles.actionIcon}>
                <i className="fas fa-chart-bar"></i>
              </div>
              <div className={styles.actionContent}>
                <h4>Báo cáo kết quả</h4>
                <p>Xem thống kê và xuất báo cáo chi tiết</p>
              </div>
            </button>

            <button className={styles.actionCard}>
              <div className={styles.actionIcon}>
                <i className="fas fa-download"></i>
              </div>
              <div className={styles.actionContent}>
                <h4>Xuất dữ liệu</h4>
                <p>Tải xuống báo cáo Excel và PDF</p>
              </div>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminLoginPage;