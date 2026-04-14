import { useCallback } from "react";
import { trackEvent, type EventProperties } from "@/lib/analytics";

/**
 * 이벤트 트래킹 훅.
 * GA4 + Mixpanel에 동시에 이벤트를 전송한다.
 *
 * @example
 * const { track } = useTrack();
 * track("button_click", { label: "참가하기" });
 */
export function useTrack() {
  const track = useCallback(
    (eventName: string, properties?: EventProperties) => {
      trackEvent(eventName, properties);
    },
    []
  );

  return { track };
}
