"use client";

import Link from "next/link";
import { FileText, ArrowRight, FolderOpen, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useProjects } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function ResumePage() {
  const { joinedProjects } = useProjects();
  const { user } = useAuth();
  const summarized = joinedProjects.filter((jp) => jp.summary);

  const [name, setName] = useState(user?.name || "");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [intro, setIntro] = useState("");

  const hasSummaries = summarized.length > 0;

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
              프로젝트 관리에서 작성한 AI 요약을 바탕으로 이력서를
              완성하세요.
            </p>
          </div>
        </div>
      </div>

      {!hasSummaries ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <FolderOpen
              size={48}
              className="text-muted-foreground/30 mb-4"
            />
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
          {/* 입력 영역 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">이름</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">지원 직무</Label>
                  <Input
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="프론트엔드 개발자"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">이메일</Label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">자기소개</Label>
                  <Textarea
                    value={intro}
                    onChange={(e) => setIntro(e.target.value)}
                    className="min-h-[100px]"
                    placeholder="간단한 자기소개를 작성해주세요..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>포함된 프로젝트 ({summarized.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {summarized.map((jp) => (
                  <div
                    key={jp.project.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {jp.project.title}
                      </p>
                      <div className="mt-1 flex gap-1">
                        {jp.project.skills.slice(0, 3).map((s) => (
                          <Badge
                            key={s}
                            variant="outline"
                            className="text-[10px]"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px]">
                      요약 완료
                    </Badge>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  프로젝트 관리에서 AI 요약을 완료한 프로젝트만 이력서에
                  포함됩니다.
                </p>
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
                    {name || "이름을 입력하세요"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {[position, email].filter(Boolean).join(" · ") ||
                      "직무 · 이메일"}
                  </p>
                </div>

                {intro && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        자기소개
                      </h3>
                      <p className="text-sm leading-relaxed">{intro}</p>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    프로젝트 경험
                  </h3>
                  <div className="space-y-5">
                    {summarized.map((jp) => (
                      <div key={jp.project.id}>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {jp.summary}
                        </div>
                        <div className="mt-2 flex gap-1">
                          {jp.project.skills.map((s) => (
                            <Badge
                              key={s}
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
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
                        summarized.flatMap((jp) => jp.project.skills)
                      ),
                    ].map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
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
