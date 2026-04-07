/**
 * fetch API를 이용한 multipart/form-data 통합 테스트
 *
 * customInstance가 FormData 전송 시 사용하는 fetch API + normalizeFormData와
 * 동일한 방식으로 실제 백엔드에 HTTP 요청을 전송하여 200 응답을 검증한다.
 *
 * 실행: pnpm run test:integration
 */

import { describe, it, expect, beforeAll } from "vitest";
import { normalizeFormData } from "@/api/mutator/custom-instance";

const BASE = "https://pcserver.cloud";

// 쿠키 수동 관리
const cookieJar: Record<string, string> = {};

function getCookieHeader(): string {
  return Object.entries(cookieJar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

function saveCookies(res: Response): void {
  const raw = res.headers.get("set-cookie");
  if (!raw) return;
  raw.split(",").forEach((c) => {
    const [pair] = c.trim().split(";");
    const idx = pair.indexOf("=");
    if (idx !== -1) {
      cookieJar[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
    }
  });
}

async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };
  const cookie = getCookieHeader();
  if (cookie) headers["Cookie"] = cookie;

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
  saveCookies(res);
  return res;
}

const testEmail = `fetch-test-${Date.now()}@buildi-test.invalid`;
const testPassword = "TestPass1234!";

describe("fetch + normalizeFormData 통합 테스트 (customInstance와 동일한 방식)", () => {
  beforeAll(async () => {
    // 회원가입
    const reg = await apiFetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword, name: "fetch테스트" }),
    });
    expect(reg.status, `회원가입 실패: ${await reg.text()}`).toBe(201);

    // 로그인
    const login = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    expect(login.status, `로그인 실패: ${await login.text()}`).toBe(200);
  });

  it("Orval 생성 코드와 동일하게 plain string append → normalizeFormData → 200", async () => {
    // Orval 생성 코드와 동일한 방식으로 FormData 생성
    const raw = new FormData();
    raw.append("request", JSON.stringify({ name: "fetch테스트수정", phone: "010-1111-2222" }));

    // customInstance 내부와 동일하게 normalizeFormData 적용
    const formData = normalizeFormData(raw);

    const res = await apiFetch("/api/profile", {
      method: "PATCH",
      body: formData,
      // Content-Type 미설정 → fetch가 multipart/form-data; boundary=... 자동 설정
    });

    const body = await res.json().catch(() => ({}));
    expect(
      res.status,
      `프로필 업데이트 실패 (${res.status}): ${JSON.stringify(body)}`
    ).toBe(200);
  });

  it("파일 포함 → normalizeFormData → 200", async () => {
    const raw = new FormData();
    raw.append("request", JSON.stringify({ name: "fetch이미지테스트" }));
    // 실제 파일 대신 Blob으로 이미지 시뮬레이션 (JPEG 매직 바이트)
    raw.append(
      "profileImage",
      new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], { type: "image/jpeg" }),
      "test.jpg"
    );

    const formData = normalizeFormData(raw);

    const res = await apiFetch("/api/profile", {
      method: "PATCH",
      body: formData,
    });

    const body = await res.json().catch(() => ({}));
    expect(
      res.status,
      `이미지 포함 프로필 업데이트 실패 (${res.status}): ${JSON.stringify(body)}`
    ).toBe(200);
  });
});
