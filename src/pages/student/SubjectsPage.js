import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubjects, getUserProgress, canTakeQuiz } from '../../services/api';
import styles from './SubjectsPage.module.css';
import { useAuth } from '../../hooks/useAuth';
const SubjectsPage = () => {
  const { user, isAuthenticated } = useAuth();
  
  console.log('=== AUTH DEBUG ===');
  console.log('User:', user);
  console.log('Is authenticated:', isAuthenticated);
  console.log('User type:', user?.type);
  console.log('=== AUTH END ===');
  const [subjects, setSubjects] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userInfo, setUserInfo] = useState({
    name: 'Nguyễn Văn A',
    studentId: 'SV001',
    class: 'Hàng Hải K20',
    totalCompleted: 0,
    totalSubjects: 0,
    averageScore: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
        try {
            setLoading(true);
            const userId = 'student123';
            
            const [subjectsData, progressData] = await Promise.all([
                getSubjects(),
                getUserProgress(userId).catch(() => ({}))
            ]);
            
            const localProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
            const combinedProgress = { ...progressData, ...(localProgress[userId] || {}) };
            
            setSubjects(subjectsData);
            setUserProgress(combinedProgress);
            
            const completedCount = Object.values(combinedProgress).filter(p => p.passed).length;
            const totalScore = Object.values(combinedProgress).reduce((sum, p) => sum + p.bestScore, 0);
            const averageScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;
            
            setUserInfo(prev => ({
                ...prev,
                totalCompleted: completedCount,
                totalSubjects: subjectsData.length,
                averageScore: averageScore
            }));
            
            setError(null);
        } catch (err) {
            setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            console.error('Error fetching subjects data:', err);
        } finally {
            setLoading(false);
        }
    };
    
    // Gọi hàm fetchData
    fetchData();
}, []); // <-- Thêm dependency array rỗng vào đây
  const getSubjectStatus = (subject) => {
    const progress = userProgress[subject.id];
    
    if (!progress) {
      return 'available';
    }
    
    if (progress.passed) {
      return 'completed';
    }
    
    if (progress.attempts > 0) {
      return 'in-progress';
    }
    
    return 'available';
  };

  const isSubjectLocked = (subjectId) => {
    // Lấy trạng thái từ localStorage
    const userProgress = JSON.parse(localStorage.getItem('userProgress')) || {};
    return userProgress[subjectId]?.passed === true;
  };

  const getSubjectScore = (subject) => {
    const progress = userProgress[subject.id];
    return progress ? progress.bestScore : 0;
  };

  const getSubjectAttempts = (subject) => {
    const progress = userProgress[subject.id];
    return progress ? progress.attempts : 0;
  };

  const getLastAttempt = (subject) => {
    const progress = userProgress[subject.id];
    if (!progress || !progress.lastAttempt) return null;
    
    const date = new Date(progress.lastAttempt);
    return date.toLocaleDateString('vi-VN');
  };

  const canStartQuiz = (subject) => {
    const status = getSubjectStatus(subject);
    return status === 'available' || status === 'in-progress';
  };

  const handleStartQuiz = async (subject) => {
    console.log('=== DEBUG START QUIZ ===');
    console.log('Subject:', subject);
    console.log('Subject ID:', subject.id);
    console.log('Can start quiz:', canStartQuiz(subject));
    console.log('Subject status:', getSubjectStatus(subject));
    
    // Lấy thông tin khoa từ user
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const studentDepartment = user.department || 'Công nghệ thông tin'; // Default to CNTT if not specified
    
    if (canStartQuiz(subject)) {
      try {
        // Kiểm tra lịch làm bài
        const canAccess = await canTakeQuiz(subject.id, studentDepartment);
        
        if (!canAccess) {
          alert(`Không thể làm bài vào lúc này. Chuyên đề này chưa mở cho khoa ${studentDepartment}.`);
          return;
        }
        
        navigate(`/student/quiz/${subject.id}`);
      } catch (err) {
        console.error('Error checking quiz access:', err);
        alert('Có lỗi xảy ra khi kiểm tra quyền truy cập bài thi. Vui lòng thử lại sau.');
      }
    } else {
      alert('Chuyên đề này đã bị khóa hoặc bạn đã hoàn thành trước đó.');
    }
    
    console.log('=== DEBUG END ===');
};

  const handleViewResult = (subject) => {
    const progress = userProgress[subject.id];
    if (progress && progress.attempts > 0) {
      // For now, just show an alert with results
      // In a real app, you might navigate to a detailed results page
      alert(`Kết quả chi tiết:\nĐiểm cao nhất: ${progress.bestScore}%\nSố lần làm: ${progress.attempts}\nTrạng thái: ${progress.passed ? 'ĐẠT' : 'CHƯA ĐẠT'}`);
    }
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

  const getProgressPercentage = () => {
    return userInfo.totalSubjects > 0 
      ? Math.round((userInfo.totalCompleted / userInfo.totalSubjects) * 100)
      : 0;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.logo}>
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div className={styles.headerText}>
              <h1>Hệ thống Trắc nghiệm</h1>
              <p>Sinh hoạt Công dân</p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                <i className="fas fa-user"></i>
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>{userInfo.name}</span>
                <span className={styles.userClass}>{userInfo.class}</span>
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
        {/* User Stats */}
        <section className={styles.statsSection}>
          <div className={styles.statsCard}>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <i className="fas fa-tasks"></i>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{userInfo.totalCompleted}/{userInfo.totalSubjects}</div>
                <div className={styles.statLabel}>Chuyên đề hoàn thành</div>
              </div>
            </div>
            
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <i className="fas fa-chart-line"></i>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{getProgressPercentage()}%</div>
                <div className={styles.statLabel}>Tiến độ hoàn thành</div>
              </div>
            </div>
            
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <i className="fas fa-star"></i>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{userInfo.averageScore}%</div>
                <div className={styles.statLabel}>Điểm trung bình</div>
              </div>
            </div>
          </div>
        </section>

        {/* Subjects List */}
        <section className={styles.subjectsSection}>
          <h2 className={styles.sectionTitle}>Danh sách chuyên đề</h2>
          <div className={styles.subjectsGrid}>
            {subjects.map((subject) => {
              const status = getSubjectStatus(subject);
              const score = getSubjectScore(subject);
              const attempts = getSubjectAttempts(subject);
              const lastAttempt = getLastAttempt(subject);
              const statusBadge = getStatusBadge(status);
              const locked = isSubjectLocked(subject.id); // Kiểm tra trạng thái khóa

              return (
                <div key={subject.id} className={`${styles.subjectCard} ${styles[status]} ${locked ? styles.locked : ''}`}>
                  <div className={styles.cardHeader}>
                    <div className={styles.subjectNumber}>
                      Chuyên đề {subject.id}
                    </div>
                    <div className={`${styles.statusBadge} ${statusBadge.class}`}>
                      {statusBadge.text}
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <h3 className={styles.subjectTitle}>{subject.name}</h3>
                    <p className={styles.subjectDescription}>{subject.description}</p>

                    <div className={styles.subjectMeta}>
                      <div className={styles.metaItem}>
                        <i className="fas fa-question-circle"></i>
                        <span>{subject.totalQuestions} câu hỏi</span>
                      </div>
                      <div className={styles.metaItem}>
                        <i className="fas fa-clock"></i>
                        <span>{subject.timeLimit} phút</span>
                      </div>
                      <div className={styles.metaItem}>
                        <i className="fas fa-target"></i>
                        <span>Qua môn: {subject.passScore}%</span>
                      </div>
                    </div>

                    {attempts > 0 && (
                      <div className={styles.progressInfo}>
                        <div className={styles.scoreInfo}>
                          <span className={styles.scoreLabel}>Điểm cao nhất:</span>
                          <span className={`${styles.scoreValue} ${score >= subject.passScore ? styles.passed : styles.failed}`}>
                            {score}%
                          </span>
                        </div>
                        <div className={styles.attemptInfo}>
                          <span>Số lần làm: {attempts}</span>
                          {lastAttempt && <span>Lần cuối: {lastAttempt}</span>}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardActions}>
                    {locked ? (
                      <button className={styles.lockedBtn} disabled>
                        <i className="fas fa-lock"></i>
                        Đã hoàn thành
                      </button>
                    ) : status === 'completed' ? (
                      <div className={styles.actionGroup}>
                        <button 
                          className={styles.viewResultBtn}
                          onClick={() => handleViewResult(subject)}
                        >
                          <i className="fas fa-chart-bar"></i>
                          Xem kết quả
                        </button>
                        <button 
                          className={styles.retakeBtn}
                          onClick={() => handleStartQuiz(subject)}
                        >
                          <i className="fas fa-redo"></i>
                          Làm lại
                        </button>
                      </div>
                    ) : status === 'in-progress' ? (
                      <div className={styles.actionGroup}>
                        <button 
                          className={styles.viewResultBtn}
                          onClick={() => handleViewResult(subject)}
                        >
                          <i className="fas fa-chart-bar"></i>
                          Xem kết quả
                        </button>
                        <button 
                          className={styles.continueBtn}
                          onClick={() => handleStartQuiz(subject)}
                        >
                          <i className="fas fa-play"></i>
                          Làm lại
                        </button>
                      </div>
                    ) : status === 'available' ? (
                      <button 
                        className={styles.startBtn}
                        onClick={() => handleStartQuiz(subject)}
                      >
                        <i className="fas fa-play"></i>
                        Bắt đầu làm bài
                      </button>
                    ) : (
                      <button className={styles.lockedBtn} disabled>
                        <i className="fas fa-lock"></i>
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