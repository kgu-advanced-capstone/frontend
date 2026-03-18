"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Brain,
  Sparkles,
  FolderOpen,
  Copy,
  Check,
  ArrowRight,
  Trash2,
  Plus,
  ImagePlus,
  X,
  Save,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useProjects } from "@/contexts/ProjectContext";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { categories } from "@/data/dummy";

interface ProjectRecord {
  role: string;
  background: string;
  tasks: string;
  techStack: string;
  achievements: string;
  troubleshooting: string;
  learned: string;
  images: string[];
}

function generateAiSummary(
  title: string,
  record: ProjectRecord
): string {
  const role = record.role || "개발";
  const parts: string[] = [];

  if (record.background.trim()) {
    parts.push(record.background.trim().split("\n")[0]);
  }

  const taskLines = record.tasks
    .split("\n")
    .filter((l) => l.trim())
    .slice(0, 3)
    .map((l) => l.trim().replace(/^-\s*/, ""));

  const achieveLines = record.achievements
    .split("\n")
    .filter((l) => l.trim())
    .slice(0, 2)
    .map((l) => l.trim().replace(/^-\s*/, ""));

  const bullets: string[] = [];
  if (parts.length > 0) {
    bullets.push(`${parts[0]}를 위한 프로젝트에서 ${role}로 참여`);
  } else {
    bullets.push(`프로젝트에서 ${role} 역할 수행`);
  }
  taskLines.forEach((t) => bullets.push(t));
  achieveLines.forEach((a) => bullets.push(a));

  return `**[${title}] ${role}**\n\n${bullets.map((b) => `- ${b}`).join("\n")}`;
}

const defaultCreateForm = {
  title: "",
  description: "",
  skills: "",
  maxMembers: "4",
  deadline: "",
  category: "웹",
};

const emptyRecord: ProjectRecord = {
  role: "",
  background: "",
  tasks: "",
  techStack: "",
  achievements: "",
  troubleshooting: "",
  learned: "",
  images: [],
};

export default function MyProjectsPage() {
  const {
    joinedProjects,
    createdProjects,
    leaveProject,
    updateMarkdown,
    updateSummary,
    createProject,
  } = useProjects();

  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [editingIds, setEditingIds] = useState<Set<number>>(new Set());
  const [editDrafts, setEditDrafts] = useState<Record<number, string>>({});
  const [records, setRecords] = useState<Record<number, ProjectRecord>>({});
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(defaultCreateForm);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeImageProjectId, setActiveImageProjectId] = useState<number | null>(null);

  const myCreatedIds = new Set(createdProjects.map((p) => p.id));

  const getRecord = (id: number): ProjectRecord => records[id] || emptyRecord;

  const updateRecord = (id: number, field: keyof ProjectRecord, value: string | string[]) => {
    setRecords((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || emptyRecord), [field]: value },
    }));
    // markdown sync for context
    const rec = { ...(records[id] || emptyRecord), [field]: value };
    const md = [
      rec.role && `역할: ${rec.role}`,
      rec.background && `## 프로젝트 배경\n${rec.background}`,
      rec.tasks && `## 담당 업무\n${rec.tasks}`,
      rec.techStack && `## 사용 기술\n${rec.techStack}`,
      rec.achievements && `## 성과\n${rec.achievements}`,
      rec.troubleshooting && `## 문제 해결\n${rec.troubleshooting}`,
      rec.learned && `## 배운 점\n${rec.learned}`,
    ]
      .filter(Boolean)
      .join("\n\n");
    updateMarkdown(id, md);
  };

  const handleImageUpload = (projectId: number, files: FileList | null) => {
    if (!files) return;
    const rec = getRecord(projectId);
    const newImages = [...rec.images];
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      newImages.push(url);
    });
    updateRecord(projectId, "images", newImages);
  };

  const removeImage = (projectId: number, index: number) => {
    const rec = getRecord(projectId);
    const newImages = rec.images.filter((_, i) => i !== index);
    updateRecord(projectId, "images", newImages);
  };

  const handleAiSummarize = async (projectId: number) => {
    const jp = joinedProjects.find((j) => j.project.id === projectId);
    const rec = getRecord(projectId);
    if (!jp) return;

    const hasContent =
      rec.tasks.trim() || rec.achievements.trim() || rec.background.trim();
    if (!hasContent) return;

    setLoadingId(projectId);
    await new Promise((r) => setTimeout(r, 1500));

    const summary = generateAiSummary(jp.project.title, rec);
    updateSummary(projectId, summary);
    setLoadingId(null);
  };

  const handleCopy = async (text: string, id: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = () => {
    if (deleteTarget !== null) {
      leaveProject(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const handleCreateSubmit = () => {
    if (!createForm.title.trim() || !createForm.description.trim()) return;
    createProject({
      title: createForm.title,
      description: createForm.description,
      skills: createForm.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      maxMembers: parseInt(createForm.maxMembers) || 4,
      deadline: createForm.deadline || "미정",
      category: createForm.category,
      author: "나",
    });
    setCreateForm(defaultCreateForm);
    setShowCreate(false);
  };

  const hasContent = (id: number) => {
    const r = getRecord(id);
    return !!(r.tasks.trim() || r.achievements.trim() || r.background.trim());
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">프로젝트 관리</h1>
          <p className="mt-2 text-muted-foreground">
            참여한 프로젝트의 경험을 기록하고 AI로 요약하세요.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} className="mr-2" />
          프로젝트 생성
        </Button>
      </div>

      {joinedProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <FolderOpen size={48} className="text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              참여한 프로젝트가 없습니다
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              프로젝트를 직접 생성하거나, 프로젝트 매칭에서 참가해보세요.
            </p>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => setShowCreate(true)} variant="outline">
                <Plus size={16} className="mr-2" />
                프로젝트 생성
              </Button>
              <Link href="/projects" className={cn(buttonVariants())}>
                프로젝트 둘러보기
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {joinedProjects.map((jp) => {
            const rec = getRecord(jp.project.id);

            return (
              <Card key={jp.project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle>{jp.project.title}</CardTitle>
                        <Badge variant="secondary">{jp.project.category}</Badge>
                        {myCreatedIds.has(jp.project.id) && (
                          <Badge variant="outline">내가 생성</Badge>
                        )}
                        {jp.summary && (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                            요약 완료
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {jp.project.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs font-normal">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">참여일: {jp.joinedAt}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(jp.project.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* 담당 역할 */}
                  <div>
                    <Label className="mb-2 block">담당 역할 *</Label>
                    <Input
                      value={rec.role}
                      onChange={(e) => updateRecord(jp.project.id, "role", e.target.value)}
                      placeholder="예: 프론트엔드 개발, 백엔드 리드, PM 등"
                    />
                  </div>

                  {/* 프로젝트 배경/목표 */}
                  <div>
                    <Label className="mb-2 block">프로젝트 배경 및 목표</Label>
                    <Textarea
                      value={rec.background}
                      onChange={(e) => updateRecord(jp.project.id, "background", e.target.value)}
                      className="min-h-[80px]"
                      placeholder="이 프로젝트를 시작하게 된 배경과 달성하고자 한 목표를 적어주세요."
                    />
                  </div>

                  {/* 담당 업무 */}
                  <div>
                    <Label className="mb-2 block">담당 업무 *</Label>
                    <Textarea
                      value={rec.tasks}
                      onChange={(e) => updateRecord(jp.project.id, "tasks", e.target.value)}
                      className="min-h-[120px]"
                      placeholder={`- API 설계 및 구현 (RESTful, 10+ 엔드포인트)\n- 데이터베이스 스키마 설계 (PostgreSQL)\n- CI/CD 파이프라인 구축 (GitHub Actions)\n- 코드 리뷰 및 팀 기술 가이드 작성`}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      한 줄에 하나씩, 구체적으로 작성하세요. 수치가 있으면 더 좋습니다.
                    </p>
                  </div>

                  {/* 사용 기술 및 선정 이유 */}
                  <div>
                    <Label className="mb-2 block">사용 기술 및 선정 이유</Label>
                    <Textarea
                      value={rec.techStack}
                      onChange={(e) => updateRecord(jp.project.id, "techStack", e.target.value)}
                      className="min-h-[80px]"
                      placeholder={`- React: 컴포넌트 기반 UI 설계에 적합\n- WebSocket: 실시간 양방향 통신 필요\n- Redis: 세션 캐싱으로 응답 속도 개선`}
                    />
                  </div>

                  {/* 성과 및 결과 */}
                  <div>
                    <Label className="mb-2 block">성과 및 결과 *</Label>
                    <Textarea
                      value={rec.achievements}
                      onChange={(e) => updateRecord(jp.project.id, "achievements", e.target.value)}
                      className="min-h-[100px]"
                      placeholder={`- API 응답 시간 평균 200ms → 50ms로 75% 개선\n- 테스트 커버리지 0% → 85% 달성\n- DAU 500명 달성, 사용자 만족도 4.5/5`}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      수치, 비율, before/after 등 정량적으로 기록하면 이력서에서 더 강력합니다.
                    </p>
                  </div>

                  {/* 문제 해결 경험 */}
                  <div>
                    <Label className="mb-2 block">문제 해결 경험 (트러블슈팅)</Label>
                    <Textarea
                      value={rec.troubleshooting}
                      onChange={(e) =>
                        updateRecord(jp.project.id, "troubleshooting", e.target.value)
                      }
                      className="min-h-[80px]"
                      placeholder={`- N+1 쿼리 문제 발견 → DataLoader 패턴 적용으로 해결\n- 메모리 누수 이슈 → useEffect cleanup 정리로 해결`}
                    />
                  </div>

                  {/* 배운 점 */}
                  <div>
                    <Label className="mb-2 block">배운 점 / 회고</Label>
                    <Textarea
                      value={rec.learned}
                      onChange={(e) => updateRecord(jp.project.id, "learned", e.target.value)}
                      className="min-h-[60px]"
                      placeholder="이 프로젝트를 통해 배운 점, 아쉬운 점, 다음에 개선하고 싶은 점 등"
                    />
                  </div>

                  {/* 이미지 업로드 */}
                  <div>
                    <Label className="mb-2 block">스크린샷 / 결과물 이미지</Label>
                    <div className="flex flex-wrap gap-3">
                      {rec.images.map((img, idx) => (
                        <div key={idx} className="group relative h-24 w-24 rounded-lg border overflow-hidden">
                          <Image
                            src={img}
                            alt={`screenshot-${idx}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() => removeImage(jp.project.id, idx)}
                            className="absolute top-1 right-1 hidden rounded-full bg-black/60 p-0.5 text-white group-hover:block"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setActiveImageProjectId(jp.project.id);
                          fileInputRef.current?.click();
                        }}
                        className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground/50 transition-colors hover:border-primary/50 hover:text-primary/50"
                      >
                        <ImagePlus size={20} />
                        <span className="text-[10px]">추가</span>
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (activeImageProjectId !== null) {
                          handleImageUpload(activeImageProjectId, e.target.files);
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>

                  <Separator />

                  {/* AI 요약 버튼 */}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleAiSummarize(jp.project.id)}
                      disabled={loadingId === jp.project.id || !hasContent(jp.project.id)}
                    >
                      {loadingId === jp.project.id ? (
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
                    {!hasContent(jp.project.id) && (
                      <span className="text-xs text-muted-foreground">
                        담당 업무 또는 성과를 기록해야 AI 요약이 가능합니다
                      </span>
                    )}
                  </div>

                  {/* AI 요약 결과 */}
                  {jp.summary && (
                    <div className="rounded-lg border bg-primary/5 p-6">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                          <Sparkles size={16} />
                          AI 요약 결과
                        </div>
                        <div className="flex items-center gap-1">
                          {editingIds.has(jp.project.id) ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                updateSummary(
                                  jp.project.id,
                                  editDrafts[jp.project.id] ?? jp.summary!
                                );
                                setEditingIds((prev) => {
                                  const next = new Set(prev);
                                  next.delete(jp.project.id);
                                  return next;
                                });
                                setSavedId(jp.project.id);
                                setTimeout(() => setSavedId(null), 2000);
                              }}
                            >
                              <Save size={14} className="mr-1" />
                              저장
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditDrafts((prev) => ({
                                  ...prev,
                                  [jp.project.id]: jp.summary!,
                                }));
                                setEditingIds((prev) =>
                                  new Set(prev).add(jp.project.id)
                                );
                              }}
                            >
                              <Pencil size={14} className="mr-1" />
                              첨삭
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(jp.summary!, jp.project.id)}
                          >
                            {copiedId === jp.project.id ? (
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
                      </div>
                      {editingIds.has(jp.project.id) ? (
                        <Textarea
                          value={editDrafts[jp.project.id] ?? jp.summary!}
                          onChange={(e) =>
                            setEditDrafts((prev) => ({
                              ...prev,
                              [jp.project.id]: e.target.value,
                            }))
                          }
                          className="min-h-[150px] font-mono text-sm bg-white"
                        />
                      ) : (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {jp.summary}
                          {savedId === jp.project.id && (
                            <p className="mt-3 flex items-center gap-1 text-xs text-green-600">
                              <Check size={12} />
                              저장되었습니다
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 프로젝트 생성 모달 */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>새 프로젝트 생성</DialogTitle>
            <DialogDescription>
              새로운 프로젝트를 생성하고 팀원을 모집하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-2 block">프로젝트명</Label>
              <Input
                value={createForm.title}
                onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="프로젝트 이름을 입력하세요"
              />
            </div>
            <div>
              <Label className="mb-2 block">설명</Label>
              <Textarea
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="프로젝트에 대해 간단히 설명해주세요"
                className="min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">카테고리</Label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))}
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
                >
                  {categories
                    .filter((c) => c !== "전체")
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <Label className="mb-2 block">최대 인원</Label>
                <Input
                  type="number"
                  min={2}
                  max={10}
                  value={createForm.maxMembers}
                  onChange={(e) => setCreateForm((f) => ({ ...f, maxMembers: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label className="mb-2 block">기술 스택 (쉼표로 구분)</Label>
              <Input
                value={createForm.skills}
                onChange={(e) => setCreateForm((f) => ({ ...f, skills: e.target.value }))}
                placeholder="React, TypeScript, Node.js"
              />
            </div>
            <div>
              <Label className="mb-2 block">마감일</Label>
              <Input
                type="date"
                value={createForm.deadline}
                onChange={(e) => setCreateForm((f) => ({ ...f, deadline: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              취소
            </Button>
            <Button
              onClick={handleCreateSubmit}
              disabled={!createForm.title.trim() || !createForm.description.trim()}
            >
              생성하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 모달 */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로젝트 탈퇴</DialogTitle>
            <DialogDescription>
              정말 이 프로젝트에서 탈퇴하시겠습니까? 기록한 경험과 AI 요약
              결과가 모두 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              탈퇴
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
