import mixpanel from "mixpanel-browser";

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

function trackGA(eventName: string, properties?: EventProperties): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, properties);
  }
}

function trackMixpanel(eventName: string, properties?: EventProperties): void {
  try {
    mixpanel.track(eventName, properties);
  } catch {
    // Mixpanel 미초기화 또는 사용 불가 상태
  }
}

/**
 * GA4 + Mixpanel을 초기화한다.
 * AnalyticsProvider의 useEffect에서 한 번 호출한다.
 */
export function initAnalytics(): void {
  if (typeof window === "undefined") return;

  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (token) {
    mixpanel.init(token, {
      debug: process.env.NODE_ENV === "development",
      track_pageview: false,
    });
  }
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
  try {
    mixpanel.track("page_view", { path });
  } catch {
    // Mixpanel 미초기화 또는 사용 불가 상태
  }
}
