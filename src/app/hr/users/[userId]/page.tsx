"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone, Github, Link2, GraduationCap, Award, FolderOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetHrUserDetail } from "@/api/hr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { HrUserProjectStatus } from "@/api/types";

const statusLabel: Record<HrUserProjectStatus, string> = {
  RECRUITING: "모집 중",
  IN_PROGRESS: "진행 중",
  COMPLETED: "완료",
};

const statusVariant: Record<HrUserProjectStatus, "secondary" | "default" | "outline"> = {
  RECRUITING: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "outline",
};

export default function HrUserDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.userId);

  useEffect(() => {
    if (!authLoading && user?.role !== "ADMIN") {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  const { data, isLoading } = useGetHrUserDetail(userId);

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user?.role !== "ADMIN") return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Button variant="ghost" className="mb-6 gap-2 pl-0" onClick={() => router.back()}>
        <ArrowLeft size={16} />
        목록으로
      </Button>

      {isLoading ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={data.profileImage} alt={data.name} />
                  <AvatarFallback className="text-lg">{data.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold">{data.name}</h1>
                  <p className="text-sm text-muted-foreground">{data.email}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {data.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="shrink-0 text-muted-foreground" />
                    <span>{data.phone}</span>
                  </div>
                )}
                {data.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="shrink-0 text-muted-foreground" />
                    <span>{data.email}</span>
                  </div>
                )}
                {data.github && (
                  <div className="flex items-center gap-2 text-sm">
                    <Github size={14} className="shrink-0 text-muted-foreground" />
                    <a href={data.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                      {data.github}
                    </a>
                  </div>
                )}
                {data.blog && (
                  <div className="flex items-center gap-2 text-sm">
                    <Link2 size={14} className="shrink-0 text-muted-foreground" />
                    <a href={data.blog} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                      {data.blog}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 학력 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap size={18} />
                학력
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {data.educations.length === 0 ? (
                <p className="text-sm text-muted-foreground">등록된 학력이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {data.educations.map((edu) => (
                    <div key={edu.id} className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{edu.schoolName}</p>
                        <p className="text-sm text-muted-foreground">
                          {[edu.major, edu.degree].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm text-muted-foreground">
                        {edu.startDate.slice(0, 7)} ~ {edu.endDate ? edu.endDate.slice(0, 7) : "재학 중"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 자격증 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Award size={18} />
                자격증
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {data.certifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">등록된 자격증이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {data.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        {cert.issuingOrganization && (
                          <p className="text-sm text-muted-foreground">{cert.issuingOrganization}</p>
                        )}
                      </div>
                      <p className="shrink-0 text-sm text-muted-foreground">{cert.issuedDate}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 참가 프로젝트 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderOpen size={18} />
                참가 프로젝트
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {data.projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">참가한 프로젝트가 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {data.projects.map((proj) => (
                    <div key={proj.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{proj.title}</p>
                          <p className="text-sm text-muted-foreground">{proj.category} · {proj.createdAt.slice(0, 7)}</p>
                        </div>
                        <Badge variant={statusVariant[proj.status]} className="shrink-0 text-xs">
                          {statusLabel[proj.status]}
                        </Badge>
                      </div>
                      {proj.skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {proj.skills.map((s) => (
                            <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">사용자 정보를 불러올 수 없습니다.</p>
        </div>
      )}
    </div>
  );
}
