import axios, { AxiosRequestConfig } from 'axios';
import client from '../client';

/**
 * Orval 커스텀 인스턴스
 * Orval v8+ 은 mutator 사용 시 fetch 스타일의 config를 전달하며,
 * 응답으로 { data, status, headers } 구조를 기대하는 경우가 많습니다 (특히 OpenAPI에 여러 응답 코드가 정의된 경우).
 */
export const customInstance = <T>(url: string, config: any): Promise<T> => {
  const source = axios.CancelToken.source();
  
  const { body, ...rest } = config;
  const axiosConfig: AxiosRequestConfig = {
    ...rest,
    url,
    data: body ? (typeof body === 'string' ? JSON.parse(body) : body) : undefined,
    cancelToken: source.token,
  };

  const promise = client(axiosConfig).then((res) => {
    return {
      data: res.data,
      status: res.status,
      headers: res.headers,
    } as T;
  });

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled by React Query');
  };

  return promise;
};
