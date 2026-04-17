"use client";

import Link from "next/link";
import { useCallback } from "react";
import { FileText, ArrowRight, FolderOpen, Download, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as resumeApi from "@/api/generated/resume/resume";
import * as projectApi from "@/api/generated/project/project";
import { useEducations } from "@/api/educations";
import { useCertifications } from "@/api/certifications";

export default function ResumePage() {
  const queryClient = useQueryClient();

  // 내 프로젝트 목록 (요약 대상 확인용)
  const { data: myProjects = [] } = projectApi.useGetMyProjects({
    query: {
      select: (res) => res.data,
    }
  });

  const { data: educations = [] } = useEducations();
  const { data: certifications = [] } = useCertifications();

  // 이력서 조회
  const { data: resume, isLoading, status } = resumeApi.useGetResume({
    query: {
      select: (res) => res.data,
      retry: false, // 404 등의 경우 재시도하지 않음
    }
  });

  // 이력서 생성
  const generateMutation = resumeApi.useGenerate({
    mutation: {
      onSuccess: () => {
        // 이력서 생성 성공 시 쿼리 무효화하여 최신 데이터 불러오기
        queryClient.invalidateQueries({ queryKey: resumeApi.getGetResumeQueryKey() });
      }
    }
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleDownloadPDF = useCallback(() => {
    if (!resume) return;

    const resolveExperienceSkills = (projectId?: number, rawSkills?: unknown[]) => {
      const summarizedSkills = (rawSkills ?? []).map((skill) => String(skill)).filter(Boolean);
      if (summarizedSkills.length > 0) return summarizedSkills;

      const projectSkills = myProjects
        .find((mp) => mp.project?.id === projectId)
        ?.project?.skills;
      return (projectSkills ?? []).map((skill) => String(skill)).filter(Boolean);
    };

    // 1. 기본 인적사항 변수 (Basic Info)
    const name = resume.basicInfo?.name || "";
    const email = resume.basicInfo?.email || "";
    const phone = resume.basicInfo?.phone || "";
    const github = resume.basicInfo?.github || "";
    const blog = resume.basicInfo?.blog || "";

    // 2. 연락처 및 링크 표시 (각각 레이블 추가)
    const emailHtml = email ? `<p class="contact">Email: ${email}</p>` : "";
    const phoneHtml = phone ? `<p class="contact">Phone: ${phone}</p>` : "";
    const githubHtml = github ? `<p class="links">GitHub: <a href="${github}">${github}</a></p>` : "";
    const blogHtml = blog ? `<p class="links">Blog: <a href="${blog}">${blog}</a></p>` : "";

    // 4. 프로젝트 경험 목록 변수화 (experiencesHtml)
    const experiencesHtml = (resume.summarizedExperiences ?? [])
      .map((exp) => {
        // API 스키마에 정의된 필드만 사용
        const projectTitle = exp.projectTitle || "프로젝트 제목";
        const skills = resolveExperienceSkills(exp.projectId, exp.skills);
        const skillsLine = skills.length > 0 ? `<p class="exp-stack">기술 스택: ${skills.join(", ")}</p>` : "";

        // 프로젝트 핵심 포인트 목록 (List Items)
        const keyPointsList = (exp.keyPoints ?? [])
          .map((kp) => `<li>${String(kp)}</li>`)
          .join("");

        return `
        <div class="experience">
          <div class="exp-header">
            <span class="exp-title">${projectTitle}</span>
          </div>
          ${skillsLine}
          <ul>${keyPointsList}</ul>
        </div>`;
      })
      .join("");

    const educationsHtml = educations
      .map((education) => {
        const schoolName = education.schoolName || "학교명";
        const degreeMajor = [education.degree, education.major].filter(Boolean).join(" · ");
        const period = `${education.startDate || ""}${education.endDate ? ` ~ ${education.endDate}` : " ~ 재학 중"}`;

        return `
        <div class="experience">
          <div class="exp-header">
            <span class="exp-title">${schoolName}</span>
          </div>
          ${degreeMajor ? `<p class="exp-stack">${degreeMajor}</p>` : ""}
          <p class="exp-stack">${period}</p>
        </div>`;
      })
      .join("");

    const certificationsHtml = certifications
      .map((certification) => {
        const name = certification.name || "자격증명";
        const org = certification.issuingOrganization || "발급기관 미입력";
        const issuedDate = certification.issuedDate || "취득일 미입력";

        return `
        <div class="experience">
          <div class="exp-header">
            <span class="exp-title">${name}</span>
          </div>
          <p class="exp-stack">발급기관: ${org}</p>
          <p class="exp-stack">취득일: ${issuedDate}</p>
        </div>`;
      })
      .join("");

    // 5. HTML 템플릿 내 바인딩
    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>이력서 - ${name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Sans KR', sans-serif; padding: 40px; color: #111; line-height: 1.6; }
    .header { margin-bottom: 30px; }
    h1 { font-size: 32px; font-weight: 700; margin-bottom: 10px; }
    .contact { font-size: 13px; color: #4b5563; margin-bottom: 4px; }
    .links { font-size: 13px; }
    .links a { color: #4b5563; text-decoration: none; border-bottom: 1px solid #d1d5db; }
    .section-title { font-size: 16px; font-weight: 700; color: #111; border-bottom: 2px solid #111; padding-bottom: 4px; margin-bottom: 16px; margin-top: 30px; text-transform: uppercase; }
    .experience { margin-bottom: 20px; }
    .exp-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
    .exp-title { font-weight: 700; font-size: 15px; }
    .exp-date { font-size: 13px; color: #6b7280; }
    .exp-stack, .exp-desc { font-size: 13px; color: #4b5563; margin-bottom: 4px; }
    ul { list-style: none; padding-top: 4px; }
    li { font-size: 13px; color: #374151; padding-left: 14px; position: relative; margin-bottom: 2px; }
    li::before { content: "•"; position: absolute; left: 0; color: #9ca3af; }
    .footer { font-size: 11px; color: #9ca3af; text-align: center; margin-top: 40px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${name}</h1>
    ${emailHtml}
    ${phoneHtml}
    ${githubHtml}
    ${blogHtml}
  </div>

  <p class="section-title">Education</p>
  ${educationsHtml || `<p class="exp-stack">등록된 학력이 없습니다.</p>`}

  <p class="section-title">Certifications</p>
  ${certificationsHtml || `<p class="exp-stack">등록된 자격증이 없습니다.</p>`}

  <p class="section-title">Project Experience</p>
  ${experiencesHtml}

  <p class="footer">본 이력서는 AI에 의해 생성되었습니다.</p>
</body>
</html>`;

    const printWindow = window.open("", "_blank", "width=820,height=1060");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  }, [certifications, educations, myProjects, resume]);

  const isNotFound = status === "error" || !resume;
  const hasResumeData = resume && resume.summarizedExperiences && resume.summarizedExperiences.length > 0;
  const resumeSkills = Array.from(
    new Set(
      (resume?.summarizedExperiences ?? [])
        .flatMap((exp) => {
          const summarizedSkills = (exp.skills ?? []).map((skill) => String(skill)).filter(Boolean);
          if (summarizedSkills.length > 0) return summarizedSkills;
          const projectSkills = myProjects
            .find((mp) => mp.project?.id === exp.projectId)
            ?.project?.skills;
          return (projectSkills ?? []).map((skill) => String(skill)).filter(Boolean);
        })
        .map((skill) => String(skill))
        .filter(Boolean)
    )
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

      {/* 이력서 생성/갱신 섹션 */}
      <div className="mb-8 flex items-center justify-between gap-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">
            {isNotFound ? "아직 생성된 이력서가 없습니다" : "이력서가 준비되었습니다"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isNotFound
              ? "프로젝트 관리에서 AI 요약을 진행한 후 아래 버튼을 눌러 이력서를 생성하세요."
              : `마지막 업데이트: ${resume?.generatedAt ? new Date(resume.generatedAt).toLocaleString("ko-KR") : "알 수 없음"}`}
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generateMutation.isPending || myProjects.length === 0}
          size="lg"
          className="min-w-[160px]"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              생성 중...
            </>
          ) : isNotFound ? (
            <>
              <Sparkles size={16} className="mr-2" />
              AI 이력서 생성
            </>
          ) : (
            <>
              <RefreshCw size={16} className="mr-2" />
              이력서 새로고침
            </>
          )}
        </Button>
      </div>

      {isNotFound || !hasResumeData ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
              <FolderOpen size={40} className="text-muted-foreground/30" />
            </div>
            <p className="text-xl font-semibold text-muted-foreground">
              보여줄 이력서 내용이 없습니다
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              내 프로젝트 관리에서 프로젝트 경험을 기록하고 AI 요약을 진행하면, 그 내용을 바탕으로 이력서가 구성됩니다.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                href="/my-projects"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                프로젝트 관리로 이동
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* 포함된 프로젝트 목록 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
                <CardDescription>프로필 설정에서 수정할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">이름</span>
                    <p className="font-medium mt-1">{resume.basicInfo?.name || "미설정"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">이메일</span>
                    <p className="font-medium mt-1">{resume.basicInfo?.email || "미설정"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">연락처</span>
                    <p className="font-medium mt-1">{resume.basicInfo?.phone || "미설정"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">GitHub</span>
                    <p className="font-medium mt-1 truncate">{resume.basicInfo?.github || "미설정"}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">블로그</span>
                    <p className="font-medium mt-1">{resume.basicInfo?.blog || "미설정"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>프로젝트 경험 요약</span>
                  <Badge variant="secondary">{resume.summarizedExperiences?.length || 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {resume.summarizedExperiences?.map((exp) => {
                  const skills = (exp.skills && exp.skills.length > 0
                    ? exp.skills
                    : myProjects.find((mp) => mp.project?.id === exp.projectId)?.project?.skills) ?? [];

                  return (
                    <div
                      key={exp.projectId}
                      className="flex flex-col gap-2 rounded-lg border p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-start justify-between">
                        <p className="font-semibold">{exp.projectTitle}</p>
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px]">
                          AI 요약됨
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pb-1">
                            {skills.map((skill, i) => (
                              <Badge key={`${exp.projectId}-${String(skill)}-${i}`} variant="outline" className="text-[10px]">
                                {String(skill)}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {exp.keyPoints?.slice(0, 3).map((kp, i) => (
                          <p key={i} className="text-xs text-muted-foreground truncate">
                            • {String(kp)}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* 미리보기 */}
          <div className="relative">
            <Card className="sticky top-8 border-primary/20 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between bg-white pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={18} className="text-primary" />
                    이력서 미리보기
                  </CardTitle>
                </div>
                <Button variant="outline" size="sm" className="bg-white" onClick={handleDownloadPDF}>
                  <Download size={14} className="mr-1" />
                  PDF 다운로드
                </Button>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* 헤더 섹션 */}
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">
                    {resume.basicInfo?.name || "이름"}
                  </h2>
                  <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
                    {resume.basicInfo?.email && <span>Email: {resume.basicInfo.email}</span>}
                    {resume.basicInfo?.phone && <span>Phone: {resume.basicInfo.phone}</span>}
                  </div>
                  <div className="flex flex-col items-center gap-1 text-sm text-primary underline underline-offset-4">
                    {resume.basicInfo?.github && (
                      <a href={resume.basicInfo.github} target="_blank" rel="noreferrer">
                        GitHub: {resume.basicInfo.github}
                      </a>
                    )}
                    {resume.basicInfo?.blog && (
                      <a href={resume.basicInfo.blog} target="_blank" rel="noreferrer">
                        Blog: {resume.basicInfo.blog}
                      </a>
                    )}
                  </div>
                </div>

                <Separator />

                {/* 학력 섹션 */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold border-l-4 border-primary pl-3">
                    EDUCATION
                  </h3>
                  {educations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">등록된 학력이 없습니다.</p>
                  ) : (
                    <div className="space-y-4">
                      {educations.map((education) => (
                        <div key={education.id} className="space-y-1">
                          <p className="font-bold text-base">{education.schoolName}</p>
                          <p className="text-sm text-muted-foreground">
                            {[education.degree, education.major].filter(Boolean).join(" · ") || "학과/학위 미입력"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {education.startDate} ~ {education.endDate || "재학 중"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* 자격증 섹션 */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold border-l-4 border-primary pl-3">
                    CERTIFICATIONS
                  </h3>
                  {certifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">등록된 자격증이 없습니다.</p>
                  ) : (
                    <div className="space-y-4">
                      {certifications.map((certification) => (
                        <div key={certification.id} className="space-y-1">
                          <p className="font-bold text-base">{certification.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {certification.issuingOrganization || "발급기관 미입력"}
                          </p>
                          <p className="text-xs text-muted-foreground">취득일: {certification.issuedDate}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* 경험 섹션 */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold border-l-4 border-primary pl-3">
                    PROJECT EXPERIENCE
                  </h3>
                  <div className="space-y-8">
                    {resume.summarizedExperiences?.map((exp) => {
                      const skills = (exp.skills && exp.skills.length > 0
                        ? exp.skills
                        : myProjects.find((mp) => mp.project?.id === exp.projectId)?.project?.skills) ?? [];

                      return (
                        <div key={exp.projectId} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-base">{exp.projectTitle}</p>
                          </div>
                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {skills.map((skill, i) => (
                                <Badge key={`${exp.projectId}-preview-${String(skill)}-${i}`} variant="outline" className="px-2 py-0.5 text-[10px]">
                                  {String(skill)}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <ul className="space-y-1.5 ml-1">
                            {exp.keyPoints?.map((kp, i) => (
                              <li key={i} className="text-sm text-muted-foreground leading-relaxed flex items-start">
                                <span className="mr-2 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                                {String(kp)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {resume.generatedAt && (
                  <p className="text-[10px] text-center text-muted-foreground pt-4">
                    본 이력서는 AI에 의해 생성되었습니다. (최종 생성: {new Date(resume.generatedAt).toLocaleString()})
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
