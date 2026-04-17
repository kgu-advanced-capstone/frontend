import { NextRequest, NextResponse } from 'next/server';

const BACKEND = 'https://pcserver.cloud';

async function proxy(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  const targetUrl = `${BACKEND}${path}${search}`;

  const reqHeaders = new Headers();
  request.headers.forEach((value, key) => {
    if (!['host', 'connection', 'transfer-encoding'].includes(key.toLowerCase())) {
      reqHeaders.set(key, value);
    }
  });

  const init: RequestInit = {
    method: request.method,
    headers: reqHeaders,
    redirect: 'follow',
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    // @ts-expect-error duplex 옵션은 Node.js fetch에서 스트리밍 body 전송에 필요
    init.duplex = 'half';
    init.body = request.body;
  }

  const res = await fetch(targetUrl, init);

  const resHeaders = new Headers();
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'set-cookie') {
      resHeaders.set(key, value);
    }
  });

  // Set-Cookie에서 Domain 제거 → 프론트엔드 도메인에 쿠키 저장
  // SameSite=None으로 변경하여 크로스사이트 환경에서도 전송
  const rawCookie = res.headers.get('set-cookie');
  if (rawCookie) {
    const modified = rawCookie
      .replace(/;\s*Domain=[^;,]*/gi, '')
      .replace(/;\s*SameSite=\w+/gi, '; SameSite=Lax')
      .replace(/;\s*Secure(?=\s*[;,]|$)/gi, '');
    resHeaders.set('set-cookie', modified);
  }

  return new NextResponse(res.body, {
    status: res.status,
    headers: resHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
