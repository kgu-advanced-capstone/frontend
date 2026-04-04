"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Calendar, User, CheckCircle, Github, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import * as projectApi from "@/api/generated/project/project";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const projectId = Number(id);
  const { data: project, isLoading } = projectApi.useGetProject(projectId, {
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
  const [showJoinModal, setShowJoinModal] = useState(false);

  const joined = myProjects?.some((mp) => mp.project?.id === projectId) ?? false;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">프로젝트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const isFull = (project.participants?.length ?? 0) >= (project.maxMembers ?? 0);

  const handleJoin = () => {
    if (!project.id) return;
    applyMutation.mutate({ id: project.id }, {
      onSuccess: () => setShowJoinModal(true),
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/projects"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        프로젝트 목록
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Badge variant="secondary" className="mb-3">
            {project.category}
          </Badge>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {project.author} · {project.createdAt}
          </p>
        </div>
        {joined ? (
          <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-4 py-2">
            참여 중
          </Badge>
        ) : (
          <Button size="lg" disabled={isFull || applyMutation.isPending} onClick={handleJoin}>
            {applyMutation.isPending ? "신청 중..." : isFull ? "마감" : "프로젝트 참가"}
          </Button>
        )}
      </div>

      <Separator className="my-8" />

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>프로젝트 소개</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">
                {project.description}
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                이 프로젝트는 실무 환경과 유사한 방식으로 진행되며, 팀원들과
                협업하여 실제 서비스를 개발하는 것을 목표로 합니다. 프로젝트
                완료 후 AI가 자동으로 경험을 요약하여 이력서에 활용할 수 있도록
                도와드립니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>기술 스택</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.skills?.map((skill) => (
                  <Badge key={skill as string} variant="secondary" className="text-sm">
                    {skill as string}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>참여자 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {(project.participants?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">아직 참여자가 없습니다.</p>
              ) : (
                <ul className="space-y-4">
                  {project.participants?.map((p) => (
                    <li key={p.userId} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {p.profileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.profileImage}
                            alt={p.name ?? ""}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                            <User size={16} className="text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          {p.joinedAt && (
                            <p className="text-xs text-muted-foreground">{p.joinedAt} 참여</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.github && (
                          <a href={p.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Github size={16} />
                          </a>
                        )}
                        {p.blog && (
                          <a href={p.blog} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Globe size={16} />
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">프로젝트 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Users size={16} className="text-muted-foreground" />
                <span>
                  {project.participants?.length ?? 0}/{project.maxMembers ?? 0}명 참여 중
                </span>
              </div>
              {project.deadline && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-muted-foreground" />
                  <span>마감일: {project.deadline}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <User size={16} className="text-muted-foreground" />
                <span>개설자: {project.author}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle size={24} className="text-primary" />
            </div>
            <DialogTitle className="text-center">참가 신청 완료</DialogTitle>
            <DialogDescription className="text-center">
              <strong>{project.title}</strong>에 참가가
              완료되었습니다. 프로젝트 관리에서 확인하세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="w-full" onClick={() => setShowJoinModal(false)}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
