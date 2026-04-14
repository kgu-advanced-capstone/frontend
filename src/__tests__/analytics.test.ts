import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted로 mock 객체를 hoisting보다 먼저 생성
const mockMixpanel = vi.hoisted(() => ({
  init: vi.fn(),
  track: vi.fn(),
}));

vi.mock("mixpanel-browser", () => ({
  default: mockMixpanel,
}));

// 모킹 이후에 import해야 mock이 적용됨
import { trackEvent, trackPageView, initAnalytics } from "@/lib/analytics";

describe("analytics 모듈", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // window.gtag 초기화
    const win = window as Window & { gtag?: unknown };
    delete win.gtag;
  });

  describe("trackEvent", () => {
    it("window.gtag가 있으면 GA4에 이벤트를 전송한다", () => {
      const mockGtag = vi.fn();
      (window as Window & { gtag: typeof mockGtag }).gtag = mockGtag;

      trackEvent("button_click", { label: "참가하기" });

      expect(mockGtag).toHaveBeenCalledWith("event", "button_click", {
        label: "참가하기",
      });
    });

    it("window.gtag가 없어도 에러가 발생하지 않는다", () => {
      expect(() =>
        trackEvent("button_click", { label: "참가하기" })
      ).not.toThrow();
    });

    it("Mixpanel에 이벤트와 속성을 전송한다", () => {
      trackEvent("project_join_click", { projectId: 1, title: "테스트 프로젝트" });

      expect(mockMixpanel.track).toHaveBeenCalledWith(
        "project_join_click",
        { projectId: 1, title: "테스트 프로젝트" }
      );
    });

    it("속성 없이 이벤트만 전송할 수 있다", () => {
      const mockGtag = vi.fn();
      (window as Window & { gtag: typeof mockGtag }).gtag = mockGtag;

      trackEvent("logout");

      expect(mockGtag).toHaveBeenCalledWith("event", "logout", undefined);
      expect(mockMixpanel.track).toHaveBeenCalledWith("logout", undefined);
    });
  });

  describe("trackPageView", () => {
    it("window.gtag가 있으면 GA4에 page_view를 전송한다", () => {
      const mockGtag = vi.fn();
      (window as Window & { gtag: typeof mockGtag }).gtag = mockGtag;

      trackPageView("/projects");

      expect(mockGtag).toHaveBeenCalledWith("event", "page_view", {
        page_path: "/projects",
      });
    });

    it("Mixpanel에 page_view를 전송한다", () => {
      trackPageView("/projects");

      expect(mockMixpanel.track).toHaveBeenCalledWith("page_view", {
        path: "/projects",
      });
    });
  });

  describe("initAnalytics", () => {
    it("NEXT_PUBLIC_MIXPANEL_TOKEN이 있으면 mixpanel.init을 호출한다", () => {
      vi.stubEnv("NEXT_PUBLIC_MIXPANEL_TOKEN", "test-token-123");

      initAnalytics();

      expect(mockMixpanel.init).toHaveBeenCalledWith(
        "test-token-123",
        expect.objectContaining({ track_pageview: false })
      );

      vi.unstubAllEnvs();
    });

    it("NEXT_PUBLIC_MIXPANEL_TOKEN이 없으면 mixpanel.init을 호출하지 않는다", () => {
      vi.stubEnv("NEXT_PUBLIC_MIXPANEL_TOKEN", "");

      initAnalytics();

      expect(mockMixpanel.init).not.toHaveBeenCalled();

      vi.unstubAllEnvs();
    });
  });
});
