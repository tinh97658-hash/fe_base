import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SubjectsPage.module.css';

const SubjectsPage = () => {
  const [subjects] = useState([
    {
      id: 1,
      title: 'Chuyên đề 1: Tư tưởng Hồ Chí Minh về độc lập dân tộc',
      description: 'Tìm hiểu về tư tưởng độc lập dân tộc trong học thuyết Hồ Chí Minh',
      questions: 20,
      timeLimit: 30,
      status: 'completed',
      score: 85,
      attempts: 2,
      lastAttempt: '2024-01-15'
    },
    {
      id: 2,
      title: 'Chuyên đề 2: Tư tưởng Hồ Chí Minh về dân chủ xã hội chủ nghĩa',
      description: 'Nghiên cứu quan điểm của Bác Hồ về xây dựng nền dân chủ xã hội chủ nghĩa',
      questions: 25,
      timeLimit: 35,
      status: 'in-progress',
      score: 0,
      attempts: 1,
      lastAttempt: null
    },
    {
      id: 3,
      title: 'Chuyên đề 3: Tư tưởng Hồ Chí Minh về đại đoàn kết dân tộc',
      description: 'Tìm hiểu về tư tưởng đại đoàn kết trong sự nghiệp xây dựng và bảo vệ Tổ quốc',
      questions: 22,
      timeLimit: 32,
      status: 'available',
      score: 0,
      attempts: 0,
      lastAttempt: null
    },
    {
      id: 4,
      title: 'Chuyên đề 4: Tư tưởng Hồ Chí Minh về con người và phát triển con người',
      description: 'Nghiên cứu quan điểm nhân văn và phát triển toàn diện con người',
      questions: 28,
      timeLimit: 40,
      status: 'available',
      score: 0,
      attempts: 0,
      lastAttempt: null
    },
    {
      id: 5,
      title: 'Chuyên đề 5: Tư tưởng Hồ Chí Minh về văn hóa, đạo đức',
      description: 'Tìm hiểu về tư tưởng văn hóa và đạo đức cách mạng trong học thuyết Hồ Chí Minh',
      questions: 24,
      timeLimit: 36,
      status: 'locked',
      score: 0,
      attempts: 0,
      lastAttempt: null
    }
  ]);

  const [userInfo] = useState({
    name: 'Nguyễn Văn A',
    studentId: 'SV001',
    class: 'Hàng Hải K20',
    totalCompleted: 1,
    totalSubjects: 5,
    averageScore: 85
  });

  const navigate = useNavigate();

  const handleStartQuiz = (subjectId) => {
    navigate(`/student/quiz/${subjectId}`);
  };

  const handleViewResult = (subjectId) => {
    navigate(`/student/result/${subjectId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/student/login');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { text: 'Đã hoàn thành', class: styles.completed };
      case 'in-progress':
        return { text: 'Đang thực hiện', class: styles.inProgress };
      case 'available':
        return { text: 'Có thể làm', class: styles.available };
      case 'locked':
        return { text: 'Chưa mở khóa', class: styles.locked };
      default:
        return { text: 'Không xác định', class: styles.unknown };
    }
  };

  return (
    <div className={styles.subjectsPage}>
      {/* Header */}
      <header className={styles.header}>
        <h1>Hệ thống Trắc nghiệm</h1>
        <p>Tuần Sinh hoạt Công dân - Sinh viên Hàng Hải</p>
        <div style={{ marginTop: 8, color: "#fff", fontWeight: 500 }}>
          {userInfo.name} &nbsp; {userInfo.class}
        </div>
        <div className={styles.headerActions}>
          <button 
            onClick={() => navigate('/student/history')}
            className={styles.historyBtn}
          >
            Lịch sử
          </button>
          <button 
            onClick={() => navigate('/student/profile')}
            className={styles.profileBtn}
          >
            Hồ sơ
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Đăng xuất
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Progress Overview */}
        <section className={styles.progressSection}>
          <h2 style={{ fontWeight: 600, fontSize: "20px", marginBottom: 12 }}>Tiến độ học tập</h2>
          <div className={styles.progressStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{userInfo.totalCompleted}</span>
              <span className={styles.statLabel}>Đã hoàn thành</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{userInfo.totalSubjects}</span>
              <span className={styles.statLabel}>Tổng chuyên đề</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{userInfo.averageScore}</span>
              <span className={styles.statLabel}>Điểm trung bình</span>
            </div>
          </div>
        </section>

        {/* Subjects List */}
        <section className={styles.subjectsSection}>
          <h2 className={styles.sectionTitle}>Danh sách chuyên đề</h2>
          <div className={styles.subjectsGrid}>
            {subjects.map((subject) => {
              const statusBadge = getStatusBadge(subject.status);
              return (
                <div key={subject.id} className={styles.subjectCard}>
                  <div className={styles.cardHeader}>
                    <div className={`${styles.statusBadge} ${statusBadge.class}`}>
                      {statusBadge.text}
                    </div>
                  </div>
                  
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{subject.title}</h3>
                    <p className={styles.cardDescription}>{subject.description}</p>
                    
                    <div className={styles.cardMeta}>
                      <div className={styles.metaItem}>
                        {subject.questions} câu hỏi
                      </div>
                      <div className={styles.metaItem}>
                        {subject.timeLimit} phút
                      </div>
                      {subject.attempts > 0 && (
                        <div className={styles.metaItem}>
                          {subject.attempts} lần làm
                        </div>
                      )}
                    </div>

                    {subject.status === 'completed' && (
                      <div className={styles.scoreInfo}>
                        <span className={styles.scoreLabel}>Điểm cao nhất: </span>
                        <span className={styles.scoreValue}>{subject.score}/100</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardActions}>
                    {subject.status === 'completed' && (
                      <>
                        <button 
                          onClick={() => handleViewResult(subject.id)}
                          className={styles.viewResultBtn}
                        >
                          Xem kết quả
                        </button>
                        <button 
                          onClick={() => handleStartQuiz(subject.id)}
                          className={styles.retakeBtn}
                        >
                          Làm lại
                        </button>
                      </>
                    )}
                    
                    {(subject.status === 'available' || subject.status === 'in-progress') && (
                      <button 
                        onClick={() => handleStartQuiz(subject.id)}
                        className={styles.startBtn}
                      >
                        {subject.status === 'in-progress' ? 'Tiếp tục' : 'Bắt đầu'}
                      </button>
                    )}
                    
                    {subject.status === 'locked' && (
                      <button className={styles.lockedBtn} disabled>
                        Chưa mở khóa
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default SubjectsPage;