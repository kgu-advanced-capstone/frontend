"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "../client";
import type {
  CreateProjectRequest,
  GetProjectsParams,
  MyProjectResponse,
  ProjectDetailResponse,
  ProjectListResponse,
  UpdateProjectStatusRequest,
} from "../types";

export const projectKeys = {
  all: ["projects"] as const,
  list: (params: GetProjectsParams) => ["projects", "list", params] as const,
  detail: (id: number) => ["projects", "detail", id] as const,
  my: ["projects", "my"] as const,
};

/** GET /projects — 프로젝트 목록 (페이지네이션, 카테고리, 검색) */
export function useProjects(params: GetProjectsParams = {}) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: async () => {
      const { data } = await client.get<ProjectListResponse>("/projects", {
        params,
      });
      return data;
    },
  });
}

/** GET /projects/:id — 프로젝트 상세 */
export function useProject(id: number) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const { data } = await client.get<ProjectDetailResponse>(
        `/projects/${id}`
      );
      return data;
    },
    enabled: id > 0,
  });
}

/** GET /projects/my — 내 프로젝트 목록 */
export function useMyProjects() {
  return useQuery({
    queryKey: projectKeys.my,
    queryFn: async () => {
      const { data } = await client.get<MyProjectResponse[]>("/projects/my");
      return data;
    },
  });
}

/** POST /projects — 프로젝트 생성 */
export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateProjectRequest) => {
      const { data } = await client.post<ProjectDetailResponse>(
        "/projects",
        body
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

/** POST /projects/:id/apply — 프로젝트 참가 신청 */
export function useApplyProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await client.post(`/projects/${id}/apply`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

/** PATCH /projects/:id/status — 프로젝트 상태 변경 */
export function useUpdateProjectStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: UpdateProjectStatusRequest & { id: number }) => {
      await client.patch(`/projects/${id}/status`, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
