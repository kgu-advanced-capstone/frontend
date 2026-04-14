/**
 * GA4 + Mixpanel 통합 Event Tracker
 *
 * mixpanel-browser는 SSR에서 window.location에 접근하므로
 * 최상위 import 대신 클라이언트 사이드에서만 동적 import한다.
 */

export type EventProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

// window.gtag 타입 선언
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

// mixpanel 인스턴스 캐시 (클라이언트에서만 설정됨)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _mp: any = null;

function trackGA(eventName: string, properties?: EventProperties): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, properties);
  }
}

function trackMixpanel(eventName: string, properties?: EventProperties): void {
  if (!_mp) return;
  try {
    _mp.track(eventName, properties);
  } catch {
    // Mixpanel 사용 불가 상태
  }
}

/**
 * GA4 + Mixpanel을 초기화한다.
 * AnalyticsProvider의 useEffect에서 한 번 호출한다 (클라이언트 전용).
 */
export async function initAnalytics(): Promise<void> {
  if (typeof window === "undefined") return;

  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) return;

  // SSR 에러를 피하기 위해 클라이언트에서만 동적 import
  const { default: mixpanel } = await import("mixpanel-browser");
  _mp = mixpanel;
  mixpanel.init(token, {
    debug: process.env.NODE_ENV === "development",
    track_pageview: false,
  });
}

/**
 * GA4 + Mixpanel에 커스텀 이벤트를 전송한다.
 */
export function trackEvent(
  eventName: string,
  properties?: EventProperties
): void {
  trackGA(eventName, properties);
  trackMixpanel(eventName, properties);
}

/**
 * 페이지뷰 이벤트를 전송한다.
 */
export function trackPageView(path: string): void {
  trackGA("page_view", { page_path: path });
  trackMixpanel("page_view", { path });
}

/**
 * 테스트에서 모듈 상태를 초기화한다.
 * @internal
 */
export function _resetAnalyticsForTesting(): void {
  _mp = null;
}
