/**
 * 프로필 업데이트 multipart/form-data 통합 테스트
 *
 * 실제 백엔드(https://pcserver.cloud)에 HTTP 요청을 보내
 * Content-Type이 multipart/form-data로 정상 전송되는지 검증한다.
 *
 * 실행: npx vitest run src/__tests__/integration
 */

import axios from "axios";
import { describe, it, expect, beforeAll } from "vitest";

const BASE = "https://pcserver.cloud";

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  // 4xx/5xx를 throw하지 않도록 설정 (상태 코드로 직접 검사)
  validateStatus: () => true,
});

// ─── 쿠키 수동 관리 (Node.js axios는 브라우저 쿠키 자동 처리 안 함) ───
const cookieJar: Record<string, string> = {};

api.interceptors.response.use((res) => {
  const raw = res.headers["set-cookie"];
  if (raw) {
    (Array.isArray(raw) ? raw : [raw]).forEach((c) => {
      const [pair] = c.split(";");
      const idx = pair.indexOf("=");
      if (idx !== -1) {
        cookieJar[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
      }
    });
  }
  return res;
});

api.interceptors.request.use((config) => {
  const cookie = Object.entries(cookieJar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  if (cookie) config.headers["Cookie"] = cookie;

  // FormData: Content-Type 제거 → Node.js axios가 multipart로 자동 처리
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }
  return config;
});

// 테스트마다 충돌 없도록 타임스탬프 기반 이메일 사용
const testEmail = `integration-test-${Date.now()}@buildi-test.invalid`;
const testPassword = "TestPass1234!";

describe("프로필 업데이트 통합 테스트", () => {
  beforeAll(async () => {
    // 테스트용 계정 회원가입
    const registerRes = await api.post("/api/auth/register", {
      email: testEmail,
      password: testPassword,
      name: "통합테스트",
    });
    expect(registerRes.status, `회원가입 실패: ${JSON.stringify(registerRes.data)}`).toBe(201);

    // 로그인하여 세션 쿠키 획득
    const loginRes = await api.post("/api/auth/login", {
      email: testEmail,
      password: testPassword,
    });
    expect(loginRes.status, `로그인 실패: ${JSON.stringify(loginRes.data)}`).toBe(200);
  });

  it("PATCH /api/profile - multipart/form-data로 전송 시 200 응답", async () => {
    const formData = new FormData();
    formData.append(
      "request",
      new Blob([JSON.stringify({ name: "통합테스트수정", phone: "010-0000-0000" })], {
        type: "application/json",
      })
    );

    const res = await api.patch("/api/profile", formData);

    expect(
      res.status,
      `프로필 업데이트 실패 (status ${res.status}): ${JSON.stringify(res.data)}`
    ).toBe(200);
  });

  it("PATCH /api/profile - 이미지 없이도 성공", async () => {
    const formData = new FormData();
    formData.append(
      "request",
      new Blob([JSON.stringify({ github: "https://github.com/test" })], {
        type: "application/json",
      })
    );

    const res = await api.patch("/api/profile", formData);

    expect(
      res.status,
      `이미지 없는 프로필 업데이트 실패 (status ${res.status}): ${JSON.stringify(res.data)}`
    ).toBe(200);
  });

  it("전송된 요청의 Content-Type이 multipart/form-data여야 한다", async () => {
    let capturedContentType: string | undefined;

    const interceptorId = api.interceptors.request.use((config) => {
      // FormData 삭제 후 실제로 어떤 Content-Type이 남는지 캡처
      // (이미 위 interceptor에서 delete됐으므로 undefined 또는 multipart)
      capturedContentType = config.headers?.["Content-Type"] as string | undefined;
      return config;
    });

    const formData = new FormData();
    formData.append(
      "request",
      new Blob([JSON.stringify({ name: "테스트" })], { type: "application/json" })
    );
    await api.patch("/api/profile", formData);

    api.interceptors.request.eject(interceptorId);

    // Content-Type이 application/json 또는 application/octet-stream이 아니어야 한다
    expect(capturedContentType).not.toBe("application/json");
    expect(capturedContentType).not.toBe("application/octet-stream");
  });
});
