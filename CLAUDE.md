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

# API 훅 생성 (Swagger 기반)
npm run api:generate
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
| HTTP 클라이언트 | Axios (Orval 자동 생성 훅 사용) |
| 자동 생성 | Orval (OpenAPI 3.1) |

### 디렉토리 구조

```
src/
├── app/                  ← Next.js App Router 페이지
├── api/                  ← API 클라이언트 및 Orval 생성 코드
│   ├── client.ts         ← Axios 인스턴스 (baseURL: "", withCredentials: true)
│   ├── generated/        ← Orval 자동 생성 훅 및 모델 (수정 금지)
│   ├── mutator/          ← Orval 커스텀 Axios mutator
│   └── types.ts          ← 생성된 모델 export
├── components/           ← 공용 컴포넌트
├── contexts/             ← React Context (AuthContext 등)
```

### API 사용 패턴

자동 생성된 Orval 훅을 직접 사용한다. 모든 훅은 `{ data, status, headers }` 형태의 객체를 반환하므로, `select` 옵션을 사용하여 필요한 데이터만 추출하는 것을 권장한다.

```typescript
import * as profileApi from "@/api/generated/profile/profile";

// 조회: useQuery
const { data: profile } = profileApi.useGetProfile({
  query: {
    select: (res) => res.data,
  }
});

// 변경: useMutation
const updateMutation = profileApi.useUpdateProfile();
updateMutation.mutate({
  data: { name: "새 이름" } // body 데이터는 data 필드에 전달
});
```

## 코드 배치 규칙

| 대상 | 위치 |
|---|---|
| 새 페이지 | `src/app/<route>/page.tsx` |
| API 훅 (자동 생성) | `src/api/generated/` (수정 금지) |
| 커스텀 API 로직 | `src/api/` (필요시 추가) |
| 공용 컴포넌트 | `src/components/` |
| Shadcn UI 컴포넌트 | `src/components/ui/` |
| React Context | `src/contexts/` |
| 테스트 | `src/__tests__/` |

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
