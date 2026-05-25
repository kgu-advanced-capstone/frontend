export * from './generated/model';

import { MyProjectResponseStatus } from './generated/model';

export type ProjectStatus = MyProjectResponseStatus;
export const ProjectStatus = MyProjectResponseStatus;

export type UserRole = "USER" | "ADMIN";

export interface UserWithRole {
  id?: number;
  email?: string;
  name?: string;
  profileImage?: string;
  role?: UserRole;
}

export interface HrUserItem {
  id: number;
  name: string;
  email: string;
  profileImage?: string;
  certificationNames: string[];
  projectSkills: string[];
}

export interface HrUsersResponse {
  users: HrUserItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface HrUsersParams {
  certifications?: string;
  skills?: string;
  page?: number;
  size?: number;
}
