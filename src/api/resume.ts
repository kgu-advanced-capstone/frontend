import { useMutation, useQuery } from "@tanstack/react-query";
import client from "@/api/client";
import type { CertificationResponse } from "@/api/certifications";
import type { EducationResponse } from "@/api/educations";
import type { ProfileResponse, SummarizedExperienceResponse } from "@/api/generated/model";

export interface CoverLetterDraft {
  title: string;
  content: string;
}

export interface ResumeResponse {
  basicInfo?: ProfileResponse;
  coverLetterTitle?: string;
  coverLetterContent?: string;
  summarizedExperiences?: SummarizedExperienceResponse[];
  educations?: EducationResponse[];
  certifications?: CertificationResponse[];
  generatedAt?: string;
}

export interface SaveResumeDraftRequest {
  coverLetterTitle: string;
  coverLetterContent: string;
}

export const resumeQueryKey = ["resume"] as const;

export async function getResume(): Promise<ResumeResponse> {
  const res = await client.get<ResumeResponse>("/api/resume");
  return res.data;
}

export async function saveResumeDraft(request: SaveResumeDraftRequest): Promise<ResumeResponse> {
  const res = await client.patch<ResumeResponse>("/api/resume", request);
  return res.data;
}

export async function generateResume(): Promise<void> {
  await client.post("/api/resume/generate");
}

export function useResume() {
  return useQuery({
    queryKey: resumeQueryKey,
    queryFn: getResume,
    retry: false,
  });
}

export function useSaveResumeDraft() {
  return useMutation({
    mutationFn: saveResumeDraft,
  });
}

export function useGenerateResume() {
  return useMutation({
    mutationFn: generateResume,
  });
}