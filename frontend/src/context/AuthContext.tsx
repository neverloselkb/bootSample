import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    username: string | null;
    role: string | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 전역 인증 상태를 관리하는 Provider 컴포넌트입니다.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('accessToken'));
    const [username, setUsername] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    const parseJwt = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    // 초기 로드 시 토큰 존재 확인 및 정보 추출
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            const decoded = parseJwt(token);
            if (decoded) {
                setIsAuthenticated(true);
                setUsername(decoded.sub || null);
                setRole(decoded.role || null);
            } else {
                logout();
            }
        }
    }, []);

    const login = (token: string) => {
        localStorage.setItem('accessToken', token);
        const decoded = parseJwt(token);
        if (decoded) {
            setIsAuthenticated(true);
            setUsername(decoded.sub || null);
            setRole(decoded.role || null);
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setIsAuthenticated(false);
        setUsername(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, username, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
