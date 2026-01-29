import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

/**
 * 회원가입 페이지입니다.
 */
export default function SignupPage() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        nickname: ''
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        try {
            await api.post('/auth/signup', formData);
            alert('회원가입이 완료되었습니다. 로그인해주세요.');
            navigate('/login');
        } catch (err: any) {
            const data = err.response?.data;
            if (data?.errors) {
                setFieldErrors(data.errors);
            }
            setError(data?.message || '회원가입에 실패했습니다.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
                <h2 className="text-3xl font-bold mb-8 text-center text-white">회원가입</h2>

                {error && !Object.keys(fieldErrors).length && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">아이디</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className={`w-full bg-gray-900 border ${fieldErrors.username ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                            placeholder="아이디를 입력하세요 (4~20자)"
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
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className={`w-full bg-gray-900 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                            placeholder="비밀번호를 입력하세요 (최소 8자 이상)"
                            required
                        />
                        {fieldErrors.password && (
                            <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">닉네임</label>
                        <input
                            type="text"
                            value={formData.nickname}
                            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                            className={`w-full bg-gray-900 border ${fieldErrors.nickname ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                            placeholder="사용할 닉네임을 입력하세요"
                            required
                        />
                        {fieldErrors.nickname && (
                            <p className="mt-1 text-xs text-red-500">{fieldErrors.nickname}</p>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full mt-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors"
                >
                    가입하기
                </button>

                <p className="mt-6 text-center text-gray-400 text-sm">
                    이미 계정이 있으신가요? <Link to="/login" className="text-emerald-400 hover:underline">로그인</Link>
                </p>
            </form>
        </div>
    );
}
