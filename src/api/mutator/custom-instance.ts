import axios, { AxiosRequestConfig } from 'axios';
import client from '../client';

/**
 * Orval 커스텀 인스턴스
 * Orval v8+ 은 mutator 사용 시 fetch 스타일의 config를 전달하며,
 * 응답으로 { data, status, headers } 구조를 기대하는 경우가 많습니다 (특히 OpenAPI에 여러 응답 코드가 정의된 경우).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const customInstance = <T>(url: string, config: any): Promise<T> => {
  const source = axios.CancelToken.source();
  
  const { body, headers, ...rest } = config;

  // FormData 여부 확인
  const isFormData = body instanceof FormData;

  const axiosHeaders = { ...headers };
  let finalData = body;

  // FormData인 경우 Axios가 Content-Type을 바운더리와 함께 설정하도록 헤더에서 명시적으로 제거
  if (isFormData) {
    delete axiosHeaders['Content-Type'];
    delete axiosHeaders['content-type'];
    finalData = body;
  } else {
    finalData = body && typeof body === 'string' ? JSON.parse(body) : body;
  }

  const axiosConfig: AxiosRequestConfig = {
    ...rest,
    url,
    data: finalData,
    headers: axiosHeaders,
    cancelToken: source.token,
  };

  const promise = client(axiosConfig).then((res) => {
    return {
      data: res.data,
      status: res.status,
      headers: res.headers,
    } as T;
  });

  // @ts-expect-error promise.cancel은 React Query 취소를 위한 비표준 속성
  promise.cancel = () => {
    source.cancel('Query was cancelled by React Query');
  };

  return promise;
};
