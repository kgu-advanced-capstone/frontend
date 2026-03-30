"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain,
  Sparkles,
  FolderOpen,
  Copy,
  Check,
  ArrowRight,
  Plus,
  Save,
  Pencil,
  Users,
  Clock,
  Play,
  CheckCircle,
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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { categories } from "@/data/dummy";
import type { ProjectStatus } from "@/api/types";
import {
  useMyProjects,
  useCreateProject,
  useUpdateProjectStatus,
} from "@/api/hooks/useProjects";
import {
  useExperiences,
  useUpsertExperience,
  useSummarizeExperience,
} from "@/api/hooks/useExperiences";

const statusConfig: Record<ProjectStatus, { label: string; color: string; icon: typeof Clock }> = {
  recruiting: {
    label: "매칭중",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: Users,
  },
  "in-progress": {
    label: "진행",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: Play,
  },
  completed: {
    label: "완료",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    icon: CheckCircle,
  },
};

const nextStatus: Record<ProjectStatus, ProjectStatus | null> = {
  recruiting: "in-progress",
  "in-progress": "completed",
  completed: null,
};

const nextStatusLabel: Record<ProjectStatus, string> = {
  recruiting: "진행으로 변경",
  "in-progress": "완료로 변경",
  completed: "",
};

const defaultCreateForm = {
  title: "",
  description: "",
  skills: "",
  maxMembers: "4",
  deadline: "",
  category: "웹",
};

/** 개별 프로젝트의 경험 기록 섹션 */
function ExperienceSection({ projectId }: { projectId: number }) {
  const { data: experiences = [] } = useExperiences(projectId);
  const upsertMutation = useUpsertExperience(projectId);
  const summarizeMutation = useSummarizeExperience();

  const existing = experiences[0];
  const [content, setContent] = useState(existing?.content ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [savedSummary, setSavedSummary] = useState(false);

  // 경험 내용이 로드되면 content 동기화
  const currentContent = existing?.content ?? "";
  if (currentContent && !content && !upsertMutation.isSuccess) {
    setContent(currentContent);
  }

  const handleSaveExperience = () => {
    if (!content.trim()) return;
    upsertMutation.mutate({ content });
  };

  const handleSummarize = () => {
    if (!existing) return;
    summarizeMutation.mutate(existing.id);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* 경험 기록 입력 */}
      <div>
        <Label className="mb-2 block">경험 기록 *</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px]"
          placeholder={`담당 역할, 주요 업무, 기술 스택, 성과 등을 자유롭게 기록하세요.\n\n예시:\n- 역할: 프론트엔드 개발\n- React 컴포넌트 설계 및 API 연동\n- API 응답 시간 75% 개선\n- 테스트 커버리지 85% 달성`}
        />
        <div className="mt-2 flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSaveExperience}
            disabled={!content.trim() || upsertMutation.isPending}
          >
            {upsertMutation.isPending ? "저장 중..." : "경험 저장"}
          </Button>
          {upsertMutation.isSuccess && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <Check size={12} /> 저장됨
            </span>
          )}
        </div>
      </div>

      <Separator />

      {/* AI 요약 버튼 */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSummarize}
          disabled={!existing || summarizeMutation.isPending}
        >
          {summarizeMutation.isPending ? (
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
        {!existing && (
          <span className="text-xs text-muted-foreground">
            경험을 먼저 저장해야 AI 요약이 가능합니다
          </span>
        )}
      </div>

      {/* AI 요약 결과 */}
      {(existing?.aiSummary || summarizeMutation.data?.aiSummary) && (
        <div className="rounded-lg border bg-primary/5 p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles size={16} />
              AI 요약 결과
            </div>
            <div className="flex items-center gap-1">
              {isEditing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // 첨삭 저장 — 수정된 내용을 경험으로 다시 저장
                    upsertMutation.mutate({ content: editDraft });
                    setIsEditing(false);
                    setSavedSummary(true);
                    setTimeout(() => setSavedSummary(false), 2000);
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
                    setEditDraft(
                      summarizeMutation.data?.aiSummary ?? existing?.aiSummary ?? ""
                    );
                    setIsEditing(true);
                  }}
                >
                  <Pencil size={14} className="mr-1" />
                  첨삭
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleCopy(
                    summarizeMutation.data?.aiSummary ?? existing?.aiSummary ?? ""
                  )
                }
              >
                {copiedId ? (
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
          {isEditing ? (
            <Textarea
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              className="min-h-[150px] font-mono text-sm bg-white"
            />
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {summarizeMutation.data?.aiSummary ?? existing?.aiSummary}
              {savedSummary && (
                <p className="mt-3 flex items-center gap-1 text-xs text-green-600">
                  <Check size={12} />
                  저장되었습니다
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyProjectsPage() {
  const { data: myProjects = [], isLoading } = useMyProjects();
  const createMutation = useCreateProject();
  const statusMutation = useUpdateProjectStatus();

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(defaultCreateForm);

  const handleCreateSubmit = () => {
    if (!createForm.title.trim()) return;
    createMutation.mutate(
      {
        title: createForm.title,
        description: createForm.description || undefined,
        skills: createForm.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        maxMembers: parseInt(createForm.maxMembers) || 4,
        deadline: createForm.deadline || undefined,
        category: createForm.category,
      },
      {
        onSuccess: () => {
          setCreateForm(defaultCreateForm);
          setShowCreate(false);
        },
      }
    );
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

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      ) : myProjects.length === 0 ? (
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
          {myProjects.map((mp) => {
            const status = statusConfig[mp.status];
            const StatusIcon = status.icon;
            const canRecord = mp.status !== "recruiting";
            const next = nextStatus[mp.status];

            return (
              <Card key={mp.project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle>{mp.project.title}</CardTitle>
                        <Badge className={status.color}>
                          <StatusIcon size={12} className="mr-1" />
                          {status.label}
                        </Badge>
                        <Badge variant="secondary">{mp.project.category}</Badge>
                        {mp.isOwner && (
                          <Badge variant="outline">내가 생성</Badge>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {mp.project.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs font-normal">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">참여일: {mp.joinedAt}</p>
                    </div>
                    {mp.isOwner && next && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={statusMutation.isPending}
                        onClick={() =>
                          statusMutation.mutate({ id: mp.project.id, status: next })
                        }
                      >
                        {nextStatusLabel[mp.status]}
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {!canRecord ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
                      <Users size={32} className="mx-auto mb-3 text-amber-500" />
                      <p className="font-medium text-amber-800">
                        팀원 모집 중입니다
                      </p>
                      <p className="mt-1 text-sm text-amber-600">
                        매칭이 완료되어 프로젝트가 &quot;진행&quot; 상태로 변경되면 경험 기록을 작성할 수 있습니다.
                      </p>
                      <p className="mt-3 text-xs text-amber-500">
                        현재 {mp.project.currentMembers}/{mp.project.maxMembers}명 참여 중
                        {mp.project.deadline && ` · 마감일: ${mp.project.deadline}`}
                      </p>
                    </div>
                  ) : (
                    <ExperienceSection projectId={mp.project.id} />
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
              disabled={!createForm.title.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? "생성 중..." : "생성하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
