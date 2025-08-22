import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import { useAuth } from '../hooks/useAuth';

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
    const { login } = useAuth(); // NEW


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

    // Thêm thông tin khoa vào người dùng mẫu
    const fillDemo = (type) => {
        if (type === 'student') {
            setFormData({
                username: 'student',
                password: '123',
                rememberMe: true,
                department: 'Công nghệ thông tin' // Thêm thông tin khoa
            });
        } else if (type === 'admin') {
            setFormData({
                username: 'admin',
                password: '123',
                rememberMe: true
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            setError('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            // Allow longer timeout for API calls
            const loginTimeout = setTimeout(() => {
                if (loading) {
                    setError('Kết nối tới máy chủ quá lâu. Đang thử phương thức đăng nhập khác...');
                }
            }, 3000);
            
            const data = await login(formData.username, formData.password);
            clearTimeout(loginTimeout);
            
            if (formData.rememberMe) localStorage.setItem('rememberLogin', 'true');
            
            setSuccess('Đăng nhập thành công! Đang chuyển hướng...');
            
            // Save the user type to localStorage in case useAuth hasn't updated yet
            if (data?.user?.type) {
                const userType = data.user.type;
                
                setTimeout(() => {
                    if (userType === 'admin') {
                        navigate('/admin/login');
                    } else {
                        navigate('/student/subjects');
                    }
                }, 600);
            } else {
                // Fallback navigation if user type not available
                navigate('/student/subjects');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Tài khoản hoặc mật khẩu không đúng!');
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
                        <button 
                            type="button"
                            className={styles.forgotPassword}
                            onClick={() => alert('Chức năng quên mật khẩu đang phát triển.')}
                        >
                            Quên mật khẩu?
                        </button>
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