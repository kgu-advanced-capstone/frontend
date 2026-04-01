/**
 * 프로필 수정 기능 통합 테스트
 *
 * 테스트 시나리오:
 *   1. 프로필 조회 (GET /profile)
 *   2. 프로필 수정 (PATCH /profile) — 이름, 전화번호, GitHub, 블로그, 프로필 이미지
 *   3. 부분 수정 — 일부 필드만 업데이트
 *   4. 프로필 수정 후 재조회 시 반영 확인
 *   5. 빈 값으로 수정 (필드 초기화)
 *   6. 프로필 수정 후 인증 정보 동기화 확인
 */

import { describe, it, expect, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithClient } from "./utils";
import { resetDb } from "./mocks/handlers";

import * as authApi from "@/api/generated/auth/auth";
import * as profileApi from "@/api/generated/profile/profile";

beforeEach(() => {
  resetDb();
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. 프로필 조회
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe("프로필 조회", () => {
  it("회원가입 후 프로필 조회 시 기본 정보가 설정되어 있다", async () => {
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "test@buildi.com",
        password: "password123",
        name: "홍길동",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    const { result } = renderHookWithClient(() => profileApi.useGetProfile());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toMatchObject({
      name: "홍길동",
      email: "test@buildi.com",
      phone: null,
      github: null,
      blog: null,
      profileImage: null,
    });
  });

  it("미가입 상태에서도 프로필 조회가 가능하다 (빈 프로필)", async () => {
    const { result } = renderHookWithClient(() => profileApi.useGetProfile());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toMatchObject({
      name: "",
      email: "",
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. 프로필 전체 수정
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe("프로필 전체 수정", () => {
  it("모든 필드를 한 번에 수정할 수 있다", async () => {
    // 가입
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "dev@buildi.com",
        password: "pass1234",
        name: "김개발",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    // 전체 수정
    const { result } = renderHookWithClient(() => profileApi.useUpdateProfile());
    result.current.mutate({
      data: {
        request: {
          name: "김빌디",
          phone: "010-9999-8888",
          github: "https://github.com/kimbuildi",
          blog: "https://kimbuildi.dev",
        },
        profileImage: new Blob(["fake image data"], { type: "image/jpeg" }),
      }
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data as any).data).toMatchObject({
      name: "김빌디",
      email: "dev@buildi.com",
      phone: "010-9999-8888",
      github: "https://github.com/kimbuildi",
      blog: "https://kimbuildi.dev",
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. 프로필 부분 수정
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe("프로필 부분 수정", () => {
  it("GitHub URL만 수정해도 다른 필드가 유지된다", async () => {
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "dev@buildi.com",
        password: "pass1234",
        name: "김개발",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    // 먼저 전화번호 설정
    const { result: update1 } = renderHookWithClient(() => profileApi.useUpdateProfile());
    update1.current.mutate({ data: { request: { phone: "010-1111-2222" } } });
    await waitFor(() => expect(update1.current.isSuccess).toBe(true));

    // GitHub만 수정
    const { result: update2 } = renderHookWithClient(() => profileApi.useUpdateProfile());
    update2.current.mutate({ data: { request: { github: "https://github.com/kimdev" } } });
    await waitFor(() => expect(update2.current.isSuccess).toBe(true));

    // 전화번호가 유지되는지 확인
    expect((update2.current.data as any).data).toMatchObject({
      name: "김개발",
      phone: "010-1111-2222",
      github: "https://github.com/kimdev",
    });
  });

  it("이름만 수정할 수 있다", async () => {
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
    result.current.mutate({ data: { request: { name: "박개발" } } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect((result.current.data as any).data?.name).toBe("박개발");
    expect((result.current.data as any).data?.email).toBe("dev@buildi.com");
  });

  it("블로그 URL만 수정할 수 있다", async () => {
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
    result.current.mutate({ data: { request: { blog: "https://blog.buildi.com" } } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect((result.current.data as any).data?.blog).toBe("https://blog.buildi.com");
    expect((result.current.data as any).data?.name).toBe("김개발");
  });

  it("프로필 이미지만 수정할 수 있다", async () => {
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
        request: {},
        profileImage: new Blob(["fake image data"], { type: "image/jpeg" })
      }
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect((result.current.data as any).data?.profileImage).toBeDefined();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. 수정 후 재조회
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe("수정 후 재조회", () => {
  it("프로필 수정 후 재조회 시 변경사항이 반영되어 있다", async () => {
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "dev@buildi.com",
        password: "pass1234",
        name: "김개발",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    // 수정
    const { result: update } = renderHookWithClient(() => profileApi.useUpdateProfile());
    update.current.mutate({
      data: {
        request: {
          name: "이개발",
          github: "https://github.com/leedev",
          phone: "010-5555-6666",
        }
      }
    });
    await waitFor(() => expect(update.current.isSuccess).toBe(true));

    // 재조회
    const { result: profile } = renderHookWithClient(() => profileApi.useGetProfile());
    await waitFor(() => expect(profile.current.isSuccess).toBe(true));

    expect((profile.current.data as any).data).toMatchObject({
      name: "이개발",
      email: "dev@buildi.com",
      github: "https://github.com/leedev",
      phone: "010-5555-6666",
    });
  });

  it("여러 번 수정해도 마지막 값이 유지된다", async () => {
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "dev@buildi.com",
        password: "pass1234",
        name: "김개발",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    // 첫 번째 수정
    const { result: u1 } = renderHookWithClient(() => profileApi.useUpdateProfile());
    u1.current.mutate({ data: { request: { name: "첫번째" } } });
    await waitFor(() => expect(u1.current.isSuccess).toBe(true));

    // 두 번째 수정
    const { result: u2 } = renderHookWithClient(() => profileApi.useUpdateProfile());
    u2.current.mutate({ data: { request: { name: "두번째" } } });
    await waitFor(() => expect(u2.current.isSuccess).toBe(true));

    // 세 번째 수정
    const { result: u3 } = renderHookWithClient(() => profileApi.useUpdateProfile());
    u3.current.mutate({ data: { request: { name: "최종이름" } } });
    await waitFor(() => expect(u3.current.isSuccess).toBe(true));

    // 재조회
    const { result: profile } = renderHookWithClient(() => profileApi.useGetProfile());
    await waitFor(() => expect(profile.current.isSuccess).toBe(true));
    expect((profile.current.data as any).data?.name).toBe("최종이름");
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. 이메일 변경 불가 확인
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe("이메일 변경 불가", () => {
  it("프로필 수정 시 이메일은 변경되지 않는다", async () => {
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "original@buildi.com",
        password: "pass1234",
        name: "김개발",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    // UpdateProfileRequest에는 email 필드가 없으므로
    // name만 수정해도 email은 유지
    const { result } = renderHookWithClient(() => profileApi.useUpdateProfile());
    result.current.mutate({ data: { request: { name: "변경됨" } } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect((result.current.data as any).data?.email).toBe("original@buildi.com");
    expect((result.current.data as any).data?.name).toBe("변경됨");
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. 프로필 수정 후 인증 정보 동기화
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe("프로필-인증 동기화", () => {
  it("회원가입 후 프로필과 인증 정보의 이름이 일치한다", async () => {
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "sync@buildi.com",
        password: "pass1234",
        name: "동기화테스트",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    // auth/me 조회
    const { result: me } = renderHookWithClient(() => authApi.useMe());
    await waitFor(() => expect(me.current.isSuccess).toBe(true));

    // profile 조회
    const { result: profile } = renderHookWithClient(() => profileApi.useGetProfile());
    await waitFor(() => expect(profile.current.isSuccess).toBe(true));

    expect(me.current.data?.data?.name).toBe("동기화테스트");
    expect(profile.current.data?.data?.name).toBe("동기화테스트");
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. 복합 시나리오
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe("복합 시나리오", () => {
  it("가입 → 프로필 조회 → 전체 수정 → 재조회 흐름이 정상 동작한다", async () => {
    // 1. 가입
    const { result: reg } = renderHookWithClient(() => authApi.useRegister());
    reg.current.mutate({
      data: {
        email: "flow@buildi.com",
        password: "pass1234",
        name: "플로우테스트",
      }
    });
    await waitFor(() => expect(reg.current.isSuccess).toBe(true));

    // 2. 초기 프로필 조회
    const { result: p1 } = renderHookWithClient(() => profileApi.useGetProfile());
    await waitFor(() => expect(p1.current.isSuccess).toBe(true));
    expect(p1.current.data?.data?.name).toBe("플로우테스트");
    expect(p1.current.data?.data?.phone).toBeNull();

    // 3. 전체 수정
    const { result: update } = renderHookWithClient(() => profileApi.useUpdateProfile());
    update.current.mutate({
      data: {
        request: {
          name: "수정된이름",
          phone: "010-1234-5678",
          github: "https://github.com/flowtest",
          blog: "https://flowtest.blog",
        },
        profileImage: new Blob(["fake image data"], { type: "image/jpeg" }),
      }
    });
    await waitFor(() => expect(update.current.isSuccess).toBe(true));

    // 4. 재조회 확인
    const { result: p2 } = renderHookWithClient(() => profileApi.useGetProfile());
    await waitFor(() => expect(p2.current.isSuccess).toBe(true));
    expect((p2.current.data as any).data).toMatchObject({
      name: "수정된이름",
      email: "flow@buildi.com",
      phone: "010-1234-5678",
      github: "https://github.com/flowtest",
      blog: "https://flowtest.blog",
    });
  });
});
