import axios from "axios";

const client = axios.create({
  baseURL: "", // OpenAPI 경로가 이미 /api를 포함하고 있음 (next.config.ts rewrites와 조화)
  headers: { 
    "Accept": "application/json"
  },
  withCredentials: true, // 쿠키 기반 인증을 위해 필수
});

// FormData 전송 시 Content-Type 제거 인터셉터
// custom-instance에서 헤더를 설정해도 Axios 인스턴스 기본값과 병합 타이밍 문제로
// application/json 또는 application/octet-stream이 설정될 수 있다.
// 모든 헤더 병합이 끝난 시점(request interceptor)에서 삭제하는 것이 가장 확실하다.
client.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }
  return config;
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
