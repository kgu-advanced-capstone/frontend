"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Calendar, User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { projects } from "@/data/dummy";
import { useProjects } from "@/contexts/ProjectContext";
import { useState } from "react";

const memberNames = ["김지현", "박서준", "이수민", "정민우", "한소희", "오태현"];

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const project = projects.find((p) => p.id === Number(id));
  const { isJoined, joinProject, leaveProject } = useProjects();
  const [showJoinModal, setShowJoinModal] = useState(false);

  if (!project) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">프로젝트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const joined = isJoined(project.id);
  const isFull =
    project.currentMembers + (joined ? 1 : 0) >= project.maxMembers;
  const members = memberNames.slice(
    0,
    project.currentMembers + (joined ? 1 : 0)
  );

  const handleJoin = () => {
    joinProject(project.id);
    setShowJoinModal(true);
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
          <Button
            size="lg"
            variant="outline"
            onClick={() => leaveProject(project.id)}
          >
            참가 취소
          </Button>
        ) : (
          <Button
            size="lg"
            disabled={isFull}
            onClick={handleJoin}
          >
            {isFull ? "마감" : "프로젝트 참가"}
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
                {project.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
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
                  {project.currentMembers + (joined ? 1 : 0)}/
                  {project.maxMembers}명 참여 중
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-muted-foreground" />
                <span>마감일: {project.deadline}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User size={16} className="text-muted-foreground" />
                <span>개설자: {project.author}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">팀원</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((name, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {name}
                      {i === 0 && (
                        <Badge variant="outline" className="ml-2 text-[10px]">
                          팀장
                        </Badge>
                      )}
                    </span>
                  </div>
                ))}
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
              <strong>{project.title}</strong>에 참가 신청이
              완료되었습니다. 프로젝트 관리에서 경험을 기록해보세요.
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
