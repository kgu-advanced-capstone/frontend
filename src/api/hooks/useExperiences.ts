"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "../client";
import type {
  AiSummaryResponse,
  ExperienceRequest,
  ExperienceResponse,
} from "../types";

export const experienceKeys = {
  byProject: (projectId: number) =>
    ["experiences", "project", projectId] as const,
};

/** GET /experiences/project/:projectId — 프로젝트별 경험 목록 */
export function useExperiences(projectId: number) {
  return useQuery({
    queryKey: experienceKeys.byProject(projectId),
    queryFn: async () => {
      const { data } = await client.get<ExperienceResponse[]>(
        `/experiences/project/${projectId}`
      );
      return data;
    },
    enabled: projectId > 0,
  });
}

/** POST /experiences/project/:projectId — 경험 생성/수정 */
export function useUpsertExperience(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ExperienceRequest) => {
      const { data } = await client.post<ExperienceResponse>(
        `/experiences/project/${projectId}`,
        body
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: experienceKeys.byProject(projectId),
      });
    },
  });
}

/** POST /experiences/:id/summarize — AI 요약 생성 */
export function useSummarizeExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await client.post<AiSummaryResponse>(
        `/experiences/${id}/summarize`
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["experiences"] });
    },
  });
}
