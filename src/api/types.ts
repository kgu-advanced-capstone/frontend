// ─── Auth ───
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  profileImage: string | null;
}

// ─── Profile ───
export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  github?: string;
  blog?: string;
  profileImage?: string;
}

export interface ProfileResponse {
  name: string;
  email: string;
  phone: string | null;
  github: string | null;
  blog: string | null;
  profileImage: string | null;
}

// ─── Project ───
export type ProjectStatus = "recruiting" | "in-progress" | "completed";

export interface CreateProjectRequest {
  title: string;
  description?: string;
  category: string;
  skills?: string[];
  maxMembers?: number;
  deadline?: string; // date string "YYYY-MM-DD"
}

export interface UpdateProjectStatusRequest {
  status: ProjectStatus;
}

export interface ProjectSummaryResponse {
  id: number;
  title: string;
  category: string;
  skills: string[];
  currentMembers: number;
  maxMembers: number;
  author: string;
  createdAt: string;
}

export interface ProjectDetailResponse {
  id: number;
  title: string;
  description: string | null;
  category: string;
  skills: string[];
  currentMembers: number;
  maxMembers: number;
  deadline: string | null;
  author: string;
  createdAt: string;
}

export interface ProjectListResponse {
  projects: ProjectSummaryResponse[];
  totalCount: number;
}

export interface MyProjectResponse {
  project: ProjectDetailResponse;
  joinedAt: string;
  status: ProjectStatus;
  isOwner: boolean;
}

// ─── Experience ───
export interface ExperienceRequest {
  content: string;
}

export interface ExperienceResponse {
  id: number;
  content: string;
  aiSummary: string | null;
  createdAt: string;
}

export interface AiSummaryResponse {
  id: number;
  aiSummary: string;
}

// ─── Resume ───
export interface SummarizedExperienceResponse {
  projectId: number;
  projectTitle: string;
  keyPoints: string[];
}

export interface ResumeResponse {
  basicInfo: ProfileResponse;
  summarizedExperiences: SummarizedExperienceResponse[];
  generatedAt: string;
}

// ─── Notification ───
export interface NotificationResponse {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

// ─── Query params ───
export interface GetProjectsParams {
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
}
