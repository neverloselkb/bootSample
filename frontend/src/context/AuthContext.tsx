import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    username: string | null;
    role: string | null;
    login: (token: string, remember: boolean) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 전역 인증 상태를 관리하는 Provider 컴포넌트입니다.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
        !!(sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken'))
    );
    const [username, setUsername] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    // 1. 디코딩을 담당하는 유틸리티 함수
    const parseJwt = (token: string) => {
        try {
            // [Header].[Payload].[Signature] 중 Payload(index 1)를 가져옵니다.
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

            // Base64를 디코딩하여 JSON 문자열로 만든 뒤 Object로 파싱합니다.
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
        const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
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


    // 2. 실제 사용처 (login 함수 내부)
    const login = (token: string, remember: boolean) => {
        if (remember) {
            localStorage.setItem('accessToken', token);
        } else {
            sessionStorage.setItem('accessToken', token);
        }

        const decoded = parseJwt(token);    // <--- 여기서 호출하여 사용자 정보를 꺼냄
        if (decoded) {
            setIsAuthenticated(true);
            setUsername(decoded.sub || null);   // ID 추출
            setRole(decoded.role || null);      // 권한 추출
        }
    };

    const logout = () => {
        sessionStorage.removeItem('accessToken');
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
