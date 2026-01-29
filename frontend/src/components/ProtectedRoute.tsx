import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    requiredRole?: string;
}

/**
 * 인증 상태와 권한(Role)을 기반으로 라우트 접근을 보호하는 컴포넌트입니다.
 */
const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
    const { isAuthenticated, role } = useAuth();

    // 1. 로그인이 되어 있지 않은 경우
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 2. 로그인은 되어 있으나 특정 권한이 필요한 경우 (예: 관리자 페이지)
    if (requiredRole && role !== requiredRole) {
        // 권한이 없으면 메인(게시판) 화면으로 이동
        return <Navigate to="/" replace />;
    }

    // 인증 및 권한이 유효하면 하위 컴포넌트(Router Outlet) 렌더링
    return <Outlet />;
};

export default ProtectedRoute;
