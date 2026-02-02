import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * 전역 상단 네비게이션바 컴포넌트입니다.
 */
export const Navbar = () => {
    const { isAuthenticated, role, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50 shadow-lg">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        bootSample
                    </Link>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base font-medium">게시판</Link>
                        {isAuthenticated && (
                            <Link to="/ocr" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base font-medium">아이템 등록</Link>
                        )}
                        {isAuthenticated ? (
                            <>
                                {role === 'ROLE_ADMIN' && (
                                    <Link to="/admin" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base font-medium">사용자 관리</Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors border border-red-600/50 text-xs sm:text-sm font-medium"
                                >
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base font-medium">로그인</Link>
                                <Link to="/signup" className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-xs sm:text-sm font-medium">회원가입</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
