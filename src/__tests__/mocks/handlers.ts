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
  UserResponse,
} from "@/api/types";

const BASE = "/api";

// ─── In-memory DB ───
let users: UserResponse[] = [];
let currentUser: UserResponse | null = null;
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
}

export const handlers = [
  // ─── Auth ───

  // POST /auth/register
  http.post(`${BASE}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as RegisterRequest;
    const user: UserResponse = {
      id: nextUserId++,
      email: body.email,
      name: body.name,
      profileImage: undefined,
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
    
    // For development convenience, allow test accounts if they don't exist in 'users'
    if (!user && (body.email === "test@buildi.com" || body.email === "user@buildi.com")) {
      const newUser = {
        id: nextUserId++,
        email: body.email,
        name: body.email === "test@buildi.com" ? "홍길동" : "김빌디",
        profileImage: undefined,
      };
      users.push(newUser);
      currentUser = newUser;
      profile = { ...profile, name: newUser.name, email: newUser.email };
      return HttpResponse.json(newUser);
    }

    if (!user || body.password === "fail") {
      return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    currentUser = user;
    profile = { phone: null, github: null, blog: null, profileImage: null, name: user.name, email: user.email };
    return HttpResponse.json(user);
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
      skills: body.skills || [],
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
];

