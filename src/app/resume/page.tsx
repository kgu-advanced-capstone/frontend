"use client";

import { useState } from "react";
import { Brain, Sparkles, FileText, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { myProjects, type ResumeProject } from "@/data/dummy";

const aiSummaries: Record<number, string> = {
  1: `**[실시간 협업 화이트보드 서비스] 프론트엔드 개발** (2026.01 - 2026.03)

- WebSocket 기반 실시간 협업 화이트보드의 프론트엔드를 담당하여, Canvas API 드로잉 엔진과 Socket.io 실시간 동기화 시스템을 설계·구현
- Canvas 렌더링 파이프라인 최적화를 통해 복잡한 드로잉 상황에서도 **60fps를 안정적으로 유지**, WebSocket 메시지 압축 적용으로 **네트워크 사용량 40% 절감**
- 무한 캔버스(줌/팬), 실시간 커서 공유, Undo/Redo 히스토리 관리 등 핵심 인터랙션 기능을 독립적으로 설계하여 사용자 경험 향상에 기여`,

  2: `**[온라인 스터디 타이머 앱] 풀스택 개발** (2025.11 - 2026.02)

- 소셜 스터디 앱의 프론트엔드(React)와 백엔드(Node.js)를 모두 담당하여, WebRTC 기반 실시간 캠 공유 및 타이머 동기화 기능을 구현
- WebRTC 시그널링 서버 최적화로 **P2P 연결 시간을 2초 이내로 단축**, 동시 접속자 100명 이상을 안정적으로 처리할 수 있는 서버 아키텍처 설계
- PWA 기술 적용으로 모바일 환경에서의 접근성을 확보하고, 앱 설치 없이도 네이티브에 가까운 사용자 경험을 제공`,
};

export default function ResumePage() {
  const [projectData, setProjectData] = useState<ResumeProject[]>(myProjects);
  const [summaries, setSummaries] = useState<Record<number, string>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleMarkdownChange = (id: number, value: string) => {
    setProjectData((prev) =>
      prev.map((p) => (p.id === id ? { ...p, markdown: value } : p))
    );
  };

  const handleAiSummarize = async (id: number) => {
    setLoadingId(id);
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSummaries((prev) => ({
      ...prev,
      [id]: aiSummaries[id] || "AI 요약 결과가 여기에 표시됩니다.",
    }));
    setLoadingId(null);
  };

  const handleCopy = async (text: string, id: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI 이력서</h1>
            <p className="text-muted-foreground">
              프로젝트 경험을 기록하고, AI가 이력서에 최적화된 형태로
              정리해드립니다.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="projects" className="space-y-8">
        <TabsList>
          <TabsTrigger value="projects">참여 프로젝트</TabsTrigger>
          <TabsTrigger value="preview">이력서 미리보기</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          {projectData.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{project.title}</CardTitle>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary">{project.role}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {project.period}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleAiSummarize(project.id)}
                    disabled={loadingId === project.id}
                    size="sm"
                  >
                    {loadingId === project.id ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        요약 중...
                      </>
                    ) : (
                      <>
                        <Brain size={16} className="mr-2" />
                        AI 요약
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    프로젝트 경험 기록 (마크다운)
                  </label>
                  <Textarea
                    value={project.markdown}
                    onChange={(e) =>
                      handleMarkdownChange(project.id, e.target.value)
                    }
                    className="min-h-[200px] font-mono text-sm"
                    placeholder="프로젝트에서 수행한 업무, 기술적 성과 등을 마크다운으로 기록하세요..."
                  />
                </div>

                {summaries[project.id] && (
                  <div className="rounded-lg border bg-primary/5 p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <Sparkles size={16} />
                        AI 요약 결과
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleCopy(summaries[project.id], project.id)
                        }
                      >
                        {copiedId === project.id ? (
                          <>
                            <Check size={14} className="mr-1" />
                            복사됨
                          </>
                        ) : (
                          <>
                            <Copy size={14} className="mr-1" />
                            복사
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {summaries[project.id]}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                이력서 미리보기
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h2 className="text-xl font-bold">홍길동</h2>
                <p className="text-muted-foreground">
                  프론트엔드 개발자 · buildi@example.com
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 text-lg font-semibold">자기소개</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  사용자 경험을 최우선으로 생각하는 프론트엔드 개발자입니다.
                  실시간 협업 도구와 인터랙티브 웹 애플리케이션 개발에 관심이
                  많으며, 성능 최적화와 클린 코드를 추구합니다.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 text-lg font-semibold">프로젝트 경험</h3>
                <div className="space-y-6">
                  {projectData.map((project) => (
                    <div key={project.id}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{project.title}</h4>
                        <span className="text-sm text-muted-foreground">
                          {project.period}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-primary">
                        {project.role}
                      </p>
                      <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                        {summaries[project.id] || (
                          <span className="italic">
                            AI 요약을 실행하면 이력서에 최적화된 내용이
                            자동으로 반영됩니다.
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 text-lg font-semibold">기술 스택</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "React",
                    "Next.js",
                    "TypeScript",
                    "Node.js",
                    "WebSocket",
                    "WebRTC",
                    "Canvas API",
                    "Tailwind CSS",
                  ].map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
