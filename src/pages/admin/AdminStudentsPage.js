import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm useNavigate
import styles from './AdminStudentsPage.module.css';
import { getStudents, addStudent, updateStudent, deleteStudent, bulkDeleteStudents } from '../../services/api';

const AdminStudentsPage = () => {
  const navigate = useNavigate(); // Khởi tạo navigate
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMajor, setFilterMajor] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add', 'edit', 'view'
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    email: '',
    phone: '',
    class: '',
    major: '',
    status: 'active'
  });

  // Fetch students data from db.json
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const studentsData = await getStudents();
        setStudents(studentsData);
        setFilteredStudents(studentsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching students:', err);
        // Use default empty array without showing error
        setStudents([]);
        setFilteredStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter students based on search and filters
  useEffect(() => {
    let filtered = students.filter(student => {
      const matchesSearch = 
        student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
      const matchesMajor = filterMajor === 'all' || student.major === filterMajor;
      
      return matchesSearch && matchesStatus && matchesMajor;
    });
    
    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [students, searchTerm, filterStatus, filterMajor]);

  // Get unique majors for filter
  const majors = [...new Set(students.map(student => student.major).filter(Boolean))];

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === currentStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(currentStudents.map(student => student.id));
    }
  };

  const openModal = (type, student = null) => {
    setModalType(type);
    setCurrentStudent(student);
    
    if (type === 'add') {
      setFormData({
        studentId: '',
        fullName: '',
        email: '',
        phone: '',
        class: '',
        major: '',
        status: 'active'
      });
    } else if (type === 'edit' && student) {
      setFormData({
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        phone: student.phone,
        class: student.class,
        major: student.major,
        status: student.status
      });
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentStudent(null);
    setFormData({
      studentId: '',
      fullName: '',
      email: '',
      phone: '',
      class: '',
      major: '',
      status: 'active'
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (modalType === 'add') {
        const newStudent = {
          id: Date.now(),
          ...formData,
          joinDate: new Date().toISOString().split('T')[0],
          avatar: null
        };
        
        // Save to db.json
        await addStudent(newStudent);
        
        // Update local state
        setStudents(prev => [...prev, newStudent]);
        alert('Thêm sinh viên thành công!');
      } else if (modalType === 'edit') {
        const updatedStudent = {
          ...currentStudent,
          ...formData
        };
        
        // Save to db.json
        await updateStudent(updatedStudent);
        
        // Update local state
        setStudents(prev => prev.map(student => 
          student.id === currentStudent.id 
            ? updatedStudent
            : student
        ));
        alert('Cập nhật thông tin sinh viên thành công!');
      }
      
      closeModal();
    } catch (err) {
      alert(`Lỗi: ${err.message}. Vui lòng thử lại sau.`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
      setSaving(true);
      try {
        // Delete from db.json
        await deleteStudent(studentId);
        
        // Update local state
        setStudents(prev => prev.filter(student => student.id !== studentId));
        setSelectedStudents(prev => prev.filter(id => id !== studentId));
        
        alert('Xóa sinh viên thành công!');
      } catch (err) {
        alert(`Lỗi: ${err.message}. Vui lòng thử lại sau.`);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedStudents.length} sinh viên đã chọn?`)) {
      setSaving(true);
      try {
        // Delete multiple students from db.json
        await bulkDeleteStudents(selectedStudents);
        
        // Update local state
        setStudents(prev => prev.filter(student => !selectedStudents.includes(student.id)));
        setSelectedStudents([]);
        
        alert('Xóa sinh viên thành công!');
      } catch (err) {
        alert(`Lỗi: ${err.message}. Vui lòng thử lại sau.`);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    setSaving(true);
    try {
      // Find the student
      const studentToUpdate = students.find(student => student.id === studentId);
      if (!studentToUpdate) throw new Error('Sinh viên không tồn tại');
      
      const updatedStudent = {
        ...studentToUpdate,
        status: newStatus
      };
      
      // Update in db.json
      await updateStudent(updatedStudent);
      
      // Update local state
      setStudents(prev => prev.map(student => 
        student.id === studentId 
          ? updatedStudent
          : student
      ));
      
      alert(`Trạng thái sinh viên đã được ${newStatus === 'active' ? 'kích hoạt' : 'tạm khóa'}!`);
    } catch (err) {
      alert(`Lỗi: ${err.message}. Vui lòng thử lại sau.`);
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = (studentId) => {
    if (window.confirm('Bạn có chắc chắn muốn reset mật khẩu cho sinh viên này?')) {
      // Simulate password reset
      alert('Mật khẩu đã được reset thành công! Mật khẩu mới đã được gửi qua email.');
    }
  };

  // Hàm quay lại trang AdminLoginPage
  const goToDashboard = () => {
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải danh sách sinh viên...</p>
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
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            className={styles.backBtn}
            onClick={goToDashboard}
            title="Quay lại Dashboard"
            // Inline style để đảm bảo nút hiển thị ngay cả khi CSS module chưa có
            style={{
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              height: '36px',
              padding: '0 12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: '#475569',
              fontSize: '14px'
            }}
          >
            <i className="fas fa-arrow-left"></i>
            <span>Quay lại</span>
          </button>
          <div>
            <h1>
              <i className="fas fa-users"></i>
              Quản lý sinh viên
            </h1>
            <p>Quản lý thông tin và tài khoản sinh viên</p>
          </div>
        </div>
        <button 
          className={styles.addBtn}
          onClick={() => openModal('add')}
          disabled={saving}
        >
          <i className="fas fa-plus"></i>
          Thêm sinh viên
        </button>
      </div>

      {/* Saving overlay */}
      {saving && (
        <div className={styles.savingOverlay}>
          <div className={styles.savingContent}>
            <i className="fas fa-spinner fa-spin"></i>
            <p>Đang lưu dữ liệu...</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã SV, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Tạm khóa</option>
        </select>
        
        <select 
          value={filterMajor} 
          onChange={(e) => setFilterMajor(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">Tất cả ngành</option>
          {majors.map(major => (
            <option key={major} value={major}>{major}</option>
          ))}
        </select>

        {selectedStudents.length > 0 && (
          <button 
            className={styles.bulkDeleteBtn}
            onClick={handleBulkDelete}
            disabled={saving}
          >
            <i className="fas fa-trash"></i>
            Xóa ({selectedStudents.length})
          </button>
        )}
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-users"></i>
          </div>
          <div className={styles.statInfo}>
            <h3>{students.length}</h3>
            <p>Tổng sinh viên</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-user-check"></i>
          </div>
          <div className={styles.statInfo}>
            <h3>{students.filter(s => s.status === 'active').length}</h3>
            <p>Đang hoạt động</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-user-times"></i>
          </div>
          <div className={styles.statInfo}>
            <h3>{students.filter(s => s.status === 'inactive').length}</h3>
            <p>Tạm khóa</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-search"></i>
          </div>
          <div className={styles.statInfo}>
            <h3>{filteredStudents.length}</h3>
            <p>Kết quả tìm kiếm</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedStudents.length === currentStudents.length && currentStudents.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Mã SV</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Lớp</th>
              <th>Ngành</th>
              <th>Trạng thái</th>
              <th>Ngày tham gia</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.map(student => (
              <tr key={student.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleSelectStudent(student.id)}
                  />
                </td>
                <td>
                  <div className={styles.studentId}>
                    {student.studentId}
                  </div>
                </td>
                <td>
                  <div className={styles.studentInfo}>
                    <div className={styles.avatar}>
                      {student.avatar ? (
                        <img src={student.avatar} alt={student.fullName} />
                      ) : (
                        <i className="fas fa-user"></i>
                      )}
                    </div>
                    <div>
                      <div className={styles.name}>{student.fullName}</div>
                      <div className={styles.phone}>{student.phone}</div>
                    </div>
                  </div>
                </td>
                <td>{student.email}</td>
                <td>{student.class}</td>
                <td>{student.major}</td>
                <td>
                  <span className={`${styles.status} ${styles[student.status]}`}>
                    {student.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                  </span>
                </td>
                <td>{new Date(student.joinDate).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => openModal('view', student)}
                      title="Xem chi tiết"
                      disabled={saving}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      className={styles.actionBtn}
                      onClick={() => openModal('edit', student)}
                      title="Chỉnh sửa"
                      disabled={saving}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className={styles.actionBtn}
                      onClick={() => resetPassword(student.id)}
                      title="Reset mật khẩu"
                      disabled={saving}
                    >
                      <i className="fas fa-key"></i>
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.statusBtn}`}
                      onClick={() => handleStatusChange(
                        student.id, 
                        student.status === 'active' ? 'inactive' : 'active'
                      )}
                      title={student.status === 'active' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                      disabled={saving}
                    >
                      <i className={`fas ${student.status === 'active' ? 'fa-lock' : 'fa-unlock'}`}></i>
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => handleDeleteStudent(student.id)}
                      title="Xóa"
                      disabled={saving}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <div className={styles.noData}>
            <i className="fas fa-users-slash"></i>
            <p>Không tìm thấy sinh viên nào</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={currentPage === index + 1 ? styles.active : ''}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalType === 'add' && 'Thêm sinh viên mới'}
                {modalType === 'edit' && 'Chỉnh sửa thông tin sinh viên'}
                {modalType === 'view' && 'Thông tin chi tiết sinh viên'}
              </h2>
              <button className={styles.closeBtn} onClick={closeModal} disabled={saving}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {modalType === 'view' ? (
                <div className={styles.studentDetails}>
                  <div className={styles.detailRow}>
                    <label>Mã sinh viên:</label>
                    <span>{currentStudent.studentId}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Họ tên:</label>
                    <span>{currentStudent.fullName}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Email:</label>
                    <span>{currentStudent.email}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Số điện thoại:</label>
                    <span>{currentStudent.phone}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Lớp:</label>
                    <span>{currentStudent.class}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Ngành:</label>
                    <span>{currentStudent.major}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Trạng thái:</label>
                    <span className={`${styles.status} ${styles[currentStudent.status]}`}>
                      {currentStudent.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Ngày tham gia:</label>
                    <span>{new Date(currentStudent.joinDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label>Mã sinh viên *</label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                      required
                      disabled={saving}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Họ tên *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                      disabled={saving}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      disabled={saving}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={saving}
                    />
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Lớp *</label>
                      <input
                        type="text"
                        value={formData.class}
                        onChange={(e) => setFormData({...formData, class: e.target.value})}
                        required
                        disabled={saving}
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label>Ngành *</label>
                      <select
                        value={formData.major}
                        onChange={(e) => setFormData({...formData, major: e.target.value})}
                        required
                        disabled={saving}
                      >
                        <option value="">Chọn ngành</option>
                        {majors.map(major => (
                          <option key={major} value={major}>{major}</option>
                        ))}
                        <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                        <option value="Kế toán">Kế toán</option>
                        <option value="Quản trị kinh doanh">Quản trị kinh doanh</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Tài chính ngân hàng">Tài chính ngân hàng</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Trạng thái</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      disabled={saving}
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm khóa</option>
                    </select>
                  </div>
                  
                  <div className={styles.modalActions}>
                    <button 
                      type="button" 
                      onClick={closeModal} 
                      className={styles.cancelBtn}
                      disabled={saving}
                    >
                      Hủy
                    </button>
                    <button 
                      type="submit" 
                      className={styles.saveBtn}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                          {modalType === 'add' ? 'Đang thêm...' : 'Đang cập nhật...'}
                        </>
                      ) : (
                        modalType === 'add' ? 'Thêm sinh viên' : 'Cập nhật'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentsPage;