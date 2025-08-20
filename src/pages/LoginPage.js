import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        rememberMe: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const navigate = useNavigate();

    // Check if user is already logged in
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.type === 'student') {
            navigate('/subjects');
        } else if (user.type === 'admin') {
            navigate('/admin/dashboard');
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear messages when user types
        setError('');
        setSuccess('');
    };

    const fillDemo = (type) => {
        setFormData(prev => ({
            ...prev,
            username: type,
            password: '123'
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.username || !formData.password) {
            setError('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        setLoading(true);
        setError('');

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            if (formData.username === 'student' && formData.password === '123') {
                const userData = {
                    type: 'student',
                    username: 'student',
                    name: 'Nguyễn Văn A',
                    studentId: 'SV2024001',
                    class: 'Hàng Hải K20A',
                    email: 'student@maritime.edu.vn',
                    loginTime: new Date().toISOString()
                };
                
                localStorage.setItem('user', JSON.stringify(userData));
                if (formData.rememberMe) {
                    localStorage.setItem('rememberLogin', 'true');
                }
                
                setSuccess('Đăng nhập thành công! Đang chuyển hướng...');
                
                setTimeout(() => {
                    navigate('/student/subjects');
                }, 1000);
                
            } else if (formData.username === 'admin' && formData.password === '123') {
                const userData = {
                    type: 'admin',
                    username: 'admin',
                    name: 'Quản trị viên',
                    role: 'Administrator',
                    email: 'admin@maritime.edu.vn',
                    loginTime: new Date().toISOString()
                };
                
                localStorage.setItem('user', JSON.stringify(userData));
                if (formData.rememberMe) {
                    localStorage.setItem('rememberLogin', 'true');
                }
                
                setSuccess('Đăng nhập thành công! Đang chuyển hướng...');
                
                setTimeout(() => {
                    navigate('/admin/dashboard');
                }, 1000);
                
            } else {
                setError('Tài khoản hoặc mật khẩu không đúng!');
            }
        } catch (err) {
            setError('Đã xảy ra lỗi. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.background}>
                <div className={styles.wave}></div>
                <div className={styles.wave}></div>
            </div>
            
            <div className={styles.loginContainer}>
                <div className={styles.header}>
                    <div className={styles.logoContainer}>
                        <div className={styles.icon}>⚓</div>
                        <div className={styles.logoRing}></div>
                    </div>
                    <h1 className={styles.title}>Hệ thống Trắc nghiệm</h1>
                    <p className={styles.subtitle}>Tuần Sinh hoạt Công dân - Sinh viên Hàng Hải</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            <i className="fas fa-exclamation-triangle"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className={styles.successMessage}>
                            <i className="fas fa-check-circle"></i>
                            <span>{success}</span>
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="username">Mã sinh viên / Tài khoản</label>
                        <div className={styles.inputWrapper}>
                            <i className="fas fa-user"></i>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Nhập mã sinh viên hoặc tài khoản"
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Mật khẩu</label>
                        <div className={styles.inputWrapper}>
                            <i className="fas fa-lock"></i>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Nhập mật khẩu"
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.options}>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleInputChange}
                            />
                            <span className={styles.checkmark}></span>
                            <span>Ghi nhớ đăng nhập</span>
                        </label>
                        <a href="#" className={styles.forgotPassword}>Quên mật khẩu?</a>
                    </div>

                    <button type="submit" className={styles.loginButton} disabled={loading}>
                        {loading ? (
                            <>
                                <div className={styles.spinner}></div>
                                Đang đăng nhập...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-sign-in-alt"></i>
                                Đăng nhập
                            </>
                        )}
                    </button>
                </form>

                <div className={styles.divider}>
                    <span>hoặc</span>
                </div>

                <div className={styles.demo}>
                    <p>Tài khoản demo:</p>
                    <div className={styles.demoAccounts}>
                        <button type="button" className={styles.demoBtn} onClick={() => fillDemo('student')}>
                            <i className="fas fa-graduation-cap"></i>
                            Sinh viên
                        </button>
                        <button type="button" className={styles.demoBtn} onClick={() => fillDemo('admin')}>
                            <i className="fas fa-user-shield"></i>
                            Admin
                        </button>
                    </div>
                </div>

                <div className={styles.footer}>
                    <p>© 2024 Trường Đại học Hàng hải Việt Nam</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;