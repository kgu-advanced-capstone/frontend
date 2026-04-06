import axios, { AxiosRequestConfig } from 'axios';
import client from '../client';

/**
 * Orval 커스텀 인스턴스
 * FormData Content-Type 처리는 client.ts의 request interceptor에서 담당한다.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const customInstance = <T>(url: string, config: any): Promise<T> => {
  const source = axios.CancelToken.source();

  const { body, headers, ...rest } = config;

  const axiosHeaders = { ...headers };
  let finalData: unknown;

  if (body instanceof FormData) {
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
