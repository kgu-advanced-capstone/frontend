"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import client from "../client";
import type { ResumeResponse } from "../types";

export const resumeKeys = {
  me: ["resume"] as const,
};

/** GET /resume — 이력서 조회 */
export function useResume() {
  return useQuery({
    queryKey: resumeKeys.me,
    queryFn: async () => {
      const { data } = await client.get<ResumeResponse>("/resume");
      return data;
    },
  });
}

/** POST /resume/generate — 이력서 AI 생성 */
export function useGenerateResume() {
  return useMutation({
    mutationFn: async () => {
      await client.post("/resume/generate");
    },
  });
}
