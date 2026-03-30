# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 빌드 & 실행 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트
npm run lint

# 테스트 실행
npm run test

# 테스트 워치 모드
npm run test:watch
```

개발 서버 실행 후: `http://localhost:3000`
백엔드 API: `https://pcserver.cloud/api/*` (Next.js rewrites 경유, `/api/*` → 백엔드)

## 아키텍처

Next.js 16 (App Router) + React 19 + TypeScript 프로젝트.

### 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 16.1.6 (App Router) |
| UI 라이브러리 | React 19, Shadcn UI, Tailwind CSS 4 |
| 서버 상태 관리 | TanStack React Query v5 |
| HTTP 클라이언트 | Axios (쿠키 기반 세션 인증, `withCredentials: true`) |
| 아이콘 | Lucide React |
| 테스트 | Vitest + Testing Library + MSW (Mock Service Worker) |

### 디렉토리 구조

```
src/
├── app/                  ← Next.js App Router 페이지
│   ├── login/
│   ├── register/
│   ├── profile/
│   ├── projects/
│   ├── my-projects/
│   ├── resume/
│   ├── layout.tsx        ← 루트 레이아웃 (AuthProvider, QueryProvider)
│   └── page.tsx          ← 홈페이지
├── api/                  ← API 클라이언트 및 React Query 훅
│   ├── client.ts         ← Axios 인스턴스 (baseURL: "/api", withCredentials: true)
│   ├── types.ts          ← 요청/응답 타입 정의
│   └── hooks/            ← React Query 커스텀 훅
│       ├── useAuth.ts
│       ├── useProfile.ts
│       ├── useProjects.ts
│       ├── useExperiences.ts
│       ├── useResume.ts
│       └── useNotifications.ts
├── components/           ← 공용 컴포넌트
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ProjectCard.tsx
│   ├── QueryProvider.tsx ← React Query Provider (staleTime: 1분, retry: 1)
│   └── ui/               ← Shadcn UI 컴포넌트
├── contexts/             ← React Context
│   ├── AuthContext.tsx    ← 인증 상태 (login, register, logout)
│   └── ProjectContext.tsx
├── lib/
│   └── utils.ts          ← cn() 유틸리티 (clsx + tailwind-merge)
├── __tests__/            ← 통합 테스트
│   ├── setup.ts          ← MSW 서버 초기화
│   ├── utils.tsx          ← renderHookWithClient 등 테스트 유틸
│   └── mocks/
│       ├── handlers.ts   ← MSW 핸들러 (인메모리 DB)
│       └── server.ts
└── middleware.ts         ← 개발 환경 쿠키 Domain/Secure 속성 제거
```

### 핵심 설계 결정

- **인증:** 세션 기반 쿠키 인증 (JWT 아님). `withCredentials: true`로 모든 요청에 쿠키 자동 전송.
- **API 프록시:** `next.config.ts`의 rewrites로 `/api/*` → `https://pcserver.cloud/api/*` 프록시. 프론트엔드 코드에서 백엔드 URL을 직접 참조하지 않는다.
- **상태 관리:** 서버 상태는 React Query, 클라이언트 상태는 React Context. 별도 전역 상태 라이브러리(Redux 등) 없음.
- **컴포넌트:** Shadcn UI 기반. 새 UI 컴포넌트가 필요하면 `npx shadcn@latest add <component>` 사용.
- **경로 별칭:** `@/*` → `src/*` (tsconfig.json paths)

### API 훅 패턴

```typescript
// 조회: useQuery
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: async () => {
      const { data } = await client.get<ProfileResponse>("/profile");
      return data;
    },
  });
}

// 변경: useMutation + invalidateQueries
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateProfileRequest) => {
      const { data } = await client.patch<ProfileResponse>("/profile", body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
}
```

- 새 API 훅 추가 시 `src/api/hooks/`에 파일 생성, `src/api/types.ts`에 타입 정의.
- mutation 성공 시 관련 쿼리 `invalidateQueries`로 캐시 갱신.

## 코드 배치 규칙

| 대상 | 위치 |
|---|---|
| 새 페이지 | `src/app/<route>/page.tsx` |
| API 훅 (React Query) | `src/api/hooks/` |
| 요청/응답 타입 | `src/api/types.ts` |
| 공용 컴포넌트 | `src/components/` |
| Shadcn UI 컴포넌트 | `src/components/ui/` |
| React Context | `src/contexts/` |
| 테스트 | `src/__tests__/` |
| MSW 핸들러 | `src/__tests__/mocks/handlers.ts` |

## 테스트

- **테스트 러너:** Vitest (jsdom 환경)
- **API 모킹:** MSW로 모든 API 엔드포인트 인메모리 핸들링
- **테스트 유틸:** `renderHookWithClient(hook)` — React Query Provider 래핑된 훅 테스트
- **리셋:** 각 테스트 전 `resetDb()`로 MSW 인메모리 DB 초기화

새 API 엔드포인트 추가 시 반드시 `src/__tests__/mocks/handlers.ts`에 MSW 핸들러도 추가한다.

## 언어

- 모든 커밋 메시지, PR 제목/본문, 코드 주석은 **한국어**로 작성한다.
- CLAUDE.md, 설정 파일 등 프로젝트 문서도 한국어를 기본으로 한다.

## Git 컨벤션

### 브랜치 전략 (Git Flow)

- `main` — 프로덕션 배포 브랜치. 직접 커밋하지 않는다.
- `develop` — 개발 통합 브랜치. 모든 작업 브랜치는 여기서 분기하고 여기로 PR을 올린다.
- 작업 브랜치는 반드시 `develop`에서 새로 생성한다.

| Prefix | 용도 | 예시 |
|---|---|---|
| `feat/` 또는 `feature/` | 새 기능 개발 | `feat/profile-edit` |
| `fix/` | 버그 수정 | `fix/cookie-domain` |
| `chore/` | CI, 설정, 문서 등 비기능 작업 | `chore/add-claude-md` |
| `refactor/` | 리팩토링 | `refactor/api-hooks` |

### 작업 흐름

```
1. develop 브랜치에서 새 브랜치 생성
   git checkout develop && git pull origin develop
   git checkout -b feat/기능명

2. 작업 후 커밋 & 푸시
   git add <파일> && git commit -m "feat: 설명"
   git push origin feat/기능명

3. GitHub에서 develop 대상으로 PR 생성

4. 리뷰 & 머지 후, 릴리스 시점에 develop → main 머지
```

**주의사항:**
- 현재 작업 중인 브랜치에 관계없는 변경을 커밋하지 않는다. 별도 작업은 항상 develop에서 새 브랜치를 만들어서 진행한다.
- 하나의 브랜치에는 하나의 주제만 담는다.

### 커밋 메시지

Conventional Commits 형식을 따른다:

```
<type>: <한국어 설명>
```

| Type | 용도 |
|---|---|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `chore` | CI, 설정, 빌드 등 비기능 변경 |
| `refactor` | 리팩토링 (기능 변경 없음) |
| `test` | 테스트 추가/수정 |
| `docs` | 문서 변경 |

- 커밋 메시지의 type은 브랜치 prefix와 일치시킨다 (예: `feat/` 브랜치 → `feat:` 커밋).
- `Co-Authored-By` 트레일러를 추가하지 않는다.

### PR

- 모든 PR의 base 브랜치는 `develop`이다 (`main`이 아님).
- `develop` → `main` 머지는 릴리스 시점에만 수행한다.

## 코드 작성 절차 (TDD)

새 기능 개발 및 버그 수정 시 아래 순서를 따른다:

```
1. 테스트 작성 — 구현 전에 실패하는 테스트를 먼저 작성한다.
2. 테스트 실패 확인 — npm run test 로 테스트가 실패하는지 확인한다.
3. 구현 — 테스트를 통과시키기 위한 최소한의 코드를 작성한다.
4. 테스트 성공 확인 — npm run test 로 모든 테스트가 통과하는지 확인한다.
5. 커밋 & 푸시 — 테스트 통과 후 커밋하고 푸시한다.
6. PR 생성 — develop 대상으로 PR을 올린다.
```
