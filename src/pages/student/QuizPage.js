import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, getSubjects, saveQuizResult } from '../../services/api';
import styles from './QuizPage.module.css';

const QuizPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [subject, setSubject] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Pre-load db.json once to avoid multiple fetch requests
        try {
          await fetch('/db.json');
        } catch (e) {
          console.log('Could not preload db.json', e);
        }
        
        const [quizData, subjectsData] = await Promise.all([
          getQuiz(subjectId),
          getSubjects()
        ]);

        // Debug logging reduced to one place
        console.log(`Loaded quiz for subject ${subjectId}, questions count: ${quizData.questions.length}`);

        const subjectData = subjectsData.find(s => parseInt(s.id) === parseInt(subjectId));
        if (!subjectData) {
          setError(`Không tìm thấy chuyên đề với ID ${subjectId}.`);
          setLoading(false);
          return;
        }

        setQuiz(quizData);
        setSubject(subjectData);
        setTimeLeft(subjectData.timeLimit * 60); // Convert minutes to seconds
        setError(null);
      } catch (err) {
        console.error('Error in QuizPage:', err);
        setError('Không thể tải bài thi. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subjectId]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const handleAnswerChange = (questionId, optionId, isMultiple = false) => {
    setAnswers(prev => {
      if (isMultiple) {
        const currentAnswers = prev[questionId] || [];
        const newAnswers = currentAnswers.includes(optionId)
          ? currentAnswers.filter(id => id !== optionId)
          : [...currentAnswers, optionId];
        return { ...prev, [questionId]: newAnswers };
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const calculateScore = () => {
    if (!quiz || !quiz.questions) return 0;
    let correctAnswers = 0;
    
    quiz.questions.forEach(question => {
      const userAnswers = answers[question.id] || [];
      const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt.id);
      
      // Check if user answers match correct answers exactly
      const isCorrect = userAnswers.length === correctOptions.length &&
        userAnswers.every(answer => correctOptions.includes(answer)) &&
        correctOptions.every(correct => userAnswers.includes(correct));
      
      if (isCorrect) {
        correctAnswers++;
      }
    });
    
    return Math.round((correctAnswers / quiz.questions.length) * 100);
  };

  // Improve handleSubmit to handle empty questions case
  const handleSubmit = async () => {
    if (!quiz || !quiz.questions || !quiz.questions.length || !subject) {
      console.log('Cannot submit quiz - missing data');
      return;
    }
    
    const score = calculateScore();
    const passed = score >= subject.passScore;

    try {
      // Save result (in real app, this would be sent to backend)
      const userId = 'student123'; // In real app, get from auth context
      await saveQuizResult(userId, subjectId, score, passed);

      // Lưu trạng thái hoàn thành vào localStorage
      const userProgress = JSON.parse(localStorage.getItem('userProgress')) || {};
      userProgress[subjectId] = { passed: passed };
      localStorage.setItem('userProgress', JSON.stringify(userProgress));

      setResult({
        score,
        passed,
        correctAnswers: Math.round((score / 100) * quiz.questions.length),
        totalQuestions: quiz.questions.length,
        passScore: subject.passScore
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error saving quiz result:', error);
      alert('Có lỗi xảy ra khi lưu kết quả. Vui lòng thử lại.');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index) => {
    const question = quiz.questions[index];
    const hasAnswer = answers[question.id] && answers[question.id].length > 0;
    
    if (index === currentQuestion) return 'current';
    if (hasAnswer) return 'answered';
    return 'unanswered';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải bài thi...</p>
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
          <button onClick={() => navigate('/student/subjects')}>Quay lại</button>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.questions) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <i className="fas fa-exclamation-triangle"></i>
          <p>Không tìm thấy bài thi.</p>
          <button onClick={() => navigate('/student/subjects')}>Quay lại</button>
        </div>
      </div>
    );
  }

  if (!loading && quiz && Array.isArray(quiz.questions) && quiz.questions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <i className="fas fa-info-circle"></i>
            <p>Chuyên đề này hiện chưa có câu hỏi. Vui lòng quay lại sau.</p>
          <button onClick={() => navigate('/student/subjects')}>Quay lại</button>
        </div>
      </div>
    );
  }

  if (isSubmitted && result) {
    return (
      <div className={styles.container}>
        <div className={styles.resultContainer}>
          <div className={styles.resultCard}>
            <div className={`${styles.resultIcon} ${result.passed ? styles.passed : styles.failed}`}>
              <i className={result.passed ? 'fas fa-check-circle' : 'fas fa-times-circle'}></i>
            </div>
            
            <h2 className={styles.resultTitle}>
              {result.passed ? 'Chúc mừng! Bạn đã vượt qua bài thi' : 'Bạn chưa đạt điểm qua môn'}
            </h2>
            
            <div className={styles.scoreDisplay}>
              <div className={styles.mainScore}>{result.score}%</div>
              <div className={styles.scoreDetails}>
                {result.correctAnswers}/{result.totalQuestions} câu đúng
              </div>
            </div>
            
            <div className={styles.resultStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Điểm của bạn:</span>
                <span className={styles.statValue}>{result.score}%</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Điểm qua môn:</span>
                <span className={styles.statValue}>{result.passScore}%</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Kết quả:</span>
                <span className={`${styles.statValue} ${result.passed ? styles.passText : styles.failText}`}>
                  {result.passed ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                </span>
              </div>
            </div>
            
            <div className={styles.resultActions}>
              {/* Always show the Back button regardless of result */}
              <button 
                className={styles.backBtn}
                onClick={() => navigate('/student/subjects')}
              >
                Quay lại danh sách môn học
              </button>
              
              {/* Only show retry button for students who failed */}
              {!result.passed && (
                <button 
                  className={styles.retryBtn}
                  onClick={() => window.location.reload()}
                >
                  Làm lại bài thi
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Kiểm tra dữ liệu trước khi truy cập questions
  if (!quiz || !quiz.questions) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải bài thi...</p>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.subjectInfo}>
            <h1>{subject.name}</h1>
            <p>{subject.description}</p>
          </div>
          <div className={styles.timer}>
            <i className="fas fa-clock"></i>
            <span className={timeLeft <= 300 ? styles.timeWarning : ''}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </header>

      <div className={styles.quizContent}>
        {/* Question Navigation */}
        <div className={styles.questionNav}>
          <h3>Câu hỏi</h3>
          <div className={styles.questionGrid}>
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                className={`${styles.questionNavBtn} ${styles[getQuestionStatus(index)]}`}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.current}`}></div>
              <span>Hiện tại</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.answered}`}></div>
              <span>Đã trả lời</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.unanswered}`}></div>
              <span>Chưa trả lời</span>
            </div>
          </div>
          {/* Nút nộp bài luôn hiển thị dưới danh sách câu hỏi */}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={loading || error || isSubmitted}
            >
              Nộp bài
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>

        {/* Question Content */}
        <div className={styles.questionContent}>
          <div className={styles.questionHeader}>
            <span className={styles.questionNumber}>
              Câu {currentQuestion + 1}/{quiz.questions.length}
            </span>
            <span className={styles.questionType}>
              {currentQ.type === 'multiple' ? 'Nhiều đáp án đúng' : 'Một đáp án đúng'}
            </span>
          </div>
          
          <div className={styles.questionText}>
            {currentQ.question}
          </div>
          
          <div className={styles.options}>
            {currentQ.options.map(option => (
              <label key={option.id} className={styles.optionLabel}>
                <input
                  type={currentQ.type === 'multiple' ? 'checkbox' : 'radio'}
                  name={`question-${currentQ.id}`}
                  value={option.id}
                  checked={answers[currentQ.id]?.includes(option.id) || false}
                  onChange={() => handleAnswerChange(currentQ.id, option.id, currentQ.type === 'multiple')}
                />
                <span className={styles.optionText}>{option.text}</span>
              </label>
            ))}
          </div>
          
          <div className={styles.questionActions}>
            <button
              className={styles.prevBtn}
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              <i className="fas fa-chevron-left"></i>
              <span>Pre</span>
            </button>
            <button
              className={styles.nextBtn}
              onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
              disabled={currentQuestion === quiz.questions.length - 1}
            >
              <span>Next</span>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;