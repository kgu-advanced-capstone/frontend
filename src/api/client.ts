import axios from "axios";

const client = axios.create({
  baseURL: "", // OpenAPI 경로가 이미 /api를 포함하고 있음 (next.config.ts rewrites와 조화)
  headers: {
    "Accept": "application/json"
  },
});

// JWT 토큰 주입 + FormData Content-Type 제거 인터셉터
client.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// 401 에러 전역 처리
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("토큰이 유효하지 않거나 만료되었습니다 (401).");
    }
    return Promise.reject(error);
  }
);

export default client;
