import axios from 'axios';

/**
 * 전역 Axios 인스턴스 설정
 * JWT 토큰을 localStorage에서 읽어와 모든 요청 Header에 자동으로 포함합니다.
 */
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터: 토큰 자동 주입
api.interceptors.request.use(
    (config: any) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: any) => Promise.reject(error)
);

// 응답 인터셉터: 401(인증 만료) 처리 등
api.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
