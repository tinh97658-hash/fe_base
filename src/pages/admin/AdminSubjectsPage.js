// src/pages/admin/AdminSubjectsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminSubjectsPage.module.css';
import { getSubjects, getBatchSchedules, createBatchSchedule, deleteBatchSchedule } from '../../services/api';

const AdminSubjectsPage = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([
    'Công nghệ thông tin', 
    'Quản trị kinh doanh', 
    'Kế toán',
    'Marketing',
    'Tài chính ngân hàng',
    'Khoa học máy tính',
    'Hệ thống thông tin'
  ]);

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchSchedules, setBatchSchedules] = useState([]);
  
  const [batchForm, setBatchForm] = useState({
    department: '',
    startDate: '',
    startTime: '08:00',
    endDate: '',
    endTime: '17:00',
    notes: ''
  });

  // Fetch subjects and batch schedules
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subjectsData, batchData] = await Promise.all([
          getSubjects(),
          getBatchSchedules()
        ]);
        
        setSubjects(subjectsData);
        setBatchSchedules(batchData || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Open batch schedule modal
  const openBatchModal = () => {
    setBatchForm({
      department: '',
      startDate: '',
      startTime: '08:00',
      endDate: '',
      endTime: '17:00',
      notes: ''
    });
    setShowBatchModal(true);
  };

  // Close batch modal
  const closeBatchModal = () => {
    setShowBatchModal(false);
  };

  // Handle batch form change
  const handleBatchFormChange = (e) => {
    const { name, value } = e.target;
    setBatchForm({
      ...batchForm,
      [name]: value
    });
  };

  // Handle adding batch schedule - Updated for better error handling
  const handleAddBatchSchedule = async (e) => {
    e.preventDefault();
    
    if (!batchForm.department || !batchForm.startDate || !batchForm.endDate) {
      alert('Vui lòng điền đầy đủ thông tin lịch thi!');
      return;
    }
    
    try {
      // Format schedule data
      const newBatchSchedule = {
        id: Date.now(),
        department: batchForm.department,
        start: `${batchForm.startDate}T${batchForm.startTime}:00`,
        end: `${batchForm.endDate}T${batchForm.endTime}:00`,
        notes: batchForm.notes
      };
      
      // Update batch schedules through API
      const result = await createBatchSchedule(newBatchSchedule);
      
      // Update local state
      setBatchSchedules([...batchSchedules, result || newBatchSchedule]);
      
      alert('Đã lên lịch thi cho tất cả chuyên đề thành công!');
      closeBatchModal();
    } catch (err) {
      alert(`Lỗi: ${err.message || 'Không thể lưu lịch thi vào db.json'}`);
    }
  };

  // Handle delete batch schedule - Updated for better error handling
  const handleDeleteBatchSchedule = async (scheduleId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch thi này? Việc này sẽ xóa lịch thi cho tất cả chuyên đề.')) return;
    
    try {
      // Remove from API (which updates db.json)
      await deleteBatchSchedule(scheduleId);
      
      // Update local state
      setBatchSchedules(batchSchedules.filter(s => s.id !== scheduleId));
      
      alert('Xóa lịch thi thành công!');
    } catch (err) {
      alert(`Lỗi: ${err.message || 'Không thể xóa lịch thi từ db.json'}`);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN');
  };

  const isScheduleActive = (schedule) => {
    const now = new Date();
    const start = new Date(schedule.start);
    const end = new Date(schedule.end);
    return now >= start && now <= end;
  };
  
  const goToDashboard = () => {
    navigate('/admin');
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
          <i className="fas fa-exclamation-circle"></i>
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
              <i className="fas fa-book"></i>
            </div>
            <div className={styles.headerText}>
              <h1>Quản lý chuyên đề</h1>
              <p>Quản lý thông tin và lịch làm bài của chuyên đề</p>
            </div>
          </div>
          
          <div className={styles.headerActions}>
            <button className={styles.dashboardBtn} onClick={goToDashboard}>
              <i className="fas fa-tachometer-alt"></i>
              Dashboard
            </button>
            <button 
              className={styles.batchScheduleBtn} 
              onClick={openBatchModal}
              title="Lên lịch làm bài cho tất cả chuyên đề cùng lúc"
            >
              <i className="fas fa-calendar-alt"></i>
              Lên lịch thi tất cả chuyên đề
            </button>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <i className="fas fa-sign-out-alt"></i>
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className={styles.main}>
        {/* Batch schedules section */}
        <section className={styles.batchSchedulesSection}>
          <h2 className={styles.sectionTitle}>
            Lịch thi tất cả chuyên đề
            <button 
              className={styles.addBatchBtn}
              onClick={openBatchModal}
            >
              <i className="fas fa-plus"></i> Thêm lịch thi
            </button>
          </h2>
          
          <div className={styles.batchScheduleGrid}>
            {batchSchedules.length > 0 ? (
              batchSchedules.map((schedule) => (
                <div 
                  key={schedule.id} 
                  className={`${styles.batchScheduleCard} ${isScheduleActive(schedule) ? styles.activeBatchSchedule : ''}`}
                >
                  <div className={styles.batchScheduleHeader}>
                    <h3>Khoa {schedule.department}</h3>
                    <div className={styles.scheduleStatus}>
                      {isScheduleActive(schedule) ? (
                        <span className={styles.activeStatus}>Đang diễn ra</span>
                      ) : (
                        new Date(schedule.start) > new Date() ? (
                          <span className={styles.upcomingStatus}>Sắp diễn ra</span>
                        ) : (
                          <span className={styles.completedStatus}>Đã kết thúc</span>
                        )
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.batchScheduleInfo}>
                    <div className={styles.scheduleTime}>
                      <i className="fas fa-calendar-alt"></i>
                      <span>
                        {formatDateTime(schedule.start)} - {formatDateTime(schedule.end)}
                      </span>
                    </div>
                    {schedule.notes && (
                      <div className={styles.scheduleNotes}>
                        <i className="fas fa-sticky-note"></i>
                        <span>{schedule.notes}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.batchScheduleFooter}>
                    <span className={styles.subjectsIncluded}>
                      <i className="fas fa-book"></i> Tất cả 9 chuyên đề
                    </span>
                    <button 
                      className={styles.deleteBatchBtn}
                      onClick={() => handleDeleteBatchSchedule(schedule.id)}
                    >
                      <i className="fas fa-trash"></i> Xóa lịch thi
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptySchedule}>
                <p>Chưa có lịch thi chung cho các chuyên đề</p>
                <button 
                  className={styles.addFirstBatchBtn}
                  onClick={openBatchModal}
                >
                  <i className="fas fa-plus"></i> Tạo lịch thi đầu tiên
                </button>
              </div>
            )}
          </div>
        </section>

        <h2 className={styles.sectionTitle}>Danh sách chuyên đề</h2>
        
        <div className={styles.subjectsGrid}>
          {subjects.map(subject => (
            <div key={subject.id} className={styles.subjectCard}>
              <div className={styles.subjectHeader}>
                <h3>{subject.name}</h3>
                <div className={styles.subjectBadge}>
                  <span>{subject.totalQuestions} câu hỏi</span>
                </div>
              </div>
              
              <p className={styles.subjectDesc}>{subject.description}</p>
              
              <div className={styles.subjectDetails}>
                <div className={styles.detailItem}>
                  <i className="fas fa-clock"></i>
                  <span>Thời gian: {subject.timeLimit} phút</span>
                </div>
                <div className={styles.detailItem}>
                  <i className="fas fa-check-circle"></i>
                  <span>Điểm đạt: {subject.passScore}%</span>
                </div>
              </div>
              
              <div className={styles.subjectActions}>
                <button className={styles.editBtn}>
                  <i className="fas fa-edit"></i> Sửa chuyên đề
                </button>
                <button className={styles.viewBtn}>
                  <i className="fas fa-eye"></i> Xem câu hỏi
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Batch Schedule Modal */}
      {showBatchModal && (
        <div className={styles.modalOverlay} onClick={closeBatchModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Lên lịch thi cho tất cả chuyên đề</h3>
              <button className={styles.closeBtn} onClick={closeBatchModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <form onSubmit={handleAddBatchSchedule}>
                <div className={styles.formGroup}>
                  <label>Khoa/Ngành: *</label>
                  <select 
                    name="department" 
                    value={batchForm.department} 
                    onChange={handleBatchFormChange}
                    required
                    className={styles.formControl}
                  >
                    <option value="">-- Chọn khoa/ngành --</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Ngày bắt đầu: *</label>
                    <input 
                      type="date" 
                      name="startDate" 
                      value={batchForm.startDate} 
                      onChange={handleBatchFormChange}
                      required
                      className={styles.formControl}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Giờ bắt đầu: *</label>
                    <input 
                      type="time" 
                      name="startTime" 
                      value={batchForm.startTime} 
                      onChange={handleBatchFormChange}
                      required
                      className={styles.formControl}
                    />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Ngày kết thúc: *</label>
                    <input 
                      type="date" 
                      name="endDate" 
                      value={batchForm.endDate} 
                      onChange={handleBatchFormChange}
                      required
                      className={styles.formControl}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Giờ kết thúc: *</label>
                    <input 
                      type="time" 
                      name="endTime" 
                      value={batchForm.endTime} 
                      onChange={handleBatchFormChange}
                      required
                      className={styles.formControl}
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Ghi chú:</label>
                  <textarea
                    name="notes"
                    value={batchForm.notes}
                    onChange={handleBatchFormChange}
                    className={styles.formControl}
                    rows="3"
                    placeholder="Thêm ghi chú về lịch thi (nếu cần)"
                  ></textarea>
                </div>

                <div className={styles.batchInfoText}>
                  <i className="fas fa-info-circle"></i>
                  Lịch thi này sẽ áp dụng cho tất cả 9 chuyên đề. Sinh viên thuộc khoa đã chọn sẽ có thể làm bài tất cả chuyên đề trong khoảng thời gian này.
                </div>
                
                <div className={styles.modalActions}>
                  <button type="button" onClick={closeBatchModal} className={styles.cancelBtn}>
                    Hủy
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    <i className="fas fa-calendar-check"></i> Lên lịch cho tất cả chuyên đề
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjectsPage;