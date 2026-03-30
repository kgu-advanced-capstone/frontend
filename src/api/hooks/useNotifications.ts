"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "../client";
import type { NotificationResponse } from "../types";

export const notificationKeys = {
  all: ["notifications"] as const,
};

/** GET /notifications — 알림 목록 */
export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: async () => {
      const { data } = await client.get<NotificationResponse[]>(
        "/notifications"
      );
      return data;
    },
  });
}

/** PATCH /notifications/:id/read — 알림 읽음 처리 */
export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await client.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/** PATCH /notifications/read-all — 전체 알림 읽음 처리 */
export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await client.patch("/notifications/read-all");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
