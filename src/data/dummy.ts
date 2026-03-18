export interface Project {
  id: number;
  title: string;
  description: string;
  skills: string[];
  currentMembers: number;
  maxMembers: number;
  deadline: string;
  category: string;
  author: string;
  createdAt: string;
}

export interface ResumeProject {
  id: number;
  projectId: number;
  title: string;
  role: string;
  period: string;
  markdown: string;
  summary?: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "AI 기반 헬스케어 모바일 앱",
    description: "사용자의 건강 데이터를 분석하여 맞춤형 운동·식단을 추천하는 모바일 앱을 개발합니다.",
    skills: ["React Native", "Python", "TensorFlow"],
    currentMembers: 3,
    maxMembers: 5,
    deadline: "2026-04-15",
    category: "모바일",
    author: "김지현",
    createdAt: "2026-03-10",
  },
  {
    id: 2,
    title: "실시간 협업 화이트보드 서비스",
    description: "WebSocket 기반의 실시간 협업 화이트보드. 팀원들과 동시에 그림을 그리고 메모를 남길 수 있습니다.",
    skills: ["Next.js", "Socket.io", "Canvas API"],
    currentMembers: 4,
    maxMembers: 4,
    deadline: "2026-04-01",
    category: "웹",
    author: "박서준",
    createdAt: "2026-03-08",
  },
  {
    id: 3,
    title: "중고 거래 플랫폼 리디자인",
    description: "기존 중고 거래 앱의 UX를 개선하고 새로운 디자인 시스템을 구축합니다.",
    skills: ["Figma", "React", "TypeScript"],
    currentMembers: 2,
    maxMembers: 6,
    deadline: "2026-05-01",
    category: "웹",
    author: "이수민",
    createdAt: "2026-03-12",
  },
  {
    id: 4,
    title: "블록체인 기반 투표 시스템",
    description: "투명하고 위변조 불가능한 온라인 투표 시스템을 블록체인으로 구현합니다.",
    skills: ["Solidity", "React", "Node.js"],
    currentMembers: 3,
    maxMembers: 5,
    deadline: "2026-05-15",
    category: "블록체인",
    author: "정민우",
    createdAt: "2026-03-05",
  },
  {
    id: 5,
    title: "개발자 포트폴리오 빌더",
    description: "GitHub 프로필과 연동하여 자동으로 포트폴리오 웹사이트를 생성해주는 서비스입니다.",
    skills: ["Next.js", "GitHub API", "Tailwind CSS"],
    currentMembers: 1,
    maxMembers: 4,
    deadline: "2026-04-20",
    category: "웹",
    author: "한소희",
    createdAt: "2026-03-14",
  },
  {
    id: 6,
    title: "음성 인식 회의록 자동 생성기",
    description: "회의 내용을 실시간으로 텍스트로 변환하고 핵심 내용을 자동 요약합니다.",
    skills: ["Python", "Whisper", "FastAPI", "React"],
    currentMembers: 2,
    maxMembers: 5,
    deadline: "2026-04-30",
    category: "AI/ML",
    author: "오태현",
    createdAt: "2026-03-11",
  },
  {
    id: 7,
    title: "반려동물 돌봄 매칭 서비스",
    description: "반려동물 주인과 돌봄 서비스 제공자를 연결해주는 위치 기반 매칭 플랫폼입니다.",
    skills: ["Flutter", "Firebase", "Google Maps API"],
    currentMembers: 3,
    maxMembers: 4,
    deadline: "2026-04-10",
    category: "모바일",
    author: "최예린",
    createdAt: "2026-03-09",
  },
  {
    id: 8,
    title: "데이터 시각화 대시보드",
    description: "공공 데이터를 활용한 인터랙티브 데이터 시각화 대시보드를 개발합니다.",
    skills: ["D3.js", "React", "Python", "PostgreSQL"],
    currentMembers: 2,
    maxMembers: 5,
    deadline: "2026-05-10",
    category: "데이터",
    author: "강동원",
    createdAt: "2026-03-13",
  },
  {
    id: 9,
    title: "LLM 기반 코드 리뷰 봇",
    description: "PR이 올라오면 자동으로 코드 리뷰를 수행하고 개선 사항을 제안하는 봇입니다.",
    skills: ["Python", "LangChain", "GitHub Actions"],
    currentMembers: 1,
    maxMembers: 3,
    deadline: "2026-04-25",
    category: "AI/ML",
    author: "윤성호",
    createdAt: "2026-03-15",
  },
  {
    id: 10,
    title: "온라인 스터디 타이머 앱",
    description: "친구들과 함께 공부 시간을 측정하고 서로 동기부여할 수 있는 소셜 스터디 앱입니다.",
    skills: ["React", "WebRTC", "Node.js"],
    currentMembers: 4,
    maxMembers: 4,
    deadline: "2026-03-30",
    category: "웹",
    author: "임수진",
    createdAt: "2026-03-06",
  },
  {
    id: 11,
    title: "ESG 리포트 자동화 도구",
    description: "기업의 ESG 데이터를 수집하여 리포트를 자동으로 생성하는 B2B SaaS를 만듭니다.",
    skills: ["Next.js", "Python", "AWS Lambda"],
    currentMembers: 2,
    maxMembers: 6,
    deadline: "2026-05-20",
    category: "웹",
    author: "배진영",
    createdAt: "2026-03-07",
  },
  {
    id: 12,
    title: "AR 실내 인테리어 시뮬레이터",
    description: "AR 기술로 가구를 실제 공간에 배치해볼 수 있는 인테리어 시뮬레이션 앱입니다.",
    skills: ["Unity", "ARKit", "C#", "Blender"],
    currentMembers: 2,
    maxMembers: 4,
    deadline: "2026-05-30",
    category: "AR/VR",
    author: "노현우",
    createdAt: "2026-03-16",
  },
  {
    id: 13,
    title: "소셜 레시피 공유 플랫폼",
    description: "사용자들이 레시피를 공유하고 요리 과정을 숏폼 영상으로 기록하는 커뮤니티입니다.",
    skills: ["React Native", "Node.js", "MongoDB", "FFmpeg"],
    currentMembers: 3,
    maxMembers: 5,
    deadline: "2026-04-28",
    category: "모바일",
    author: "신다은",
    createdAt: "2026-03-04",
  },
  {
    id: 14,
    title: "자동 자막 생성 영상 편집기",
    description: "영상에서 음성을 인식하여 자동으로 자막을 생성하고 편집할 수 있는 웹 기반 에디터입니다.",
    skills: ["React", "FFmpeg.wasm", "Whisper", "TypeScript"],
    currentMembers: 1,
    maxMembers: 4,
    deadline: "2026-05-05",
    category: "AI/ML",
    author: "조현서",
    createdAt: "2026-03-17",
  },
  {
    id: 15,
    title: "게이미피케이션 습관 트래커",
    description: "습관 형성을 게임처럼 재미있게 만드는 앱. 캐릭터 성장, 퀘스트, 길드 시스템을 포함합니다.",
    skills: ["Flutter", "Firebase", "Dart"],
    currentMembers: 2,
    maxMembers: 5,
    deadline: "2026-04-18",
    category: "모바일",
    author: "유하은",
    createdAt: "2026-03-03",
  },
  {
    id: 16,
    title: "AI 면접 코칭 플랫폼",
    description: "AI가 면접관이 되어 실전 면접을 연습하고 피드백을 제공하는 서비스입니다.",
    skills: ["Next.js", "OpenAI API", "WebRTC"],
    currentMembers: 2,
    maxMembers: 4,
    deadline: "2026-05-12",
    category: "AI/ML",
    author: "송민재",
    createdAt: "2026-03-18",
  },
  {
    id: 17,
    title: "오픈소스 번역 관리 도구",
    description: "다국어 프로젝트의 번역 파일을 관리하고 협업할 수 있는 오픈소스 도구입니다.",
    skills: ["Vue.js", "Go", "PostgreSQL"],
    currentMembers: 1,
    maxMembers: 3,
    deadline: "2026-04-22",
    category: "웹",
    author: "문지원",
    createdAt: "2026-03-02",
  },
  {
    id: 18,
    title: "IoT 스마트 홈 대시보드",
    description: "가정 내 IoT 기기를 통합 관리하고 자동화 규칙을 설정할 수 있는 대시보드입니다.",
    skills: ["React", "MQTT", "Raspberry Pi", "Python"],
    currentMembers: 3,
    maxMembers: 5,
    deadline: "2026-05-08",
    category: "IoT",
    author: "황도윤",
    createdAt: "2026-03-01",
  },
];

export const myProjects: ResumeProject[] = [
  {
    id: 1,
    projectId: 2,
    title: "실시간 협업 화이트보드 서비스",
    role: "프론트엔드 개발",
    period: "2026.01 - 2026.03",
    markdown: `## 프로젝트 개요
WebSocket 기반의 실시간 협업 화이트보드 서비스 개발

## 담당 업무
- Canvas API를 활용한 드로잉 엔진 개발
- Socket.io를 이용한 실시간 동기화 구현
- 무한 캔버스 및 줌/팬 기능 구현
- 실시간 커서 위치 공유 기능 개발

## 기술적 성과
- Canvas 렌더링 최적화로 60fps 유지
- WebSocket 메시지 압축으로 네트워크 사용량 40% 절감
- Undo/Redo 히스토리 관리 시스템 설계`,
  },
  {
    id: 2,
    projectId: 10,
    title: "온라인 스터디 타이머 앱",
    role: "풀스택 개발",
    period: "2025.11 - 2026.02",
    markdown: `## 프로젝트 개요
친구들과 함께 공부 시간을 측정하고 서로 동기부여할 수 있는 소셜 스터디 앱

## 담당 업무
- React 기반 프론트엔드 개발
- WebRTC를 활용한 실시간 캠 공유 기능
- Node.js 백엔드 API 설계 및 개발
- 타이머 동기화 로직 구현

## 기술적 성과
- WebRTC 시그널링 서버 최적화로 연결 시간 2초 이내 달성
- 동시 접속자 100명 이상 처리 가능한 구조 설계
- PWA 적용으로 모바일 사용성 확보`,
  },
];

export const categories = ["전체", "웹", "모바일", "AI/ML", "데이터", "블록체인", "AR/VR", "IoT"];
