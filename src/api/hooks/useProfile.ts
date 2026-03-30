"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "../client";
import type { ProfileResponse, UpdateProfileRequest } from "../types";

export const profileKeys = {
  me: ["profile"] as const,
};

/** GET /profile — 내 프로필 조회 */
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: async () => {
      const { data } = await client.get<ProfileResponse>("/profile");
      return data;
    },
  });
}

/** PATCH /profile — 프로필 수정 */
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateProfileRequest) => {
      const { data } = await client.patch<ProfileResponse>("/profile", body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
}
