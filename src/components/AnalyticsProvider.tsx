"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { initAnalytics, trackPageView } from "@/lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * GA4 스크립트 주입 + Mixpanel 초기화 + 페이지뷰 자동 트래킹.
 * RootLayout에서 최상위에 한 번 렌더링한다.
 */
export default function AnalyticsProvider() {
  const pathname = usePathname();
  const [isAnalyticsReady, setIsAnalyticsReady] = useState(false);

  // 앱 최초 마운트 시 Mixpanel 초기화 (클라이언트 전용, 비동기)
  useEffect(() => {
    initAnalytics()
      .then(() => setIsAnalyticsReady(true))
      .catch(() => setIsAnalyticsReady(true));
  }, []);

  // 초기화 완료 후, 경로 변경 시마다 페이지뷰 전송
  useEffect(() => {
    if (!isAnalyticsReady) return;
    trackPageView(pathname);
  }, [pathname, isAnalyticsReady]);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
