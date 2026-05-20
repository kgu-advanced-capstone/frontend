"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
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
  User,
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
import { Skeleton } from "@/components/ui/skeleton";
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
import * as projectApi from "@/api/generated/project/project";
import * as experienceApi from "@/api/generated/experience/experience";
import type { ProjectStatus } from "@/api/types";
import { AiSummaryStatusResponseStatus } from "@/api/types";

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
  maxMembers: "4",
  deadline: "",
  category: "웹",
};

function MyProjectsSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="내 프로젝트 불러오는 중"
    >
      {[0, 1].map((card) => (
        <Card key={card}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-6 w-44" />
                  <Skeleton className="h-5 w-16 rounded-4xl" />
                  <Skeleton className="h-5 w-14 rounded-4xl" />
                  <Skeleton className="h-5 w-20 rounded-4xl" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Skeleton className="h-5 w-16 rounded-4xl" />
                  <Skeleton className="h-5 w-20 rounded-4xl" />
                  <Skeleton className="h-5 w-14 rounded-4xl" />
                </div>
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-4 w-56" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** 개별 프로젝트의 경험 기록 섹션 */
function ExperienceSection({ projectId }: { projectId: number }) {
  const { data: experiences = [] } = experienceApi.useGetByProject(projectId, {
    query: {
      select: (res) => res.data,
    }
  });
  const upsertMutation = experienceApi.useUpsert();
  const startSummarizeMutation = experienceApi.useStartSummarize();

  const existing = experiences[0];
  const [content, setContent] = useState(existing?.content ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [savedSummary, setSavedSummary] = useState(false);
  const [pollingExpId, setPollingExpId] = useState<number | null>(null);

  const { data: summaryStatus } = experienceApi.useGetSummaryStatus(
    pollingExpId ?? 0,
    {
      query: {
        enabled: pollingExpId !== null,
        refetchInterval: (query) => {
          const status = (query.state.data as { data?: { status?: string } } | undefined)?.data?.status;
          if (status === AiSummaryStatusResponseStatus.COMPLETED || status === AiSummaryStatusResponseStatus.FAILED) return false;
          return 2000;
        },
        select: (res) => res.data,
      },
    }
  );

  const pollingDone =
    summaryStatus?.status === AiSummaryStatusResponseStatus.COMPLETED ||
    summaryStatus?.status === AiSummaryStatusResponseStatus.FAILED;

  const isSummarizing =
    startSummarizeMutation.isPending || (pollingExpId !== null && !pollingDone);

  // 경험 내용이 로드되면 content 동기화
  const currentContent = existing?.content ?? "";
  if (currentContent && !content && !upsertMutation.isSuccess) {
    setContent(currentContent);
  }

  const handleSaveExperience = () => {
    if (!content.trim()) return;
    upsertMutation.mutate({ projectId, data: { content } });
  };

  const handleSummarize = () => {
    if (!existing || typeof existing.id === 'undefined') return;
    startSummarizeMutation.mutate(
      { id: existing.id },
      { onSuccess: () => setPollingExpId(existing.id!) }
    );
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
          disabled={!existing || isSummarizing}
        >
          {isSummarizing ? (
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
      {(existing?.aiSummary || summaryStatus?.aiSummary) && (
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
                    upsertMutation.mutate({ projectId, data: { content: editDraft } });
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
                      summaryStatus?.aiSummary ?? existing?.aiSummary ?? ""
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
                    summaryStatus?.aiSummary ?? existing?.aiSummary ?? ""
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
              {summaryStatus?.aiSummary ?? existing?.aiSummary}
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
  const { data: myProjects = [], isLoading } = projectApi.useGetMyProjects({
    query: {
      select: (res) => res.data,
      refetchInterval: (query) => {
        const payload = query.state.data as
          | Array<{ project?: { skillExtractionStatus?: string } }>
          | { data?: Array<{ project?: { skillExtractionStatus?: string } }> }
          | undefined;
        const items = Array.isArray(payload) ? payload : payload?.data;
        const hasPending = items?.some(
          (mp) => mp.project?.skillExtractionStatus === "IN_PROGRESS"
        );
        return hasPending ? 2000 : false;
      },
    }
  });
  const createMutation = projectApi.useCreateProject();
  const statusMutation = projectApi.useUpdateStatus();

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(defaultCreateForm);
  const queryClient = useQueryClient();

  const handleCreateSubmit = () => {
    if (!createForm.title.trim()) return;
    createMutation.mutate(
      {
        data: {
          title: createForm.title,
          description: createForm.description || undefined,
          maxMembers: parseInt(createForm.maxMembers) || 4,
          deadline: createForm.deadline || undefined,
          category: createForm.category,
        }
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          setCreateForm(defaultCreateForm);
          queryClient.invalidateQueries({ queryKey: projectApi.getGetMyProjectsQueryKey() });
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
        <MyProjectsSkeleton />
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
            const currentStatus = mp.status || "recruiting";
            const status = statusConfig[currentStatus];
            const StatusIcon = status.icon;
            const canRecord = currentStatus !== "recruiting";
            const next = nextStatus[currentStatus];
            const isSkillExtractionInProgress = mp.project?.skillExtractionStatus === "IN_PROGRESS";

            return (
              <Card key={mp.project?.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle>{mp.project?.title}</CardTitle>
                        <Badge className={status.color}>
                          <StatusIcon size={12} className="mr-1" />
                          {status.label}
                        </Badge>
                        <Badge variant="secondary">{mp.project?.category}</Badge>
                        {mp.isOwner && (
                          <Badge variant="outline">내가 생성</Badge>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {isSkillExtractionInProgress ? (
                          <>
                            <Skeleton className="h-5 w-16 rounded-4xl" />
                            <Skeleton className="h-5 w-20 rounded-4xl" />
                            <Skeleton className="h-5 w-14 rounded-4xl" />
                            <span className="sr-only">AI가 기술 스택을 분석 중입니다...</span>
                          </>
                        ) : (
                          mp.project?.skills?.map((skill) => (
                            <Badge key={skill as string} variant="outline" className="text-xs font-normal">
                              {skill as string}
                            </Badge>
                          ))
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">참여일: {mp.joinedAt}</p>
                      {(mp.project?.participants?.length ?? 0) > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">
                            참여자 ({mp.project!.participants!.length}/{mp.project?.maxMembers ?? 0})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {mp.project!.participants!.map((p) => (
                              <div key={p.userId} className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-xs">
                                {p.profileImage ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={p.profileImage} alt={p.name ?? ""} className="h-4 w-4 rounded-full object-cover" />
                                ) : (
                                  <User size={12} className="text-muted-foreground" />
                                )}
                                <span>{p.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {mp.isOwner && next && mp.project?.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={statusMutation.isPending}
                        onClick={() =>
                          statusMutation.mutate({ id: mp.project!.id!, data: { status: next } })
                        }
                      >
                        {nextStatusLabel[currentStatus]}
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
                      {mp.project?.deadline && (
                        <p className="mt-3 text-xs text-amber-500">마감일: {mp.project.deadline}</p>
                      )}
                    </div>
                  ) : (
                    <ExperienceSection projectId={mp.project?.id || 0} />
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
              새로운 프로젝트를 생성하고 팀원을 모집하세요. 기술 스택은 설명을 바탕으로 AI가 자동 추출합니다.
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
                placeholder="프로젝트에 대해 간단히 설명해주세요. 설명에 포함된 기술명을 바탕으로 AI가 기술 스택을 추출합니다."
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
