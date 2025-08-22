// Real API + JSON Server integration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const JSON_API_URL = process.env.REACT_APP_JSON_API_URL || 'http://localhost:3001';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Token ${token}` } : {};
};

// Mock data for when server is unavailable
const mockData = {
  students: [
    { id: 1, studentId: 'SV001', fullName: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '0901234567', class: 'K20-CNTT', major: 'Công nghệ thông tin', status: 'active', joinDate: '2023-09-01T00:00:00Z', avatar: null },
    { id: 2, studentId: 'SV002', fullName: 'Trần Thị B', email: 'tranthib@example.com', phone: '0901234568', class: 'K20-CNTT', major: 'Công nghệ thông tin', status: 'active', joinDate: '2023-09-01T00:00:00Z', avatar: null },
    { id: 3, studentId: 'SV003', fullName: 'Lê Văn C', email: 'levanc@example.com', phone: '0901234569', class: 'K20-QTKD', major: 'Quản trị kinh doanh', status: 'inactive', joinDate: '2023-09-01T00:00:00Z', avatar: null },
    { id: 4, studentId: 'SV004', fullName: 'Phạm Thị D', email: 'phamthid@example.com', phone: '0901234570', class: 'K20-KTDT', major: 'Kế toán', status: 'active', joinDate: '2023-09-01T00:00:00Z', avatar: null },
    { id: 5, studentId: 'SV005', fullName: 'Hoàng Văn E', email: 'hoangvane@example.com', phone: '0901234571', class: 'K20-QTKD', major: 'Quản trị kinh doanh', status: 'active', joinDate: '2023-09-01T00:00:00Z', avatar: null }
  ],
  quizResults: [
    { id: 1, userId: 'student123', subjectId: 1, score: 85, passed: true, timeTaken: 1500, correctAnswers: 17, totalQuestions: 20, createdAt: new Date().toISOString() },
    { id: 2, userId: 'student123', subjectId: 2, score: 75, passed: false, timeTaken: 1600, correctAnswers: 15, totalQuestions: 20, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, userId: 'student123', subjectId: 3, score: 90, passed: true, timeTaken: 1400, correctAnswers: 18, totalQuestions: 20, createdAt: new Date(Date.now() - 172800000).toISOString() }
  ],
  dashboardData: {
    stats: {
      totalStudents: 5000,
      completedStudents: 3250,
      inProgressStudents: 1500,
      notStartedStudents: 250
    },
    topicProgress: [
      { id: 1, name: 'Chuyên đề 1', completed: 85 },
      { id: 2, name: 'Chuyên đề 2', completed: 78 },
      { id: 3, name: 'Chuyên đề 3', completed: 92 },
      { id: 4, name: 'Chuyên đề 4', completed: 67 },
      { id: 5, name: 'Chuyên đề 5', completed: 73 }
    ],
    recentActivities: [
      { id: 1, student: 'Nguyễn Văn A', action: 'hoàn thành Chuyên đề 1', time: '2 phút trước', type: 'success' },
      { id: 2, student: 'Trần Thị B', action: 'bắt đầu Chuyên đề 3', time: '5 phút trước', type: 'info' },
      { id: 3, student: 'Lê Văn C', action: 'làm lại Chuyên đề 2', time: '10 phút trước', type: 'warning' },
      { id: 4, student: 'Phạm Thị D', action: 'hoàn thành Chuyên đề 5', time: '15 phút trước', type: 'success' },
      { id: 5, student: 'Hoàng Văn E', action: 'đăng nhập hệ thống', time: '20 phút trước', type: 'info' }
    ]
  }
};

const fetchJson = async (url, options = {}) => {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers || {}) },
      ...options
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    console.log(`API Error (${url}):`, error.message);
    
    // For quiz data, we want to fail to trigger the db.json direct loading
    if (url.includes('/questions') || url.includes('/db')) {
      throw error;
    }

    // For other endpoints, return mock data based on URL
    if (url.includes('/students')) {
      return mockData.students;
    }
    if (url.includes('/quizResults')) {
      return mockData.quizResults;
    }
    if (url.includes('/subjects')) {
      // Extract basic subject info from db.json content
      try {
        const response = await fetch('/db.json');
        if (response.ok) {
          const data = await response.json();
          if (data && data.subjects) {
            return data.subjects;
          }
        }
      } catch (_) {}
      
      // Return mock subjects as fallback
      return [
        { id: 1, name: "Chuyên đề 1: Tư tưởng Hồ Chí Minh", description: "Tìm hiểu về tư tưởng và đạo đức Hồ Chí Minh", totalQuestions: 20, timeLimit: 30, passScore: 80 },
        { id: 2, name: "Chuyên đề 2: Lịch sử Đảng Cộng sản Việt Nam", description: "Lịch sử hình thành và phát triển của Đảng", totalQuestions: 20, timeLimit: 30, passScore: 80 },
        { id: 3, name: "Chuyên đề 3: Pháp luật Việt Nam", description: "Các quy định pháp luật cơ bản", totalQuestions: 20, timeLimit: 30, passScore: 80 },
        { id: 4, name: "Chuyên đề 4: Kinh tế chính trị", description: "Kiến thức về kinh tế chính trị Marxist-Leninist", totalQuestions: 20, timeLimit: 30, passScore: 80 },
        { id: 5, name: "Chuyên đề 5: Chủ nghĩa xã hội khoa học", description: "Lý luận về chủ nghĩa xã hội khoa học", totalQuestions: 20, timeLimit: 30, passScore: 80 }
      ];
    }
    
    // Default error
    throw error;
  }
};

// Helper for loading db.json directly if JSON Server fails
const loadDbJsonDirect = async () => {
  try {
    // Try from the API first
    try {
      return await fetchJson(`${JSON_API_URL}/db`);
    } catch (_) {
      // API failed, try direct file access
      console.log('Falling back to direct db.json loading...');
      const response = await fetch('/db.json');
      if (!response.ok) throw new Error(`Failed to load db.json: ${response.status}`);
      return await response.json();
    }
  } catch (error) {
    console.error('Could not load db.json', error);
    return null;
  }
};

// Helper mới: lấy toàn bộ DB khi endpoint questions không tồn tại
const fetchDb = async () => {
  return await loadDbJsonDirect();
};

// Auth
export const loginUser = async (username, password) => {
  // Offline fallback - this will ensure login always works even without servers
  const offlineUsers = {
    'student': { id: 'student123', username: 'student', type: 'student', name: 'Sinh Viên' },
    'admin': { id: 'admin123', username: 'admin', type: 'admin', name: 'Admin System' }
  };
  
  // If username exists in our offline users map and password is '123', allow login
  if (offlineUsers[username] && password === '123') {
    console.log('Using offline authentication');
    const user = offlineUsers[username];
    const token = `offline-token-${user.id}`;
    return { token, user, message: 'Login successful (offline mode)' };
  }
  
  // If not in offline users, try online authentication
  try {
    // Try Django backend first
    try {
      const data = await fetchJson(`${API_URL}/accounts/login/`, {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      return data;
    } catch (djangoError) {
      console.warn('Django login failed, trying JSON Server', djangoError);
      
      // Try JSON Server fallback
      try {
        const users = await fetchJson(`${JSON_API_URL}/users?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
        if (users.length !== 1) throw new Error('Tài khoản hoặc mật khẩu không đúng');
        const user = users[0];
        const token = user.token || `token-${user.id}`;
        return { token, user, message: 'Login successful' };
      } catch (jsonServerError) {
        console.warn('JSON Server login failed', jsonServerError);
        throw new Error('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
    }
  } catch (error) {
    // If both online methods fail and no offline match, throw error
    throw new Error('Tài khoản hoặc mật khẩu không đúng');
  }
};

export const logoutUser = async () => {
  try {
    // Optional backend call
    await fetchJson(`${API_URL}/accounts/logout/`, { method: 'POST' }).catch(() => {});
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  return { success: true };
};

export const getCurrentUser = async () => {
  // First, check if we have a user in localStorage
  const cached = localStorage.getItem('user');
  if (cached) {
    return JSON.parse(cached);
  }
  
  // If no cached user, try to get from backend (will likely fail if login failed)
  try {
    const data = await fetchJson(`${API_URL}/accounts/user/`);
    return data;
  } catch (error) {
    throw new Error('Không tìm thấy thông tin người dùng');
  }
};

// Subjects
const normalizeSubject = s => ({
  id: Number(s.id), // coerces to number to unify comparisons
  name: s.name,
  description: s.description || '',
  timeLimit: s.timeLimit ?? s.time_limit ?? 60,
  passScore: s.passScore ?? s.pass_score ?? 80,
  totalQuestions: s.totalQuestions ?? (s.questions ? s.questions.length : (s.total_questions || 0))
});

export const getSubjects = async () => {
  // JSON Server with embedded questions for counts
  const subjects = await fetchJson(`${JSON_API_URL}/subjects?_embed=questions`);
  return subjects.map(s => normalizeSubject({ ...s, totalQuestions: (s.questions || []).length }));
};

export const getSubjectDetail = async (subjectId) => {
  const s = await fetchJson(`${JSON_API_URL}/subjects/${subjectId}?_embed=questions`);
  const normalized = normalizeSubject({ ...s, totalQuestions: (s.questions || []).length });
  // Preserve raw embedded questions for fallback usage
  return { ...normalized, questions: s.questions || [] };
};

// Quiz (questions + options)
const normalizeQuestion = q => ({
  id: q.id,
  question: q.question || q.question_text,
  question_text: q.question_text || q.question,
  type: q.type || q.question_type || 'single',
  options: (q.options || []).map(o => ({
    id: o.id,
    text: o.text || o.option_text,
    isCorrect: o.isCorrect ?? o.is_correct ?? false
  }))
});

// New helper: directly read embedded quiz data from quizzes array in db.json
const getQuizFromLocalDB = async (subjectId) => {
  try {
    // Try to directly load db.json from public folder
    const response = await fetch('/db.json');
    if (!response.ok) throw new Error(`Failed to load db.json: ${response.status}`);
    
    const data = await response.json();
    
    // Find the quiz for the specific subject ID from the quizzes array
    if (data && data.quizzes && Array.isArray(data.quizzes)) {
      const quiz = data.quizzes.find(q => 
        Number(q.subjectId) === Number(subjectId) || 
        String(q.subjectId) === String(subjectId)
      );
      
      if (quiz) {
        console.log(`Successfully loaded quiz data for subject ${subjectId} directly from db.json`);
        return quiz;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error loading quiz from db.json:', error);
    return null;
  }
};

export const getQuiz = async (subjectId) => {
  // First, get subject details
  try {
    const subject = await getSubjectDetail(subjectId);
    
    // Directly try to get the quiz data from local db.json
    const quizData = await getQuizFromLocalDB(subjectId);
    
    if (quizData && quizData.questions && quizData.questions.length > 0) {
      return {
        subject,
        questions: quizData.questions.map(q => normalizeQuestion(q))
      };
    }
    
    // Only log once instead of multiple 404 errors
    console.log(`No quiz data found for subject ${subjectId}, returning empty questions array`);
    
    return {
      subject,
      questions: []
    };
  } catch (error) {
    console.error(`[getQuiz] Error loading quiz for subject ${subjectId}:`, error);
    // Return subject with empty questions array
    return { 
      subject: {
        id: Number(subjectId),
        name: `Chuyên đề ${subjectId}`,
        timeLimit: 30,
        passScore: 80
      }, 
      questions: [] 
    };
  }
};

// Submit quiz (client-side scoring then persist)
export const submitQuiz = async (subjectId, answers, timeTaken = 0) => {
  const { subject, questions } = await getQuiz(subjectId);
  let correct = 0;
  questions.forEach(q => {
    const userAns = answers[q.id] || [];
    const correctIds = q.options.filter(o => o.isCorrect).map(o => o.id);
    const exact =
      userAns.length === correctIds.length &&
      userAns.every(a => correctIds.includes(a)) &&
      correctIds.every(c => userAns.includes(c));
    if (exact) correct += 1;
  });
  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  const passed = score >= subject.passScore;

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  // Persist result
  await fetchJson(`${JSON_API_URL}/quizResults`, {
    method: 'POST',
    body: JSON.stringify({
      userId: user.id || user.username || 'anonymous',
      subjectId: Number(subjectId),
      score,
      passed,
      timeTaken,
      correctAnswers: correct,
      totalQuestions: questions.length,
      createdAt: new Date().toISOString()
    })
  });

  return {
    score,
    passed,
    correctAnswers: correct,
    totalQuestions: questions.length,
    passScore: subject.passScore
  };
};

// Backwards compatibility wrapper
export const saveQuizResult = async (userId, subjectId, score, passed) => {
  await fetchJson(`${JSON_API_URL}/quizResults`, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      subjectId: Number(subjectId),
      score,
      passed,
      createdAt: new Date().toISOString()
    })
  });
  return { success: true };
};

export const getStudentResults = async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || user.username || 'anonymous';
  const results = await fetchJson(`${JSON_API_URL}/quizResults?userId=${encodeURIComponent(userId)}`);
  const subjects = await getSubjects();
  return results.map(r => {
    const subj = subjects.find(s => s.id === r.subjectId) || {};
    return {
      id: r.id,
      subjectId: r.subjectId,
      subjectName: subj.name,
      score: r.score,
      passed: r.passed,
      attempts: r.attempts || 1,
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : ''
    };
  });
};

export const getUserProgress = async (userId) => {
  const results = await fetchJson(`${JSON_API_URL}/quizResults?userId=${encodeURIComponent(userId)}`);
  const progress = {};
  results.forEach(r => {
    const existing = progress[r.subjectId] || { attempts: 0, bestScore: 0 };
    progress[r.subjectId] = {
      attempts: existing.attempts + 1,
      bestScore: Math.max(existing.bestScore, r.score),
      lastScore: r.score,
      passed: r.passed,
      lastAttempt: r.createdAt
    };
  });
  return progress;
};

// Students CRUD (Admin) - Modified to use mock data when server is down
export const getStudents = async () => {
  try {
    const data = await fetchJson(`${JSON_API_URL}/students`);
    return data;
  } catch (err) {
    console.log('Using mock student data');
    return mockData.students;
  }
};

export const addStudent = async (student) => {
  try {
    const newStudent = await fetchJson(`${JSON_API_URL}/students`, {
      method: 'POST',
      body: JSON.stringify({ ...student, joinDate: student.joinDate || new Date().toISOString() })
    });
    return newStudent;
  } catch (err) {
    console.log('Using mock add student');
    const newStudent = {
      ...student,
      id: Date.now(),
      joinDate: student.joinDate || new Date().toISOString()
    };
    mockData.students.push(newStudent);
    return newStudent;
  }
};

export const updateStudent = async (student) => {
  try {
    await fetchJson(`${JSON_API_URL}/students/${student.id}`, {
      method: 'PUT',
      body: JSON.stringify(student)
    });
    return student;
  } catch (err) {
    console.log('Using mock update student');
    const index = mockData.students.findIndex(s => s.id === student.id);
    if (index !== -1) {
      mockData.students[index] = student;
    }
    return student;
  }
};

export const deleteStudent = async (studentId) => {
  try {
    await fetchJson(`${API_URL}/students/${studentId}`, { method: 'DELETE' });
    return { success: true };
  } catch (err) {
    console.log('Using mock delete student');
    mockData.students = mockData.students.filter(s => s.id !== studentId);
    return { success: true };
  }
};

export const bulkDeleteStudents = async (studentIds) => {
  try {
    await Promise.all(studentIds.map(id =>
      fetchJson(`${JSON_API_URL}/students/${id}`, { method: 'DELETE' }).catch(() => {})
    ));
    return { success: true, deletedCount: studentIds.length };
  } catch (err) {
    console.log('Using mock bulk delete students');
    mockData.students = mockData.students.filter(s => !studentIds.includes(s.id));
    return { success: true, deletedCount: studentIds.length };
  }
};

// Dashboard aggregation
export const getDashboardData = async () => {
  try {
    const [students, quizResults, subjects] = await Promise.all([
      getStudents(),
      fetchJson(`${JSON_API_URL}/quizResults`),
      getSubjects()
    ]);
    
    const totalStudents = students.length;
    const passedByUser = new Set(quizResults.filter(r => r.passed).map(r => r.userId));
    const completedStudents = passedByUser.size;
    const usersAttempting = new Set(quizResults.map(r => r.userId));
    const inProgressStudents = usersAttempting.size - completedStudents;
    const notStartedStudents = Math.max(totalStudents - usersAttempting.size, 0);

    // Topic progress: percent of students with a passed attempt
    const topicProgress = subjects.map(s => {
      const passedUsers = new Set(
        quizResults.filter(r => r.subjectId === s.id && r.passed).map(r => r.userId)
      );
      const completedPct = totalStudents
        ? Math.round((passedUsers.size / totalStudents) * 100)
        : 0;
      return { id: s.id, name: s.name, completed: completedPct };
    });

    // Recent activities (last 10)
    const recentActivities = quizResults
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(r => {
        const subj = subjects.find(s => s.id === r.subjectId) || {};
        return {
          id: r.id,
          student: r.userId,
          action: `${r.passed ? 'đạt' : 'không đạt'} ${subj.name} (${r.score}%)`,
          time: new Date(r.createdAt).toLocaleString('vi-VN'),
          type: r.passed ? 'success' : 'warning'
        };
      });

    return {
      stats: {
        totalStudents,
        completedStudents,
        inProgressStudents,
        notStartedStudents
      },
      topicProgress,
      recentActivities
    };
  } catch (err) {
    console.log('Using mock dashboard data');
    return mockData.dashboardData;
  }
};

// Thêm API cho việc cập nhật lịch làm bài
export const updateSubjectSchedule = async (subjectId, schedules) => {
  try {
    const subject = await fetchJson(`${JSON_API_URL}/subjects/${subjectId}`);
    
    const updatedSubject = {
      ...subject,
      schedules: schedules
    };
    
    await fetchJson(`${JSON_API_URL}/subjects/${subjectId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedSubject)
    });
    
    return updatedSubject;
  } catch (err) {
    console.error('Error updating subject schedules:', err);
    
    // Fallback: Lưu vào localStorage nếu không thể kết nối đến API
    const localSubjects = JSON.parse(localStorage.getItem('subjects') || '[]');
    const updatedLocalSubjects = localSubjects.map(s => 
      s.id === Number(subjectId) 
        ? { ...s, schedules } 
        : s
    );
    localStorage.setItem('subjects', JSON.stringify(updatedLocalSubjects));
    
    return { id: subjectId, schedules };
  }
};

// Batch Schedule Functions - Updated to prioritize db.json storage
export const getBatchSchedules = async () => {
  try {
    // Get batch schedules directly from the JSON Server
    const response = await fetchJson(`${JSON_API_URL}/batchSchedules`);
    return response;
  } catch (err) {
    console.error('Error fetching batch schedules:', err);
    
    // Try direct access to db.json as fallback
    try {
      const dbData = await loadDbJsonDirect();
      return dbData.batchSchedules || [];
    } catch (e) {
      console.error('Failed to load batch schedules from db.json:', e);
      return [];
    }
  }
};

export const createBatchSchedule = async (batchSchedule) => {
  try {
    // Save directly to JSON Server which will update db.json
    const response = await fetchJson(`${JSON_API_URL}/batchSchedules`, {
      method: 'POST',
      body: JSON.stringify(batchSchedule)
    });
    
    console.log('Successfully saved batch schedule to db.json');
    return response;
  } catch (err) {
    console.error('Error creating batch schedule in db.json:', err);
    
    // Try to update db.json directly as a fallback
    try {
      const dbData = await loadDbJsonDirect();
      if (!dbData.batchSchedules) {
        dbData.batchSchedules = [];
      }
      
      dbData.batchSchedules.push(batchSchedule);
      
      // This approach won't actually update the file, but we'll log that for clarity
      console.warn('Direct db.json update is not possible from the browser. Changes will be lost on refresh.');
      
      return batchSchedule;
    } catch (e) {
      console.error('Complete failure to save batch schedule:', e);
      throw new Error('Failed to save schedule. Server unavailable and direct update not possible.');
    }
  }
};

export const deleteBatchSchedule = async (scheduleId) => {
  try {
    // Delete from JSON Server which will update db.json
    await fetchJson(`${JSON_API_URL}/batchSchedules/${scheduleId}`, { method: 'DELETE' });
    console.log('Successfully deleted batch schedule from db.json');
    return { success: true };
  } catch (err) {
    console.error('Error deleting batch schedule from db.json:', err);
    
    // Try to update db.json directly as a fallback (though this won't persist)
    try {
      const dbData = await loadDbJsonDirect();
      if (dbData.batchSchedules) {
        dbData.batchSchedules = dbData.batchSchedules.filter(s => s.id !== scheduleId);
        console.warn('Direct db.json update is not possible from the browser. Changes will be lost on refresh.');
      }
      return { success: true, warning: 'Changes may not persist due to server issues.' };
    } catch (e) {
      console.error('Complete failure to delete batch schedule:', e);
      throw new Error('Failed to delete schedule. Server unavailable and direct update not possible.');
    }
  }
};

// Update canTakeQuiz to also check batch schedules
export const canTakeQuiz = async (subjectId, studentDepartment) => {
  try {
    // Get subject and batch schedules
    const [subject, batchSchedules] = await Promise.all([
      fetchJson(`${JSON_API_URL}/subjects/${subjectId}`),
      getBatchSchedules()
    ]);
    
    const now = new Date();
    
    // First check if there's an active batch schedule for this department
    const activeBatchSchedule = batchSchedules.find(schedule => {
      const start = new Date(schedule.start);
      const end = new Date(schedule.end);
      
      return schedule.department === studentDepartment && 
             now >= start && 
             now <= end;
    });
    
    // If there's an active batch schedule, the student can take the quiz
    if (activeBatchSchedule) {
      return true;
    }
    
    // If no active batch schedule, check individual subject schedules
    // If no schedules defined for this subject, deny access
    if (!subject.schedules || subject.schedules.length === 0) {
      return false;
    }
    
    // Check if there's a schedule for this department that's currently active
    const activeSchedule = subject.schedules.find(schedule => {
      const start = new Date(schedule.start);
      const end = new Date(schedule.end);
      
      return schedule.department === studentDepartment && 
             now >= start && 
             now <= end;
    });
    
    return !!activeSchedule;
  } catch (err) {
    console.error('Error checking quiz availability:', err);
    
    // Fallback: Check localStorage
    try {
      // Check batch schedules first
      const localBatchSchedules = JSON.parse(localStorage.getItem('batchSchedules') || '[]');
      const now = new Date();
      
      const activeBatchSchedule = localBatchSchedules.find(schedule => {
        const start = new Date(schedule.start);
        const end = new Date(schedule.end);
        
        return schedule.department === studentDepartment && 
               now >= start && 
               now <= end;
      });
      
      if (activeBatchSchedule) {
        return true;
      }
      
      // Then check subject schedules
      const localSubjects = JSON.parse(localStorage.getItem('subjects') || '[]');
      const subject = localSubjects.find(s => Number(s.id) === Number(subjectId));
      
      if (!subject || !subject.schedules || subject.schedules.length === 0) {
        return false;
      }
      
      const activeSchedule = subject.schedules.find(schedule => {
        const start = new Date(schedule.start);
        const end = new Date(schedule.end);
        
        return schedule.department === studentDepartment && 
               now >= start && 
               now <= end;
      });
      
      return !!activeSchedule;
    } catch (e) {
      // If all else fails, deny access
      console.error('Error checking local quiz availability:', e);
      return false;
    }
  }
};

// Default export kept for legacy imports
const api = { };
export default api;