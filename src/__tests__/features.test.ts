/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 전체 기능 통합 테스트
 *
 * 유추한 핵심 유저 플로우:
 *   1. 회원가입 → 로그인 확인
 *   2. 프로필 조회 → 수정
 *   3. 프로젝트 생성 → 목록 조회 → 상세 조회 → 검색/필터/페이지네이션
 *   4. 프로젝트 참가 신청 → 내 프로젝트 확인
 *   5. 프로젝트 상태 변경 (모집중 → 진행중 → 완료)
 *   6. 경험 기록 작성 → 수정 → AI 요약
 *   7. 이력서 생성 → 조회
 *   8. 알림 조회 → 개별 읽음 → 전체 읽음
 *
 * 사용 API (16개 전체):
 *   POST /auth/register, GET /auth/me,
 *   GET /profile, PATCH /profile,
 *   GET /projects, POST /projects, GET /projects/:id, GET /projects/my,
 *   POST /projects/:id/apply, PATCH /projects/:id/status,
 *   GET /experiences/project/:pid, POST /experiences/project/:pid,
 *   POST /experiences/:id/summarize,
 *   GET /resume, POST /resume/generate,
 *   GET /notifications, PATCH /notifications/:id/read, PATCH /notifications/read-all
 */

import { describe, it, expect, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithClient } from "./utils";
import { resetDb } from "./mocks/handlers";

import * as authApi from "@/api/generated/auth/auth";
import * as profileApi from "@/api/generated/profile/profile";
import * as projectApi from "@/api/generated/project/project";
import * as experienceApi from "@/api/generated/experience/experience";
import * as notificationApi from "@/api/generated/notification/notification";
import * as resumeApi from "@/api/generated/resume/resume";

beforeEach(() => {
  resetDb();
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. 회원가입 & 인증
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe("회원가입 & 인증", () => {
  it("POST /auth/register — 회원가입 후 유저 정보 반환", async () => {
    const { result } = renderHookWithClient(() => authApi.useRegister());

    result.current.mutate({
      data: {
        email: "test@buildi.com",
        password: "password123",
        name: "홍길동",
      }
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data as any).data).toMatchObject({
      email: "test@buildi.com",
      name: "홍길동",
    });
  });

  it("GET /auth/me — 가입 후 현재 유저 조회", async () => {
    // 먼저 가입
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "test@buildi.com",
        password: "password123",
        name: "홍길동",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    // me 조회
    const { result } = renderHookWithClient(() => authApi.useMe());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data as any).data.name).toBe("홍길동");
  });

  it("POST /auth/login — 로그인 성공 시 유저 정보 반환", async () => {
    const { result } = renderHookWithClient(() => authApi.useLogin());

    result.current.mutate({
      data: {
        email: "test@buildi.com",
        password: "1234",
      }
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data as any).data).toMatchObject({
      email: "test@buildi.com",
      name: "홍길동",
    });
  });

  it("POST /auth/logout — 로그아웃 후 세션 종료 확인", async () => {
    // 1. 로그인
    const { result: login } = renderHookWithClient(() => authApi.useLogin());
    login.current.mutate({ data: { email: "test@buildi.com", password: "1234" } });
    await waitFor(() => expect(login.current.isSuccess).toBe(true));

    // 2. 로그아웃
    const { result: logout } = renderHookWithClient(() => authApi.useLogout());
    logout.current.mutate();
    await waitFor(() => expect(logout.current.isSuccess).toBe(true));

    // 3. 내 정보 조회 시 401 확인
    const { result: me } = renderHookWithClient(() => authApi.useMe());
    await waitFor(() => expect(me.current.isError).toBe(true));
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. 프로필 관리
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe("프로필 관리", () => {
  it("GET /profile — 프로필 조회", async () => {
    // 가입하여 프로필 초기화
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "dev@buildi.com",
        password: "pass1234",
        name: "김개발",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    const { result } = renderHookWithClient(() => profileApi.useGetProfile());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data as any).data.name).toBe("김개발");
    expect((result.current.data as any).data.email).toBe("dev@buildi.com");
  });

  it("PATCH /profile — 프로필 수정 (깃헙, 전화번호 등)", async () => {
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "dev@buildi.com",
        password: "pass1234",
        name: "김개발",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    const { result } = renderHookWithClient(() => profileApi.useUpdateProfile());
    result.current.mutate({
      data: {
        request: {
          github: "https://github.com/kimdev",
          phone: "010-1234-5678",
        }
      }
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data as profileApi.updateProfileResponseSuccess).data).toMatchObject({
      name: "김개발",
      github: "https://github.com/kimdev",
      phone: "010-1234-5678",
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. 프로젝트 생성 & 탐색
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe("프로젝트 생성 & 탐색", () => {
  async function registerAndCreateProject() {
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "dev@buildi.com",
        password: "pass1234",
        name: "김개발",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    const { result: create } = renderHookWithClient(() => projectApi.useCreateProject());
    create.current.mutate({
      data: {
        title: "AI 챗봇 개발",
        description: "GPT 기반 챗봇 프로젝트",
        category: "AI",
        skills: ["Python", "FastAPI"],
        maxMembers: 4,
        deadline: "2026-06-30",
      }
    });
    await waitFor(() => expect(create.current.isSuccess).toBe(true));
    return (create.current.data as any).data;
  }

  it("POST /projects — 프로젝트 생성", async () => {
    const project = await registerAndCreateProject();
    expect(project.title).toBe("AI 챗봇 개발");
    expect(project.category).toBe("AI");
    expect(project.participants?.length).toBe(1);
  });

  it("GET /projects — 프로젝트 목록 조회 (전체)", async () => {
    await registerAndCreateProject();

    const { result } = renderHookWithClient(() => projectApi.useGetProjects());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data as any).data.totalCount).toBe(1);
    expect((result.current.data as any).data.projects[0].title).toBe("AI 챗봇 개발");
  });

  it("GET /projects — 카테고리 필터", async () => {
    await registerAndCreateProject();

    // 두 번째 프로젝트
    const { result: c2 } = renderHookWithClient(() => projectApi.useCreateProject());
    c2.current.mutate({ data: { title: "웹 포트폴리오", category: "웹" } });
    await waitFor(() => expect(c2.current.isSuccess).toBe(true));

    // AI 카테고리만 필터
    const { result } = renderHookWithClient(() =>
      projectApi.useGetProjects({ category: "AI" })
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data as any).data.totalCount).toBe(1);
    expect((result.current.data as any).data.projects[0].category).toBe("AI");
  });

  it("GET /projects — 검색", async () => {
    await registerAndCreateProject();

    const { result: c2 } = renderHookWithClient(() => projectApi.useCreateProject());
    c2.current.mutate({ data: { title: "블록체인 지갑", category: "블록체인" } });
    await waitFor(() => expect(c2.current.isSuccess).toBe(true));

    const { result } = renderHookWithClient(() =>
      projectApi.useGetProjects({ search: "챗봇" })
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data as any).data.totalCount).toBe(1);
  });

  it("GET /projects — 페이지네이션", async () => {
    await registerAndCreateProject();

    // 추가 프로젝트 2개 생성
    for (const title of ["프로젝트 B", "프로젝트 C"]) {
      const { result: c } = renderHookWithClient(() => projectApi.useCreateProject());
      c.current.mutate({ data: { title, category: "기타" } });
      await waitFor(() => expect(c.current.isSuccess).toBe(true));
    }

    // limit=2, page=1
    const { result: p1 } = renderHookWithClient(() =>
      projectApi.useGetProjects({ page: 1, limit: 2 })
    );
    await waitFor(() => expect(p1.current.isSuccess).toBe(true));
    expect((p1.current.data as any).data.projects).toHaveLength(2);
    expect((p1.current.data as any).data.totalCount).toBe(3);

    // page=2
    const { result: p2 } = renderHookWithClient(() =>
      projectApi.useGetProjects({ page: 2, limit: 2 })
    );
    await waitFor(() => expect(p2.current.isSuccess).toBe(true));
    expect((p2.current.data as any).data.projects).toHaveLength(1);
  });

  it("GET /projects/:id — 프로젝트 상세 조회", async () => {
    const project = await registerAndCreateProject();

    const { result } = renderHookWithClient(() => projectApi.useGetProject(project.id));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data as any).data.title).toBe("AI 챗봇 개발");
    expect((result.current.data as any).data.description).toBe("GPT 기반 챗봇 프로젝트");
    expect((result.current.data as any).data.skills).toEqual(["Python", "FastAPI"]);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. 프로젝트 참가 & 내 프로젝트
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe("프로젝트 참가 & 내 프로젝트", () => {
  it("POST /projects/:id/apply — 참가 신청 후 멤버 수 증가", async () => {
    // 프로젝트 생성
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "a@b.com",
        password: "pass1234",
        name: "유저A",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    const { result: create } = renderHookWithClient(() => projectApi.useCreateProject());
    create.current.mutate({
      data: {
        title: "테스트 프로젝트",
        category: "웹",
        maxMembers: 5,
      }
    });
    await waitFor(() => expect(create.current.isSuccess).toBe(true));
    const projectId = (create.current.data as any).data.id;

    // 참가 신청
    const { result: apply } = renderHookWithClient(() => projectApi.useApplyProject());
    apply.current.mutate({ id: projectId });
    await waitFor(() => expect(apply.current.isSuccess).toBe(true));

    // 상세에서 멤버 수 확인
    const { result: detail } = renderHookWithClient(() =>
      projectApi.useGetProject(projectId)
    );
    await waitFor(() => expect(detail.current.isSuccess).toBe(true));
    expect((detail.current.data as any).data.participants?.length).toBe(2); // 1(생성자) + 1(참가)
  });

  it("GET /projects/my — 내 프로젝트 목록에 표시", async () => {
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "a@b.com",
        password: "pass1234",
        name: "유저A",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    const { result: create } = renderHookWithClient(() => projectApi.useCreateProject());
    create.current.mutate({ data: { title: "내 프로젝트", category: "앱" } });
    await waitFor(() => expect(create.current.isSuccess).toBe(true));

    const { result } = renderHookWithClient(() => projectApi.useGetMyProjects());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data as any).data).toHaveLength(1);
    expect((result.current.data as any).data[0].isOwner).toBe(true);
    expect((result.current.data as any).data[0].status).toBe("recruiting");
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. 프로젝트 상태 관리
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe("프로젝트 상태 관리", () => {
  it("PATCH /projects/:id/status — 모집중 → 진행중 → 완료", async () => {
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "a@b.com",
        password: "pass1234",
        name: "유저A",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    const { result: create } = renderHookWithClient(() => projectApi.useCreateProject());
    create.current.mutate({ data: { title: "상태테스트", category: "웹" } });
    await waitFor(() => expect(create.current.isSuccess).toBe(true));
    const projectId = (create.current.data as any).data.id;

    // 진행중으로 변경
    const { result: s1 } = renderHookWithClient(() =>
      projectApi.useUpdateStatus()
    );
    s1.current.mutate({ id: projectId, data: { status: "in-progress" } });
    await waitFor(() => expect(s1.current.isSuccess).toBe(true));

    // 내 프로젝트에서 상태 확인
    const { result: my1 } = renderHookWithClient(() => projectApi.useGetMyProjects());
    await waitFor(() => expect(my1.current.isSuccess).toBe(true));
    expect((my1.current.data as any).data[0].status).toBe("in-progress");

    // 완료로 변경
    const { result: s2 } = renderHookWithClient(() =>
      projectApi.useUpdateStatus()
    );
    s2.current.mutate({ id: projectId, data: { status: "completed" } });
    await waitFor(() => expect(s2.current.isSuccess).toBe(true));

    const { result: my2 } = renderHookWithClient(() => projectApi.useGetMyProjects());
    await waitFor(() => expect(my2.current.isSuccess).toBe(true));
    expect((my2.current.data as any).data[0].status).toBe("completed");
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. 경험 기록 & AI 요약
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe("경험 기록 & AI 요약", () => {
  async function setupProjectForExp() {
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "a@b.com",
        password: "pass1234",
        name: "유저A",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    const { result: create } = renderHookWithClient(() => projectApi.useCreateProject());
    create.current.mutate({ data: { title: "경험 프로젝트", category: "웹" } });
    await waitFor(() => expect(create.current.isSuccess).toBe(true));
    return (create.current.data as any).data.id;
  }

  it("POST /experiences/project/:pid — 경험 작성", async () => {
    const projectId = await setupProjectForExp();

    const { result } = renderHookWithClient(() =>
      experienceApi.useUpsert()
    );
    result.current.mutate({
      projectId,
      data: {
        content: "React와 TypeScript로 프론트엔드 개발을 담당했습니다.",
      }
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data as any)?.data.content).toContain("React와 TypeScript");
    expect((result.current.data as any)?.data.aiSummary).toBeNull();
  });

  it("POST /experiences/project/:pid — 경험 수정 (upsert)", async () => {
    const projectId = await setupProjectForExp();

    // 첫 작성
    const { result: w1 } = renderHookWithClient(() =>
      experienceApi.useUpsert()
    );
    w1.current.mutate({ projectId, data: { content: "초기 내용" } });
    await waitFor(() => expect(w1.current.isSuccess).toBe(true));

    // 수정
    const { result: w2 } = renderHookWithClient(() =>
      experienceApi.useUpsert()
    );
    w2.current.mutate({ projectId, data: { content: "수정된 내용입니다" } });
    await waitFor(() => expect(w2.current.isSuccess).toBe(true));
    expect((w2.current.data as any)?.data.content).toBe("수정된 내용입니다");
  });

  it("GET /experiences/project/:pid — 경험 목록 조회", async () => {
    const projectId = await setupProjectForExp();

    const { result: upsert } = renderHookWithClient(() =>
      experienceApi.useUpsert()
    );
    upsert.current.mutate({ projectId, data: { content: "프론트엔드 작업 내역" } });
    await waitFor(() => expect(upsert.current.isSuccess).toBe(true));

    const { result } = renderHookWithClient(() => experienceApi.useGetByProject(projectId));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data as any)?.data).toHaveLength(1);
    expect((result.current.data as any)?.data[0].content).toBe("프론트엔드 작업 내역");
  });

  it("POST /experiences/:id/summarize — AI 요약 생성", async () => {
    const projectId = await setupProjectForExp();

    const { result: upsert } = renderHookWithClient(() =>
      experienceApi.useUpsert()
    );
    upsert.current.mutate({
      projectId,
      data: {
        content:
          "React 컴포넌트 설계, 상태 관리, API 연동 등 프론트엔드 전반을 담당",
      }
    });
    await waitFor(() => expect(upsert.current.isSuccess).toBe(true));
    const expId = (upsert.current.data as any).data.id;

    const { result: summarize } = renderHookWithClient(() =>
      experienceApi.useStartSummarize()
    );
    summarize.current.mutate({ id: expId });
    await waitFor(() => expect(summarize.current.isSuccess).toBe(true));
    expect((summarize.current.data as any)?.data.aiSummary).toContain("[AI 요약]");
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. 이력서 생성 & 조회
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe("이력서 생성 & 조회", () => {
  it("POST /resume/generate + GET /resume — AI 이력서 생성 후 조회", async () => {
    // 가입 + 프로필
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "a@b.com",
        password: "pass1234",
        name: "유저A",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    const { result: profile } = renderHookWithClient(() => profileApi.useUpdateProfile());
    profile.current.mutate({
      data: {
        request: {
          github: "https://github.com/userA",
        }
      }
    });
    await waitFor(() => expect(profile.current.isSuccess).toBe(true));

    // 프로젝트 생성 + 경험 작성 + AI 요약
    const { result: create } = renderHookWithClient(() => projectApi.useCreateProject());
    create.current.mutate({ data: { title: "이력서용 프로젝트", category: "웹" } });
    await waitFor(() => expect(create.current.isSuccess).toBe(true));
    const projectId = (create.current.data as any).data.id;

    const { result: upsert } = renderHookWithClient(() =>
      experienceApi.useUpsert()
    );
    upsert.current.mutate({ projectId, data: { content: "풀스택 웹 개발 경험" } });
    await waitFor(() => expect(upsert.current.isSuccess).toBe(true));

    const { result: summarize } = renderHookWithClient(() =>
      experienceApi.useStartSummarize()
    );
    summarize.current.mutate({ id: (upsert.current.data as any).data.id });
    await waitFor(() => expect(summarize.current.isSuccess).toBe(true));

    // 이력서 생성
    const { result: gen } = renderHookWithClient(() => resumeApi.useGenerate());
    gen.current.mutate();
    await waitFor(() => expect(gen.current.isSuccess).toBe(true));

    // 이력서 조회
    const { result: resume } = renderHookWithClient(() => resumeApi.useGetResume());
    await waitFor(() => expect(resume.current.isSuccess).toBe(true));
    expect((resume.current.data as any).data.basicInfo.name).toBe("유저A");
    expect((resume.current.data as any).data.basicInfo.github).toBe(
      "https://github.com/userA"
    );
    expect((resume.current.data as any).data.summarizedExperiences).toHaveLength(1);
    expect(
      (resume.current.data as any).data.summarizedExperiences[0].projectTitle
    ).toBe("이력서용 프로젝트");
    expect((resume.current.data as any).data.generatedAt).toBeTruthy();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. 알림
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe("알림 시스템", () => {
  it("GET /notifications — 프로젝트 생성/참가/상태변경 시 알림 발생", async () => {
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "a@b.com",
        password: "pass1234",
        name: "유저A",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    // 프로젝트 생성 → 알림 1
    const { result: create } = renderHookWithClient(() => projectApi.useCreateProject());
    create.current.mutate({ data: { title: "알림테스트", category: "웹" } });
    await waitFor(() => expect(create.current.isSuccess).toBe(true));
    const projectId = (create.current.data as any).data.id;

    // 참가 → 알림 2
    const { result: apply } = renderHookWithClient(() => projectApi.useApplyProject());
    apply.current.mutate({ id: projectId });
    await waitFor(() => expect(apply.current.isSuccess).toBe(true));

    // 상태 변경 → 알림 3
    const { result: status } = renderHookWithClient(() =>
      projectApi.useUpdateStatus()
    );
    status.current.mutate({ id: projectId, data: { status: "in-progress" } });
    await waitFor(() => expect(status.current.isSuccess).toBe(true));

    const { result } = renderHookWithClient(() => notificationApi.useGetNotifications());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data as any).data.length).toBeGreaterThanOrEqual(3);
    expect((result.current.data as any).data.every((n: any) => !n.read)).toBe(true);
  });

  it("PATCH /notifications/:id/read — 개별 알림 읽음 처리", async () => {
    // 알림 생성을 위해 프로젝트 생성
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "a@b.com",
        password: "pass1234",
        name: "유저A",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    const { result: create } = renderHookWithClient(() => projectApi.useCreateProject());
    create.current.mutate({ data: { title: "읽음테스트", category: "웹" } });
    await waitFor(() => expect(create.current.isSuccess).toBe(true));

    // 알림 조회
    const { result: notifs } = renderHookWithClient(() => notificationApi.useGetNotifications());
    await waitFor(() => expect(notifs.current.isSuccess).toBe(true));
    const notifId = (notifs.current.data as any).data[0].id;

    // 개별 읽음
    const { result: mark } = renderHookWithClient(() => notificationApi.useMarkAsRead());
    mark.current.mutate({ id: notifId });
    await waitFor(() => expect(mark.current.isSuccess).toBe(true));

    // 확인
    const { result: check } = renderHookWithClient(() => notificationApi.useGetNotifications());
    await waitFor(() => expect(check.current.isSuccess).toBe(true));
    expect((check.current.data as any).data.find((n: any) => n.id === notifId)?.read).toBe(true);
  });

  it("PATCH /notifications/read-all — 전체 알림 읽음 처리", async () => {
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "a@b.com",
        password: "pass1234",
        name: "유저A",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    // 여러 알림 생성
    const { result: c1 } = renderHookWithClient(() => projectApi.useCreateProject());
    c1.current.mutate({ data: { title: "프로젝트1", category: "웹" } });
    await waitFor(() => expect(c1.current.isSuccess).toBe(true));

    const { result: c2 } = renderHookWithClient(() => projectApi.useCreateProject());
    c2.current.mutate({ data: { title: "프로젝트2", category: "앱" } });
    await waitFor(() => expect(c2.current.isSuccess).toBe(true));

    // 전체 읽음
    const { result: markAll } = renderHookWithClient(() => notificationApi.useMarkAllAsRead());
    markAll.current.mutate();
    await waitFor(() => expect(markAll.current.isSuccess).toBe(true));

    // 확인
    const { result: check } = renderHookWithClient(() => notificationApi.useGetNotifications());
    await waitFor(() => expect(check.current.isSuccess).toBe(true));
    expect((check.current.data as any).data.every((n: any) => n.read)).toBe(true);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. E2E 전체 플로우 (모든 API 한번에)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe("전체 유저 플로우 (모든 API 통합)", () => {
  it("가입 → 프로필 → 프로젝트 → 참가 → 경험 → 요약 → 이력서 → 알림 전체 흐름", async () => {
    // 1) 회원가입
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "fullflow@buildi.com",
        password: "secure123",
        name: "풀플로우",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    // 2) 로그인 확인
    const { result: me } = renderHookWithClient(() => authApi.useMe());
    await waitFor(() => expect(me.current.isSuccess).toBe(true));
    expect((me.current.data as any).data?.name).toBe("풀플로우");

    // 3) 프로필 수정
    const { result: updateProf } = renderHookWithClient(() =>
      profileApi.useUpdateProfile()
    );
    updateProf.current.mutate({
      data: {
        request: {
          github: "https://github.com/fullflow",
          blog: "https://blog.fullflow.dev",
          phone: "010-9999-8888",
        }
      }
    });
    await waitFor(() => expect(updateProf.current.isSuccess).toBe(true));

    // 4) 프로필 조회 확인
    const { result: prof } = renderHookWithClient(() => profileApi.useGetProfile());
    await waitFor(() => expect(prof.current.isSuccess).toBe(true));
    expect((prof.current.data as any).data?.github).toBe("https://github.com/fullflow");

    // 5) 프로젝트 생성
    const { result: createP } = renderHookWithClient(() => projectApi.useCreateProject());
    createP.current.mutate({
      data: {
        title: "풀스택 SaaS",
        description: "Next.js + Spring Boot SaaS 플랫폼",
        category: "웹",
        skills: ["React", "Spring Boot", "PostgreSQL"],
        maxMembers: 5,
        deadline: "2026-09-01",
      }
    });
    await waitFor(() => expect(createP.current.isSuccess).toBe(true));
    const projectId = (createP.current.data as any).data.id;

    // 6) 프로젝트 목록 조회
    const { result: list } = renderHookWithClient(() => projectApi.useGetProjects());
    await waitFor(() => expect(list.current.isSuccess).toBe(true));
    expect((list.current.data as any).data.totalCount).toBe(1);

    // 7) 프로젝트 상세 조회
    const { result: detail } = renderHookWithClient(() =>
      projectApi.useGetProject(projectId)
    );
    await waitFor(() => expect(detail.current.isSuccess).toBe(true));
    expect((detail.current.data as any).data.skills).toContain("React");

    // 8) 프로젝트 참가 신청
    const { result: apply } = renderHookWithClient(() => projectApi.useApplyProject());
    apply.current.mutate({ id: projectId });
    await waitFor(() => expect(apply.current.isSuccess).toBe(true));

    // 9) 내 프로젝트 확인
    const { result: myP } = renderHookWithClient(() => projectApi.useGetMyProjects());
    await waitFor(() => expect(myP.current.isSuccess).toBe(true));
    expect((myP.current.data as any).data.length).toBeGreaterThanOrEqual(1);

    // 10) 프로젝트 상태 변경 → 진행중
    const { result: toProgress } = renderHookWithClient(() =>
      projectApi.useUpdateStatus()
    );
    toProgress.current.mutate({ id: projectId, data: { status: "in-progress" } });
    await waitFor(() => expect(toProgress.current.isSuccess).toBe(true));

    // 11) 경험 기록 작성
    const { result: writeExp } = renderHookWithClient(() =>
      experienceApi.useUpsert()
    );
    writeExp.current.mutate({
      projectId,
      data: {
        content:
          "프론트엔드 아키텍처 설계, 컴포넌트 개발, API 연동, 코드 리뷰를 주도적으로 수행했습니다.",
      }
    });
    await waitFor(() => expect(writeExp.current.isSuccess).toBe(true));
    const expId = (writeExp.current.data as any).data.id;

    // 12) 경험 조회
    const { result: exps } = renderHookWithClient(() =>
      experienceApi.useGetByProject(projectId)
    );
    await waitFor(() => expect(exps.current.isSuccess).toBe(true));
    expect((exps.current.data as any).data).toHaveLength(1);

    // 13) AI 요약
    const { result: summarize } = renderHookWithClient(() =>
      experienceApi.useStartSummarize()
    );
    summarize.current.mutate({ id: expId });
    await waitFor(() => expect(summarize.current.isSuccess).toBe(true));
    expect((summarize.current.data as any).data.aiSummary).toContain("[AI 요약]");

    // 14) 프로젝트 완료 처리
    const { result: toComplete } = renderHookWithClient(() =>
      projectApi.useUpdateStatus()
    );
    toComplete.current.mutate({ id: projectId, data: { status: "completed" } });
    await waitFor(() => expect(toComplete.current.isSuccess).toBe(true));

    // 15) 이력서 생성
    const { result: genResume } = renderHookWithClient(() =>
      resumeApi.useGenerate()
    );
    genResume.current.mutate();
    await waitFor(() => expect(genResume.current.isSuccess).toBe(true));

    // 16) 이력서 조회
    const { result: resume } = renderHookWithClient(() => resumeApi.useGetResume());
    await waitFor(() => expect(resume.current.isSuccess).toBe(true));
    expect((resume.current.data as any).data.basicInfo.name).toBe("풀플로우");
    expect((resume.current.data as any).data.summarizedExperiences.length).toBeGreaterThan(
      0
    );

    // 17) 알림 조회 — 여러 활동으로 알림 누적
    const { result: notifs } = renderHookWithClient(() => notificationApi.useGetNotifications());
    await waitFor(() => expect(notifs.current.isSuccess).toBe(true));
    expect((notifs.current.data as any).data.length).toBeGreaterThanOrEqual(4);

    // 18) 개별 알림 읽음
    const firstNotifId = (notifs.current.data as any).data[0].id;
    const { result: markOne } = renderHookWithClient(() => notificationApi.useMarkAsRead());
    markOne.current.mutate({ id: firstNotifId });
    await waitFor(() => expect(markOne.current.isSuccess).toBe(true));

    // 19) 전체 알림 읽음
    const { result: markAll } = renderHookWithClient(() => notificationApi.useMarkAllAsRead());
    markAll.current.mutate();
    await waitFor(() => expect(markAll.current.isSuccess).toBe(true));

    // 최종 확인: 모든 알림 읽음 상태
    const { result: finalNotifs } = renderHookWithClient(() =>
      notificationApi.useGetNotifications()
    );
    await waitFor(() => expect(finalNotifs.current.isSuccess).toBe(true));
    expect((finalNotifs.current.data as any).data.every((n: any) => n.read)).toBe(true);
  });
});
