import axios, { AxiosRequestConfig } from 'axios';
import client from '../client';

/**
 * Orval 커스텀 인스턴스
 *
 * [FormData 전송 시 Content-Type 처리]
 * Axios는 PATCH/POST/PUT 요청에 인스턴스 기본값으로 Content-Type: application/json을 설정한다.
 * FormData 전송 시 이 기본값이 살아있으면 Axios의 transformRequest가 FormData를 JSON으로
 * 직렬화하거나 application/octet-stream으로 전송하는 버그가 생긴다.
 *
 * 헤더 값을 null로 설정하면 Axios가 요청·인스턴스·전역 세 단계의 기본값을 모두 무시하고
 * 헤더를 완전히 제거한다. 이후 브라우저 XHR이 FormData를 감지해
 * multipart/form-data; boundary=... 를 자동으로 설정한다.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const customInstance = <T>(url: string, config: any): Promise<T> => {
  const source = axios.CancelToken.source();

  const { body, headers, ...rest } = config;

  const isFormData = body instanceof FormData;

  const axiosHeaders = { ...headers };
  let finalData = body;

  if (isFormData) {
    // null로 설정해야 Axios 인스턴스 기본값(application/json)까지 완전히 제거된다.
    // delete로는 request 레벨 헤더만 제거되고 인스턴스 기본값이 남는다.
    axiosHeaders['Content-Type'] = null;
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
