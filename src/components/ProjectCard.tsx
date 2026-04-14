"use client";

import Link from "next/link";
import { Users, Calendar, Eye } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProjectSummaryResponse } from "@/api/types";
import { useTrack } from "@/hooks/useTrack";

interface ProjectCardProps {
  project: ProjectSummaryResponse;
  onJoin?: (id: number) => void;
  joined?: boolean;
}

export default function ProjectCard({ project, onJoin, joined }: ProjectCardProps) {
  const isFull = (project.currentMembers ?? 0) >= (project.maxMembers ?? 0);
  const { track } = useTrack();

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{project.category}</Badge>
          {joined ? (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              참여 중
            </Badge>
          ) : isFull ? (
            <Badge variant="outline" className="text-muted-foreground">
              마감
            </Badge>
          ) : null}
        </div>
        <Link href={`/projects/${project.id}`} className="group">
          <h3 className="mt-2 text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
            {project.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.skills?.map((skill) => (
            <Badge key={skill as string} variant="outline" className="text-xs font-normal">
              {skill as string}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users size={14} />
            {project.currentMembers ?? 0}/{project.maxMembers ?? 0}명
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {project.createdAt}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/projects/${project.id}`}
            onClick={() => track("project_detail_click", { projectId: project.id, title: project.title })}
            className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
          >
            <Eye size={14} className="mr-1" />
            상세
          </Link>
          {joined ? (
            <Button size="sm" variant="outline" disabled>
              참여 중
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                track("project_join_click", { projectId: project.id, title: project.title });
                if (project.id) onJoin?.(project.id);
              }}
              disabled={isFull}
              variant={isFull ? "outline" : "default"}
            >
              {isFull ? "마감" : "참가"}
            </Button>
          )}
        </div>
      </CardFooter>

      <div className="px-6 pb-4">
        <p className="text-xs text-muted-foreground">
          {project.author} · {project.createdAt}
        </p>
      </div>
    </Card>
  );
}
