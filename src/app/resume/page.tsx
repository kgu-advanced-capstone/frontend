"use client";

import Link from "next/link";
import { FileText, ArrowRight, FolderOpen, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as resumeApi from "@/api/generated/resume/resume";

export default function ResumePage() {
  const { data: resume, isLoading } = resumeApi.useGetResume({
    query: {
      select: (res) => res.data,
    }
  });
  const generateMutation = resumeApi.useGenerate();

  const hasSummaries =
    resume && resume.summarizedExperiences && resume.summarizedExperiences.length > 0;

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

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
              프로젝트 관리에서 작성한 AI 요약을 바탕으로 이력서를 완성하세요.
            </p>
          </div>
        </div>
      </div>

      {/* 이력서 생성 버튼 */}
      <div className="mb-8">
        <Button
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          size="lg"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              이력서 생성 중...
            </>
          ) : (
            <>
              <FileText size={16} className="mr-2" />
              AI 이력서 생성
            </>
          )}
        </Button>
        {generateMutation.isSuccess && (
          <span className="ml-3 text-sm text-green-600">이력서가 생성되었습니다!</span>
        )}
      </div>

      {!hasSummaries ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <FolderOpen size={48} className="text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              AI 요약된 프로젝트가 없습니다
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              프로젝트 관리에서 경험을 기록하고 AI 요약을 먼저 진행해주세요.
            </p>
            <Link
              href="/my-projects"
              className={cn(buttonVariants(), "mt-6")}
            >
              프로젝트 관리로 이동
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* 포함된 프로젝트 목록 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">이름</span>
                    <p className="font-medium">{resume.basicInfo.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">이메일</span>
                    <p className="font-medium">{resume.basicInfo.email}</p>
                  </div>
                  {resume.basicInfo.phone && (
                    <div>
                      <span className="text-muted-foreground">전화</span>
                      <p className="font-medium">{resume.basicInfo.phone}</p>
                    </div>
                  )}
                  {resume.basicInfo.github && (
                    <div>
                      <span className="text-muted-foreground">GitHub</span>
                      <p className="font-medium">{resume.basicInfo.github}</p>
                    </div>
                  )}
                  {resume.basicInfo.blog && (
                    <div>
                      <span className="text-muted-foreground">블로그</span>
                      <p className="font-medium">{resume.basicInfo.blog}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  포함된 프로젝트 ({resume.summarizedExperiences.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {resume.summarizedExperiences.map((exp) => (
                  <div
                    key={exp.projectId}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{exp.projectTitle}</p>
                      <div className="mt-1 flex gap-1">
                        {exp.keyPoints.slice(0, 2).map((kp, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">
                            {kp.slice(0, 30)}...
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px]">
                      요약 완료
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 미리보기 */}
          <div>
            <Card className="sticky top-20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText size={18} />
                  이력서 미리보기
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Download size={14} className="mr-1" />
                  PDF (데모)
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold">
                    {resume.basicInfo.name || "이름"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {[resume.basicInfo.email, resume.basicInfo.phone]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {(resume.basicInfo.github || resume.basicInfo.blog) && (
                    <p className="text-sm text-muted-foreground">
                      {[resume.basicInfo.github, resume.basicInfo.blog]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    프로젝트 경험
                  </h3>
                  <div className="space-y-5">
                    {resume.summarizedExperiences.map((exp) => (
                      <div key={exp.projectId}>
                        <p className="font-medium">{exp.projectTitle}</p>
                        <ul className="mt-1 space-y-1">
                          {exp.keyPoints.map((kp, i) => (
                            <li key={i} className="text-sm text-muted-foreground">
                              - {kp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    기술 스택
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      ...new Set(
                        resume.summarizedExperiences.flatMap((e) => e.keyPoints)
                      ),
                    ]
                      .slice(0, 10)
                      .map((skill, i) => (
                        <Badge key={i} variant="secondary">
                          {skill.slice(0, 20)}
                        </Badge>
                      ))}
                  </div>
                </div>

                {resume.generatedAt && (
                  <>
                    <Separator />
                    <p className="text-xs text-muted-foreground">
                      생성일: {new Date(resume.generatedAt).toLocaleDateString("ko-KR")}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
