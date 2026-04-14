"use client";

import { useState, useRef, useEffect } from "react";
import { Search, CheckCircle, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ProjectCard from "@/components/ProjectCard";
import { categories } from "@/data/dummy";
import * as projectApi from "@/api/generated/project/project";
import { useTrack } from "@/hooks/useTrack";

export default function ProjectsPage() {
  const [category, setCategory] = useState("전체");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [confirmProject, setConfirmProject] = useState<{ id: number; title: string } | null>(null);
  const [joinedProject, setJoinedProject] = useState<string | null>(null);
  const { track } = useTrack();
  const searchTrackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (searchTrackTimer.current) clearTimeout(searchTrackTimer.current);
    };
  }, []);

  const { data, isLoading } = projectApi.useGetProjects({
    category: category === "전체" ? undefined : category,
    search: search || undefined,
    page,
    limit: 12,
  }, {
    query: {
      select: (res) => res.data,
    }
  });

  const { data: myProjects } = projectApi.useGetMyProjects({
    query: {
      select: (res) => res.data,
    }
  });
  const applyMutation = projectApi.useApplyProject();

  const joinedIds = new Set(
    myProjects
      ?.map((mp) => mp.project?.id)
      .filter((id): id is number => typeof id === "number") ?? []
  );

  const projects = data?.projects ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / 12);

  const handleJoinClick = (id: number) => {
    const project = projects.find((p) => p.id === id);
    if (project && project.id && project.title) {
      setConfirmProject({ id: project.id, title: project.title });
    }
  };

  const handleConfirmJoin = () => {
    if (!confirmProject) return;
    track("project_join_confirm", { projectId: confirmProject.id });
    applyMutation.mutate({ id: confirmProject.id }, {
      onSuccess: () => {
        track("project_join_success", { projectId: confirmProject.id });
        setJoinedProject(confirmProject.title);
        setConfirmProject(null);
      },
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">프로젝트 매칭</h1>
        <p className="mt-2 text-muted-foreground">
          나에게 맞는 프로젝트를 찾고 팀에 합류하세요.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="프로젝트 또는 기술 스택 검색..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              setPage(1);
              if (searchTrackTimer.current) clearTimeout(searchTrackTimer.current);
              if (value) {
                searchTrackTimer.current = setTimeout(() => {
                  track("project_search", { query_length: value.length });
                }, 500);
              }
            }}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={category === cat ? "default" : "secondary"}
              className="cursor-pointer text-sm px-3 py-1"
              onClick={() => {
                track("project_category_filter", { category: cat });
                setCategory(cat);
                setPage(1);
              }}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        총{" "}
        <span className="font-semibold text-primary">{totalCount}</span>
        개의 프로젝트
      </p>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg">검색 결과가 없습니다.</p>
          <p className="mt-1 text-sm">
            다른 키워드나 카테고리를 시도해보세요.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => project.id && (
              <ProjectCard
                key={project.id}
                project={project}
                onJoin={handleJoinClick}
                joined={joinedIds.has(project.id)}
              />
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => { track("project_pagination", { direction: "prev", page: page - 1 }); setPage((p) => p - 1); }}
              >
                이전
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => { track("project_pagination", { direction: "next", page: page + 1 }); setPage((p) => p + 1); }}
              >
                다음
              </Button>
            </div>
          )}
        </>
      )}

      {/* 참가 확인 모달 */}
      <Dialog
        open={confirmProject !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmProject(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle size={24} className="text-amber-600" />
            </div>
            <DialogTitle className="text-center">참가 신청</DialogTitle>
            <DialogDescription className="text-center">
              <strong>{confirmProject?.title}</strong>에 참가하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmProject(null)}>
              취소
            </Button>
            <Button className="flex-1" onClick={handleConfirmJoin} disabled={applyMutation.isPending}>
              {applyMutation.isPending ? "신청 중..." : "참가 신청"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 참가 완료 모달 */}
      <Dialog
        open={joinedProject !== null}
        onOpenChange={(open) => {
          if (!open) setJoinedProject(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle size={24} className="text-primary" />
            </div>
            <DialogTitle className="text-center">참가 신청 완료</DialogTitle>
            <DialogDescription className="text-center">
              <strong>{joinedProject}</strong>에 참가가
              완료되었습니다. 프로젝트 관리에서 확인하세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => setJoinedProject(null)}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
