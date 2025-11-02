import { Alert } from 'react-native';

// 🔑 실제 백엔드 서버의 주소로 변경해주세요.
const BASE_URL = 'http://192.168.0.1:8000/api'; // 👈 예시: 실제 백엔드 서버 IP와 포트로 변경

/**
 * 중앙 API 요청 함수
 * @param {string} endpoint - API 엔드포인트 (예: '/login')
 * @param {object} options - fetch 함수의 옵션 (method, headers, body 등)
 * @param {string|null} token - 인증 토큰
 * @returns {Promise<any>} - API 응답 데이터
 */
export const request = async (endpoint, options = {}, token = null) => {
    const url = `${BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            // 서버에서 에러 응답이 온 경우
            const errorData = await response.json().catch(() => ({ message: '서버 응답을 처리할 수 없습니다.' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // 204 No Content 같이 내용이 없는 성공 응답 처리
        if (response.status === 204) {
            return null;
        }

        return await response.json();

    } catch (error) {
        console.error(`API 요청 실패: ${url}`, error);
        // 네트워크 오류 등 fetch 자체가 실패한 경우
        Alert.alert('네트워크 오류', '서버와 통신할 수 없습니다. 인터넷 연결을 확인해주세요.');
        throw error; // 에러를 다시 던져서 호출한 쪽에서 후속 처리를 할 수 있게 함
    }
};
