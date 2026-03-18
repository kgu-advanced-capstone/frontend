"use client";

import Link from "next/link";
import { Users, Calendar } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project } from "@/data/dummy";

interface ProjectCardProps {
  project: Project;
  onJoin?: (id: number) => void;
  joined?: boolean;
}

export default function ProjectCard({ project, onJoin, joined }: ProjectCardProps) {
  const isFull = project.currentMembers >= project.maxMembers;

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
        <p className="text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.skills.map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs font-normal">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users size={14} />
            {project.currentMembers}/{project.maxMembers}명
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            ~{project.deadline}
          </span>
        </div>
        {joined ? (
          <Button size="sm" variant="outline" disabled>
            참여 중
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => onJoin?.(project.id)}
            disabled={isFull}
            variant={isFull ? "outline" : "default"}
          >
            {isFull ? "마감" : "참가"}
          </Button>
        )}
      </CardFooter>

      <div className="px-6 pb-4">
        <p className="text-xs text-muted-foreground">
          {project.author} · {project.createdAt}
        </p>
      </div>
    </Card>
  );
}
