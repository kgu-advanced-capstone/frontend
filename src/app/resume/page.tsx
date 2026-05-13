"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, ArrowRight, FolderOpen, Download, Loader2, Sparkles, RefreshCw, Save, RotateCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import * as resumeApi from "@/api/generated/resume/resume";
import * as projectApi from "@/api/generated/project/project";
import { useEducations } from "@/api/educations";
import { useCertifications } from "@/api/certifications";
import {
  COVER_LETTER_STORAGE_KEY,
  DEFAULT_COVER_LETTER_DRAFT,
  type CoverLetterDraft,
  coverLetterToHtml,
  hasCoverLetterContent,
  normalizeCoverLetterDraft,
} from "./cover-letter";

function ResumePageSkeleton() {
  return (
    <div
      className="mx-auto max-w-5xl px-6 py-12"
      role="status"
      aria-label="이력서 불러오는 중"
    >
      <div className="mb-8 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
      </div>

      <div className="mb-8 flex items-center justify-between gap-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-11 w-40 rounded-lg" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3, 4].map((item) => (
                <div key={item} className={item === 4 ? "col-span-2 space-y-2" : "space-y-2"}>
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-[260px] w-full rounded-lg" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-8 rounded-4xl" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} className="h-24 w-full rounded-lg" />
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20 bg-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between bg-white pb-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-8 w-28 rounded-lg" />
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="space-y-3 text-center">
              <Skeleton className="mx-auto h-9 w-36" />
              <Skeleton className="mx-auto h-4 w-48" />
              <Skeleton className="mx-auto h-4 w-40" />
            </div>
            {[0, 1, 2, 3].map((section) => (
              <div key={section} className="space-y-4">
                <Separator />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResumePage() {
  const queryClient = useQueryClient();
  const [coverLetterDraft, setCoverLetterDraft] = useState<CoverLetterDraft>(DEFAULT_COVER_LETTER_DRAFT);
  const [isCoverLetterLoaded, setIsCoverLetterLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedDraft = window.localStorage.getItem(COVER_LETTER_STORAGE_KEY);
      if (storedDraft) {
        setCoverLetterDraft(normalizeCoverLetterDraft(JSON.parse(storedDraft) as Partial<CoverLetterDraft>));
      }
    } catch {
      setCoverLetterDraft(DEFAULT_COVER_LETTER_DRAFT);
    } finally {
      setIsCoverLetterLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isCoverLetterLoaded) return;
    window.localStorage.setItem(COVER_LETTER_STORAGE_KEY, JSON.stringify(coverLetterDraft));
  }, [coverLetterDraft, isCoverLetterLoaded]);

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

  const normalizedCoverLetterDraft = useMemo(
    () => normalizeCoverLetterDraft(coverLetterDraft),
    [coverLetterDraft]
  );
  const hasCoverLetter = hasCoverLetterContent(coverLetterDraft);

  const persistCoverLetterDraft = (draft: CoverLetterDraft) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(COVER_LETTER_STORAGE_KEY, JSON.stringify(draft));
  };

  const updateCoverLetterField = (field: keyof CoverLetterDraft, value: string) => {
    setCoverLetterDraft((prev) => {
      const nextDraft = { ...prev, [field]: value };
      if (isCoverLetterLoaded) {
        persistCoverLetterDraft(nextDraft);
      }
      return nextDraft;
    });
  };

  const handleResetCoverLetter = () => {
    setCoverLetterDraft(DEFAULT_COVER_LETTER_DRAFT);
    persistCoverLetterDraft(DEFAULT_COVER_LETTER_DRAFT);
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
    const coverLetterHtml = coverLetterToHtml(normalizedCoverLetterDraft);

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
    .cover-letter p { font-size: 13px; color: #374151; margin-bottom: 10px; line-height: 1.8; }
    .experience { margin-bottom: 20px; }
    .exp-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
    .exp-title { font-weight: 700; font-size: 15px; }
    .exp-date { font-size: 13px; color: #6b7280; }
    .exp-stack, .exp-desc { font-size: 13px; color: #4b5563; margin-bottom: 4px; }
    ul { list-style: none; padding-top: 4px; }
    li { font-size: 13px; color: #374151; padding-left: 14px; position: relative; margin-bottom: 2px; }
    li::before { content: "•"; position: absolute; left: 0; color: #9ca3af; }
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

  ${coverLetterHtml}

  <p class="section-title">Education</p>
  ${educationsHtml || `<p class="exp-stack">등록된 학력이 없습니다.</p>`}

  <p class="section-title">Certifications</p>
  ${certificationsHtml || `<p class="exp-stack">등록된 자격증이 없습니다.</p>`}

  <p class="section-title">Project Experience</p>
  ${experiencesHtml}
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
  }, [certifications, educations, myProjects, normalizedCoverLetterDraft, resume]);

  const isNotFound = status === "error" || !resume;
  const hasResumeData = resume && resume.summarizedExperiences && resume.summarizedExperiences.length > 0;

  if (isLoading) {
    return <ResumePageSkeleton />;
  }

  const coverLetterEditorCard = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          자기소개서
        </CardTitle>
        <CardDescription>
          작성한 내용은 이 브라우저의 localStorage에 자동 저장됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cover-letter-title">섹션 제목</Label>
          <Input
            id="cover-letter-title"
            value={coverLetterDraft.title}
            onChange={(e) => updateCoverLetterField("title", e.target.value)}
            placeholder={DEFAULT_COVER_LETTER_DRAFT.title}
            maxLength={40}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="cover-letter-content">본문</Label>
            <span className="text-xs text-muted-foreground">
              {coverLetterDraft.content.trim().length.toLocaleString("ko-KR")}자
            </span>
          </div>
          <Textarea
            id="cover-letter-content"
            value={coverLetterDraft.content}
            onChange={(e) => updateCoverLetterField("content", e.target.value)}
            placeholder={"지원 동기, 협업 경험, 강점과 성장 방향을 자유롭게 작성하세요.\n\n문단을 나누면 PDF에도 문단 간격이 반영됩니다."}
            className="min-h-[260px] resize-y leading-7"
            maxLength={3000}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Save size={14} />
            {isCoverLetterLoaded ? "자동 저장됨" : "불러오는 중"}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetCoverLetter}
            disabled={!hasCoverLetter && coverLetterDraft.title === DEFAULT_COVER_LETTER_DRAFT.title}
          >
            <RotateCcw size={14} className="mr-1" />
            초기화
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
        <div className="grid gap-8 lg:grid-cols-2">
          <div>{coverLetterEditorCard}</div>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
                <FolderOpen size={40} className="text-muted-foreground/30" />
              </div>
              <p className="text-xl font-semibold text-muted-foreground">
                보여줄 이력서 내용이 없습니다
              </p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                자기소개서는 먼저 작성할 수 있고, 이력서 생성 후 PDF 미리보기와 다운로드에 함께 반영됩니다.
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
        </div>
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

            {coverLetterEditorCard}

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

                {/* 자기소개서 섹션 */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold border-l-4 border-primary pl-3">
                    {normalizedCoverLetterDraft.title}
                  </h3>
                  {hasCoverLetter ? (
                    <div className="space-y-4 text-sm leading-7 text-muted-foreground">
                      {normalizedCoverLetterDraft.content.split(/\n{2,}/).map((paragraph, paragraphIndex) => (
                        <p key={paragraphIndex}>
                          {paragraph.split("\n").map((line, lineIndex) => (
                            <span key={`${paragraphIndex}-${lineIndex}`}>
                              {line}
                              {lineIndex < paragraph.split("\n").length - 1 && <br />}
                            </span>
                          ))}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      좌측에서 자기소개서를 작성하면 PDF 미리보기와 다운로드에 함께 반영됩니다.
                    </p>
                  )}
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
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
