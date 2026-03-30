import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // /api 경로로 가는 요청에 대해서만 처리
  if (request.nextUrl.pathname.startsWith("/api")) {
    const response = NextResponse.next();

    // 서버로부터 온 응답의 Set-Cookie 헤더를 가져옴
    const setCookie = response.headers.get("set-cookie");

    if (setCookie) {
      // Domain=pcserver.cloud 부분을 제거하여 localhost에서도 쿠키가 구워지도록 수정
      // 또한 Secure 속성이 http 환경에서 문제를 일으킬 수 있으므로 제거 (개발 환경 대응)
      const modifiedCookie = setCookie
        .replace(/Domain=[^;]+;?/, "")
        .replace(/Secure;?/, "");
      
      response.headers.set("set-cookie", modifiedCookie);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
