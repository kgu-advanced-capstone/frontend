import { useMutation, useQuery } from "@tanstack/react-query";
import client from "@/api/client";

export interface CertificationRequest {
  name: string;
  issuingOrganization?: string;
  issuedDate: string;
}

export interface CertificationResponse {
  id: number;
  name: string;
  issuingOrganization?: string | null;
  issuedDate: string;
}

export const certificationsQueryKey = ["certifications"] as const;

export async function getCertifications(): Promise<CertificationResponse[]> {
  const res = await client.get<CertificationResponse[]>("/api/certifications");
  return res.data;
}

export async function createCertification(payload: CertificationRequest): Promise<CertificationResponse> {
  const res = await client.post<CertificationResponse>("/api/certifications", payload);
  return res.data;
}

export async function updateCertification(id: number, payload: CertificationRequest): Promise<CertificationResponse> {
  const res = await client.put<CertificationResponse>(`/api/certifications/${id}`, payload);
  return res.data;
}

export async function deleteCertification(id: number): Promise<void> {
  await client.delete(`/api/certifications/${id}`);
}

export function useCertifications() {
  return useQuery({
    queryKey: certificationsQueryKey,
    queryFn: getCertifications,
  });
}

export function useCreateCertification() {
  return useMutation({
    mutationFn: createCertification,
  });
}

export function useUpdateCertification() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CertificationRequest }) =>
      updateCertification(id, payload),
  });
}

export function useDeleteCertification() {
  return useMutation({
    mutationFn: deleteCertification,
  });
}
