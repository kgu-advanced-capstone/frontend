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

export interface HrUserEducation {
  id: number;
  schoolName: string;
  major?: string;
  degree?: string;
  startDate: string;
  endDate?: string;
}

export interface HrUserCertification {
  id: number;
  name: string;
  issuingOrganization?: string;
  issuedDate: string;
}

export type HrUserProjectStatus = "RECRUITING" | "IN_PROGRESS" | "COMPLETED";

export interface HrUserProject {
  id: number;
  title: string;
  category: string;
  skills: string[];
  status: HrUserProjectStatus;
  createdAt: string;
}

export interface HrUserDetail {
  id: number;
  name: string;
  email: string;
  phone?: string;
  github?: string;
  blog?: string;
  profileImage?: string;
  educations: HrUserEducation[];
  certifications: HrUserCertification[];
  projects: HrUserProject[];
}
