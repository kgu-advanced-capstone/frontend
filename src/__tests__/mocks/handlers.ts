import { http, HttpResponse } from "msw";
import type {
  AiSummaryStatusResponse,
  CreateProjectRequest,
  ExperienceRequest,
  ExperienceResponse,
  MyProjectResponse,
  NotificationResponse,
  ProjectDetailResponse,
  ProjectListResponse,
  RegisterRequest,
  ResumeResponse,
  UpdateProfileRequest,
  UpdateProjectStatusRequest,
  UserWithRole,
  HrUserItem,
  HrUserDetail,
} from "@/api/types";

const BASE = "/api";

// ─── In-memory DB ───
let users: UserWithRole[] = [];
let currentUser: UserWithRole | null = null;
let nextUserId = 1;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let profile: any = {
  name: "",
  email: "",
  phone: null,
  github: null,
  blog: null,
  profileImage: null,
};

let projects: ProjectDetailResponse[] = [];
let nextProjectId = 1;

let myProjects: MyProjectResponse[] = [];

let experiences: (ExperienceResponse & { projectId: number; summaryStatus?: string })[] = [];
let nextExpId = 1;

let notifications: NotificationResponse[] = [];
let nextNotifId = 1;

type EducationRecord = {
  id: number;
  schoolName: string;
  major?: string | null;
  degree?: string | null;
  startDate: string;
  endDate?: string | null;
};

type CertificationRecord = {
  id: number;
  name: string;
  issuingOrganization?: string | null;
  issuedDate: string;
};

let educations: EducationRecord[] = [];
let nextEducationId = 1;

let certifications: CertificationRecord[] = [];
let nextCertificationId = 1;

const hrDummyUsers: HrUserItem[] = [
  { id: 1, name: "김철수", email: "kim@example.com", certificationNames: ["정보처리기사", "SQLD"], projectSkills: ["Java", "Spring", "MySQL"] },
  { id: 2, name: "이영희", email: "lee@example.com", certificationNames: ["AWS Solutions Architect"], projectSkills: ["Python", "Django", "PostgreSQL"] },
  { id: 3, name: "박민준", email: "park@example.com", certificationNames: ["정보처리기사"], projectSkills: ["React", "TypeScript", "Node.js"] },
  { id: 4, name: "최수연", email: "choi@example.com", certificationNames: ["SQLD", "정보보안기사"], projectSkills: ["Java", "Kotlin", "Spring"] },
  { id: 5, name: "정도윤", email: "jung@example.com", certificationNames: [], projectSkills: ["Flutter", "Dart", "Firebase"] },
  { id: 6, name: "강지훈", email: "kang@example.com", certificationNames: ["AWS Solutions Architect", "정보처리기사"], projectSkills: ["Go", "Docker", "Kubernetes"] },
  { id: 7, name: "윤서아", email: "yoon@example.com", certificationNames: ["SQLD"], projectSkills: ["Python", "FastAPI", "React"] },
  { id: 8, name: "임현우", email: "lim@example.com", certificationNames: ["정보처리기사"], projectSkills: ["Spring", "JPA", "MySQL"] },
];

// ─── Helper ───
function addNotification(message: string) {
  notifications.unshift({
    id: nextNotifId++,
    message,
    time: new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    read: false,
  });
}

export function resetDb() {
  users = [];
  currentUser = null;
  nextUserId = 1;
  profile = {
    name: "",
    email: "",
    phone: null,
    github: null,
    blog: null,
    profileImage: null,
  };
  projects = [];
  nextProjectId = 1;
  myProjects = [];
  experiences = [];
  nextExpId = 1;
  notifications = [];
  nextNotifId = 1;
  educations = [];
  nextEducationId = 1;
  certifications = [];
  nextCertificationId = 1;
}

export const handlers = [
  // ─── Auth ───

  // POST /auth/register
  http.post(`${BASE}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as RegisterRequest;
    const user: UserWithRole = {
      id: nextUserId++,
      email: body.email,
      name: body.name,
      profileImage: undefined,
      role: "USER",
    };
    users.push(user);
    currentUser = user;
    profile = {
      name: user.name,
      email: user.email,
      phone: null,
      github: null,
      blog: null,
      profileImage: null,
    };
    return HttpResponse.json(user, { status: 201 });
  }),

  // POST /auth/login
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    // Check in-memory DB (users)
    const user = users.find((u) => u.email === body.email);

    // 테스트 계정 (미리 등록되지 않은 경우 자동 생성)
    const testAccounts: Record<string, { name: string; role: "USER" | "ADMIN" }> = {
      "test@buildi.com": { name: "홍길동", role: "USER" },
      "user@buildi.com": { name: "김빌디", role: "USER" },
      "admin@buildi.com": { name: "관리자", role: "ADMIN" },
    };

    if (!user && testAccounts[body.email]) {
      const { name, role } = testAccounts[body.email];
      const newUser: UserWithRole = { id: nextUserId++, email: body.email, name, profileImage: undefined, role };
      users.push(newUser);
      currentUser = newUser;
      profile = { ...profile, name, email: body.email };
      return HttpResponse.json({ accessToken: "mock-token", role });
    }

    if (!user || body.password === "fail") {
      return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    currentUser = user;
    profile = { phone: null, github: null, blog: null, profileImage: null, name: user.name, email: user.email };
    return HttpResponse.json({ accessToken: "mock-token", role: user.role ?? "USER" });
  }),

  // POST /auth/logout
  http.post(`${BASE}/auth/logout`, () => {
    currentUser = null;
    return HttpResponse.json(null, { status: 200 });
  }),

  // GET /auth/me
  http.get(`${BASE}/auth/me`, () => {
    if (!currentUser) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return HttpResponse.json(currentUser);
  }),

  // ─── Profile ───

  // GET /profile
  http.get(`${BASE}/profile`, () => {
    return HttpResponse.json(profile);
  }),

  // PATCH /profile (Multipart/form-data)
  http.patch(`${BASE}/profile`, async ({ request }) => {
    try {
      const formData = await request.formData();
      const requestPart = formData.get("request");
      const requestJson =
        typeof requestPart === "string"
          ? requestPart
          : await new Response(requestPart as Blob).text();
      const body = JSON.parse(requestJson) as UpdateProfileRequest;
      const profileImage = formData.get("profileImage") as File | null;

      profile = { ...profile, ...body };

      if (profileImage) {
        profile.profileImage = `https://cdn.example.com/profile/${profileImage.name}`;
      }

      // /me에서도 최신 profileImage가 반영되도록 currentUser 동기화
      if (currentUser) {
        currentUser = { ...currentUser, name: profile.name, profileImage: profile.profileImage };
        const idx = users.findIndex((u) => u.id === currentUser!.id);
        if (idx !== -1) users[idx] = currentUser;
      }

      return HttpResponse.json(profile);
    } catch (e) {
      console.error("[MSW PATCH /profile error]", e);
      return HttpResponse.json({ message: "Bad Request" }, { status: 400 });
    }
  }),

  // ─── Educations ───

  // GET /educations
  http.get(`${BASE}/educations`, () => {
    return HttpResponse.json(educations);
  }),

  // POST /educations
  http.post(`${BASE}/educations`, async ({ request }) => {
    const body = (await request.json()) as Omit<EducationRecord, "id">;
    const education: EducationRecord = {
      id: nextEducationId++,
      schoolName: body.schoolName,
      major: body.major ?? null,
      degree: body.degree ?? null,
      startDate: body.startDate,
      endDate: body.endDate ?? null,
    };
    educations.unshift(education);
    return HttpResponse.json(education, { status: 201 });
  }),

  // PUT /educations/:id
  http.put(`${BASE}/educations/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const idx = educations.findIndex((e) => e.id === id);
    if (idx === -1) {
      return HttpResponse.json({ message: "Not Found" }, { status: 404 });
    }

    const body = (await request.json()) as Omit<EducationRecord, "id">;
    educations[idx] = {
      ...educations[idx],
      schoolName: body.schoolName,
      major: body.major ?? null,
      degree: body.degree ?? null,
      startDate: body.startDate,
      endDate: body.endDate ?? null,
    };
    return HttpResponse.json(educations[idx]);
  }),

  // DELETE /educations/:id
  http.delete(`${BASE}/educations/:id`, ({ params }) => {
    const id = Number(params.id);
    educations = educations.filter((e) => e.id !== id);
    return HttpResponse.json(null, { status: 204 });
  }),

  // ─── Certifications ───

  // GET /certifications
  http.get(`${BASE}/certifications`, () => {
    return HttpResponse.json(certifications);
  }),

  // POST /certifications
  http.post(`${BASE}/certifications`, async ({ request }) => {
    const body = (await request.json()) as Omit<CertificationRecord, "id">;
    const certification: CertificationRecord = {
      id: nextCertificationId++,
      name: body.name,
      issuingOrganization: body.issuingOrganization ?? null,
      issuedDate: body.issuedDate,
    };
    certifications.unshift(certification);
    return HttpResponse.json(certification, { status: 201 });
  }),

  // PUT /certifications/:id
  http.put(`${BASE}/certifications/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const idx = certifications.findIndex((c) => c.id === id);
    if (idx === -1) {
      return HttpResponse.json({ message: "Not Found" }, { status: 404 });
    }

    const body = (await request.json()) as Omit<CertificationRecord, "id">;
    certifications[idx] = {
      ...certifications[idx],
      name: body.name,
      issuingOrganization: body.issuingOrganization ?? null,
      issuedDate: body.issuedDate,
    };
    return HttpResponse.json(certifications[idx]);
  }),

  // DELETE /certifications/:id
  http.delete(`${BASE}/certifications/:id`, ({ params }) => {
    const id = Number(params.id);
    certifications = certifications.filter((c) => c.id !== id);
    return HttpResponse.json(null, { status: 204 });
  }),

  // ─── Projects ───

  // GET /projects
  http.get(`${BASE}/projects`, ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    let filtered = [...projects];
    if (category) filtered = filtered.filter((p) => p.category === category);
    if (search)
      filtered = filtered.filter(
        (p) =>
          (p.title && p.title.includes(search)) ||
          (p.description && p.description.includes(search))
      );

    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    const res: ProjectListResponse = {
      projects: paged.map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        skills: p.skills,
        currentMembers: p.participants?.length || 0,
        maxMembers: p.maxMembers,
        author: p.author,
        createdAt: p.createdAt,
      })),
      totalCount: filtered.length,
    };
    return HttpResponse.json(res);
  }),

  // GET /projects/my (must be before /projects/:id to avoid route collision)
  http.get(`${BASE}/projects/my`, () => {
    return HttpResponse.json(myProjects);
  }),

  // POST /projects
  http.post(`${BASE}/projects`, async ({ request }) => {
    const body = (await request.json()) as CreateProjectRequest;
    const project: ProjectDetailResponse = {
      id: nextProjectId++,
      title: body.title,
      description: body.description ?? undefined,
      category: body.category,
      skills: [],  // 초기값 빈 배열
      skillExtractionStatus: 'IN_PROGRESS',  // 새 필드
      participants: [{
        userId: currentUser?.id,
        name: currentUser?.name,
        joinedAt: "2026-03-30",
      }],
      maxMembers: body.maxMembers || 4,
      deadline: body.deadline ?? undefined,
      author: currentUser?.name || "Unknown",
      createdAt: "2026-03-30",
    };
    projects.push(project);
    myProjects.push({
      project,
      joinedAt: "2026-03-30",
      status: "recruiting",
      isOwner: true,
    });
    addNotification(`"${project.title}" 프로젝트를 생성했습니다.`);
    
    // 2초 후 상태 변경 (폴링 시뮬레이션)
    setTimeout(() => {
      project.skillExtractionStatus = 'COMPLETED';
      project.skills = ['React', 'Node.js'];  // 시뮬레이션 기술
    }, 2000);
    
    return HttpResponse.json(project, { status: 201 });
  }),

  // GET /projects/:id
  http.get(`${BASE}/projects/:id`, ({ params }) => {
    const id = Number(params.id);
    const project = projects.find((p) => p.id === id);
    if (!project) {
      return HttpResponse.json({ message: "Not Found" }, { status: 404 });
    }
    return HttpResponse.json(project);
  }),

  // POST /projects/:id/apply
  http.post(`${BASE}/projects/:id/apply`, ({ params }) => {
    const id = Number(params.id);
    const project = projects.find((p) => p.id === id);
    if (!project) {
      return HttpResponse.json({ message: "Not Found" }, { status: 404 });
    }
    if (project.participants) {
      project.participants.push({
        userId: currentUser?.id,
        name: currentUser?.name,
        joinedAt: "2026-03-30",
      });
    } else {
      project.participants = [{
        userId: currentUser?.id,
        name: currentUser?.name,
        joinedAt: "2026-03-30",
      }];
    }
    myProjects.push({
      project,
      joinedAt: "2026-03-30",
      status: "recruiting",
      isOwner: false,
    });
    addNotification(`"${project.title}" 프로젝트에 참가했습니다.`);
    return HttpResponse.json(null, { status: 200 });
  }),

  // PATCH /projects/:id/status
  http.patch(`${BASE}/projects/:id/status`, async ({ params, request }) => {
    const id = Number(params.id);
    const body = (await request.json()) as UpdateProjectStatusRequest;
    const mp = myProjects.find((m) => m.project && m.project.id === id);
    if (mp) {
      mp.status = body.status;
    }
    const label =
      body.status === "in-progress"
        ? "진행"
        : body.status === "completed"
          ? "완료"
          : "매칭중";
    const project = projects.find((p) => p.id === id);
    if (project) {
      addNotification(
        `"${project.title}" 상태가 "${label}"(으)로 변경되었습니다.`
      );
    }
    return HttpResponse.json(null, { status: 200 });
  }),

  // ─── Experiences ───

  // GET /experiences/project/:projectId
  http.get(`${BASE}/experiences/project/:projectId`, ({ params }) => {
    const projectId = Number(params.projectId);
    const exps = experiences
      .filter((e) => e.projectId === projectId)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ projectId: _projectId, ...rest }) => rest);
    return HttpResponse.json(exps);
  }),

  // POST /experiences/project/:projectId
  http.post(`${BASE}/experiences/project/:projectId`, async ({ params, request }) => {
    const projectId = Number(params.projectId);
    const body = (await request.json()) as ExperienceRequest;

    const existing = experiences.find((e) => e.projectId === projectId);
    if (existing) {
      existing.content = body.content;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { projectId: _projectId, ...rest } = existing;
      return HttpResponse.json(rest);
    }

    const exp: ExperienceResponse & { projectId: number } = {
      id: nextExpId++,
      content: body.content,
      aiSummary: null as unknown as undefined,
      createdAt: "2026-03-30",
      projectId,
    };
    experiences.push(exp);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { projectId: _pid, ...rest } = exp;
    return HttpResponse.json(rest);
  }),

  // POST /experiences/:id/summarize (AI 요약 시작 — 비동기, 202)
  http.post(`${BASE}/experiences/:id/summarize`, ({ params }) => {
    const id = Number(params.id);
    const exp = experiences.find((e) => e.id === id);
    if (!exp) {
      return HttpResponse.json({ message: "Not Found" }, { status: 404 });
    }
    if (exp.content) {
      exp.aiSummary = `[AI 요약] ${exp.content.slice(0, 50)}`;
      exp.summaryStatus = "COMPLETED";
    }
    const res: AiSummaryStatusResponse = { id: exp.id, status: "COMPLETED", aiSummary: exp.aiSummary };
    addNotification("AI 요약이 완료되었습니다.");
    return HttpResponse.json(res, { status: 202 });
  }),

  // GET /experiences/:id/summarize (AI 요약 상태 폴링)
  http.get(`${BASE}/experiences/:id/summarize`, ({ params }) => {
    const id = Number(params.id);
    const exp = experiences.find((e) => e.id === id);
    if (!exp) {
      return HttpResponse.json({ message: "Not Found" }, { status: 404 });
    }
    const res: AiSummaryStatusResponse = {
      id: exp.id,
      status: (exp.summaryStatus ?? "NONE") as AiSummaryStatusResponse["status"],
      aiSummary: exp.aiSummary,
    };
    return HttpResponse.json(res);
  }),

  // ─── Resume ───

  // GET /resume
  http.get(`${BASE}/resume`, () => {
    const summarized = experiences
      .filter((e) => e.aiSummary)
      .map((e) => {
        const project = projects.find((p) =>
          myProjects.some(
            (mp) => mp.project && mp.project.id === p.id && e.projectId === p.id
          )
        );
        return {
          projectId: e.projectId,
          projectTitle: project?.title || "프로젝트",
          skills: project?.skills || [],
          keyPoints: [e.aiSummary!],
        };
      });

    const res: ResumeResponse = {
      basicInfo: profile,
      summarizedExperiences: summarized,
      generatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(res);
  }),

  // POST /resume/generate
  http.post(`${BASE}/resume/generate`, () => {
    addNotification("이력서가 생성되었습니다.");
    return HttpResponse.json(null, { status: 200 });
  }),

  // ─── Notifications ───

  // GET /notifications
  http.get(`${BASE}/notifications`, () => {
    return HttpResponse.json(notifications);
  }),

  // PATCH /notifications/:id/read
  http.patch(`${BASE}/notifications/:id/read`, ({ params }) => {
    const id = Number(params.id);
    const notif = notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
    return HttpResponse.json(null, { status: 200 });
  }),

  // PATCH /notifications/read-all
  http.patch(`${BASE}/notifications/read-all`, () => {
    notifications.forEach((n) => (n.read = true));
    return HttpResponse.json(null, { status: 200 });
  }),

  // ─── HR ───

  // GET /hr/users/:userId
  http.get(`${BASE}/hr/users/:userId`, ({ params }) => {
    const userId = Number(params.userId);
    const user = hrDummyUsers.find((u) => u.id === userId);
    if (!user) {
      return HttpResponse.json({ message: "Not Found" }, { status: 404 });
    }
    const detail: HrUserDetail = {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      phone: "010-1234-5678",
      github: `https://github.com/${user.name.toLowerCase().replace(/\s/g, "")}`,
      blog: undefined,
      educations: [
        { id: 1, schoolName: "경기대학교", major: "컴퓨터공학과", degree: "학사", startDate: "2020-03-01", endDate: "2024-02-29" },
      ],
      certifications: user.certificationNames.map((name, i) => ({
        id: i + 1,
        name,
        issuingOrganization: "한국산업인력공단",
        issuedDate: "2023-11-15",
      })),
      projects: user.projectSkills.length > 0 ? [
        {
          id: userId * 10,
          title: `${user.name}의 프로젝트`,
          category: "웹",
          skills: user.projectSkills.slice(0, 3),
          status: "COMPLETED",
          createdAt: "2026-03-01",
        },
      ] : [],
    };
    return HttpResponse.json(detail);
  }),

  // GET /hr/users
  http.get(`${BASE}/hr/users`, ({ request }) => {
    const url = new URL(request.url);
    const certFilter = url.searchParams.get("certifications");
    const skillFilter = url.searchParams.get("skills");
    const page = parseInt(url.searchParams.get("page") || "0");
    const size = parseInt(url.searchParams.get("size") || "20");

    const certList = certFilter ? certFilter.split(",").map((s) => s.trim()) : [];
    const skillList = skillFilter ? skillFilter.split(",").map((s) => s.trim()) : [];

    let filtered = [...hrDummyUsers];

    if (certList.length > 0) {
      filtered = filtered.filter((u) =>
        certList.some((c) => u.certificationNames.includes(c))
      );
    }
    if (skillList.length > 0) {
      filtered = filtered.filter((u) =>
        skillList.some((s) => u.projectSkills.includes(s))
      );
    }

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / size);
    const paged = filtered.slice(page * size, (page + 1) * size);

    return HttpResponse.json({ users: paged, totalCount, totalPages, currentPage: page });
  }),
];

