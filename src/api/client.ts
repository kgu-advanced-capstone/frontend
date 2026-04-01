import axios from "axios";

const client = axios.create({
  baseURL: "", // OpenAPI 경로가 이미 /api를 포함하고 있음 (next.config.ts rewrites와 조화)
  headers: { 
    "Accept": "application/json"
  },
  withCredentials: true, // 쿠키 기반 인증을 위해 필수
});

// 401 에러 전역 처리
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("세션이 유효하지 않거나 만료되었습니다 (401).");
    }
    return Promise.reject(error);
  }
);

export default client;
