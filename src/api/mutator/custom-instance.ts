import axios, { AxiosRequestConfig } from 'axios';
import client from '../client';

/**
 * FormData의 string 엔트리 중 JSON 객체/배열인 경우 application/json Blob으로 변환한다.
 * Spring Boot @RequestPart는 JSON 파트에 Content-Type: application/json을 요구하는데,
 * Orval 생성 코드가 JSON.stringify() 결과를 plain string으로 append하여 text/plain이 됨.
 */
export function normalizeFormData(raw: FormData): FormData {
  const out = new FormData();
  for (const [key, value] of raw.entries()) {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (parsed !== null && typeof parsed === 'object') {
          // JSON 객체/배열 → application/json Blob으로 변환
          out.append(key, new Blob([value], { type: 'application/json' }));
        } else {
          out.append(key, value);
        }
      } catch {
        out.append(key, value);
      }
    } else if (value instanceof File) {
      out.append(key, value, value.name);
    } else {
      out.append(key, value);
    }
  }
  return out;
}

/**
 * Orval 커스텀 인스턴스
 *
 * FormData 전송 시에는 fetch를 사용한다.
 * Axios는 브라우저 환경에서 FormData의 Content-Type 처리에 일관성이 없어
 * application/octet-stream 등이 잘못 설정될 수 있다.
 * fetch는 FormData에 대해 항상 올바른 multipart/form-data; boundary=... 를 자동 설정한다.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const customInstance = <T>(url: string, config: any): Promise<T> => {
  const { body, headers, ...rest } = config;

  // FormData 전송: fetch 사용 (Content-Type 자동 설정 보장)
  if (body instanceof FormData) {
    const controller = new AbortController();
    const formData = normalizeFormData(body);
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const promise = fetch(url, {
      method: (rest.method as string) || 'GET',
      body: formData,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Content-Type 미설정 → fetch가 multipart/form-data; boundary=... 자동 설정
        ...Object.fromEntries(
          Object.entries(headers || {}).filter(
            ([k]) => k.toLowerCase() !== 'content-type'
          )
        ),
      },
      signal: controller.signal,
    }).then(async (res) => {
      let data: unknown;
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }
      return { data, status: res.status, headers: res.headers } as T;
    });

    // @ts-expect-error promise.cancel은 React Query 취소를 위한 비표준 속성
    promise.cancel = () => controller.abort();
    return promise;
  }

  // JSON 등 일반 요청: Axios 사용
  const source = axios.CancelToken.source();

  const finalData = body && typeof body === 'string' ? JSON.parse(body) : body;

  // body 없는 POST/PUT/PATCH는 Axios가 Content-Type을 생략하므로 빈 객체로 강제
  const isBodylessStateChange =
    ['POST', 'PUT', 'PATCH'].includes((rest.method as string)?.toUpperCase()) &&
    finalData === undefined;

  const axiosConfig: AxiosRequestConfig = {
    ...rest,
    url,
    data: isBodylessStateChange ? {} : finalData,
    headers: { ...headers },
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
