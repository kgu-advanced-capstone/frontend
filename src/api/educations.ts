import { useMutation, useQuery } from "@tanstack/react-query";
import client from "@/api/client";

export interface EducationRequest {
  schoolName: string;
  major?: string;
  degree?: string;
  startDate: string;
  endDate?: string | null;
}

export interface EducationResponse {
  id: number;
  schoolName: string;
  major?: string | null;
  degree?: string | null;
  startDate: string;
  endDate?: string | null;
}

export const educationsQueryKey = ["educations"] as const;

export async function getEducations(): Promise<EducationResponse[]> {
  const res = await client.get<EducationResponse[]>("/api/educations");
  return res.data;
}

export async function createEducation(payload: EducationRequest): Promise<EducationResponse> {
  const res = await client.post<EducationResponse>("/api/educations", payload);
  return res.data;
}

export async function updateEducation(id: number, payload: EducationRequest): Promise<EducationResponse> {
  const res = await client.put<EducationResponse>(`/api/educations/${id}`, payload);
  return res.data;
}

export async function deleteEducation(id: number): Promise<void> {
  await client.delete(`/api/educations/${id}`);
}

export function useEducations() {
  return useQuery({
    queryKey: educationsQueryKey,
    queryFn: getEducations,
  });
}

export function useCreateEducation() {
  return useMutation({
    mutationFn: createEducation,
  });
}

export function useUpdateEducation() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EducationRequest }) =>
      updateEducation(id, payload),
  });
}

export function useDeleteEducation() {
  return useMutation({
    mutationFn: deleteEducation,
  });
}
