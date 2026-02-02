import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

/**
 * 로그인 페이지입니다.
 */
export default function LoginPage() {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [autoLogin, setAutoLogin] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const { login } = useAuth();
    const navigate = useNavigate();

    // 초기 로드 시 저장된 아이디가 있는지 확인
    useEffect(() => {
        const savedUsername = localStorage.getItem('savedUsername');
        if (savedUsername) {
            setUsername(savedUsername);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        try {
            const response = await api.post('/auth/login', { username, password });

            // ID 기억하기 처리
            if (rememberMe) {
                localStorage.setItem('savedUsername', username);
            } else {
                localStorage.removeItem('savedUsername');
            }

            login(response.data.accessToken, autoLogin);
            navigate('/');
        } catch (err: any) {
            const data = err.response?.data;
            if (data?.errors) {
                setFieldErrors(data.errors);
            }
            setError(data?.message || '로그인에 실패했습니다.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
                <h2 className="text-3xl font-bold mb-8 text-center text-white">로그인</h2>

                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">아이디</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={`w-full bg-gray-900 border ${fieldErrors.username ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                            placeholder="아이디를 입력하세요"
                            required
                        />
                        {fieldErrors.username && (
                            <p className="mt-1 text-xs text-red-500">{fieldErrors.username}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full bg-gray-900 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                        {fieldErrors.password && (
                            <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center">
                        <input
                            id="rememberMe"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-700 rounded focus:ring-blue-500 focus:ring-2 transition-all cursor-pointer"
                        />
                        <label htmlFor="rememberMe" className="ml-2 text-sm font-medium text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
                            ID 기억하기
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="autoLogin"
                            type="checkbox"
                            checked={autoLogin}
                            onChange={(e) => setAutoLogin(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-700 rounded focus:ring-blue-500 focus:ring-2 transition-all cursor-pointer"
                        />
                        <label htmlFor="autoLogin" className="ml-2 text-sm font-medium text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
                            자동 로그인
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors"
                >
                    로그인
                </button>

                <p className="mt-6 text-center text-gray-400 text-sm">
                    계정이 없으신가요? <Link to="/signup" className="text-blue-400 hover:underline">회원가입</Link>
                </p>
            </form>
        </div>
    );
}
