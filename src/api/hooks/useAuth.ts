"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "../client";
import type { RegisterRequest, UserResponse } from "../types";

export const authKeys = {
  me: ["auth", "me"] as const,
};

/** GET /auth/me — 현재 로그인 유저 조회 */
export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const { data } = await client.get<UserResponse>("/auth/me");
      return data;
    },
    retry: false,
  });
}

/** POST /auth/login — 로그인 (세션 쿠키 기반) */
export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      const { data } = await client.post<UserResponse>("/auth/login", body);
      return data;
    },
    onSuccess: (data) => {
      // 1. 캐시 즉시 업데이트
      qc.setQueryData(authKeys.me, data);
      // 2. 관련 쿼리 무효화 및 강제 Refetch
      qc.invalidateQueries({ queryKey: authKeys.me });
      qc.refetchQueries({ queryKey: authKeys.me });
    },
  });
}

/** POST /auth/register */
export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: RegisterRequest) => {
      const { data } = await client.post<UserResponse>("/auth/register", body);
      return data;
    },
    onSuccess: (data) => {
      // 1. 캐시 즉시 업데이트
      qc.setQueryData(authKeys.me, data);
      // 2. 관련 쿼리 무효화 및 강제 Refetch
      qc.invalidateQueries({ queryKey: authKeys.me });
      qc.refetchQueries({ queryKey: authKeys.me });
    },
  });
}

/** 로그아웃 — 세션 쿠키 제거 */
export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await client.post("/auth/logout");
    },
    onSuccess: () => {
      qc.setQueryData(authKeys.me, null);
      qc.invalidateQueries();
    },
  });
}
