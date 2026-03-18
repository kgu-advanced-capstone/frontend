"use client";

import Link from "next/link";
import {
  Rocket,
  Brain,
  FileText,
  ArrowRight,
  Users,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Users,
    title: "프로젝트 매칭",
    description:
      "AI가 기술 스택과 관심 분야를 분석하여 최적의 팀원을 매칭합니다. 실무와 동일한 환경에서 프로젝트를 경험하세요.",
  },
  {
    icon: Brain,
    title: "AI 프로젝트 요약",
    description:
      "프로젝트에서 수행한 작업을 마크다운으로 기록하면, AI가 이력서에 바로 쓸 수 있도록 핵심만 정리해줍니다.",
  },
  {
    icon: FileText,
    title: "AI 이력서 작성",
    description:
      "프로젝트 경험을 자동으로 불러와 이력서 초안을 작성합니다. 실제 취업자의 데이터로 고도화된 AI가 도와줍니다.",
  },
];

const stats = [
  { label: "등록된 프로젝트", value: "1,200+" },
  { label: "누적 참여자", value: "8,500+" },
  { label: "이력서 생성", value: "3,400+" },
  { label: "취업 성공률", value: "78%" },
];

const steps = [
  {
    step: "01",
    icon: Rocket,
    title: "프로젝트 참가",
    desc: "관심 분야의 프로젝트를 찾고, 팀에 합류하세요.",
  },
  {
    step: "02",
    icon: Zap,
    title: "경험 기록 & AI 요약",
    desc: "프로젝트 경험을 기록하면 AI가 이력서용으로 정리합니다.",
  },
  {
    step: "03",
    icon: FileText,
    title: "이력서 완성 & 지원",
    desc: "AI가 작성한 이력서로 바로 기업에 지원하세요.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
          <div className="animate-fade-in-up text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              직무 경험 프로젝트 플랫폼
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              프로젝트로 완성하는
              <br />
              <span className="text-primary">진짜 커리어</span>
            </h1>
          </div>
          <p className="animate-fade-in-up-delay mx-auto mt-6 max-w-xl text-center text-lg text-muted-foreground">
            프로젝트 매칭부터 AI 이력서 작성까지.
            <br />
            빌디에서 경험을 쌓고, 커리어를 빌드하세요.
          </p>
          <div className="animate-fade-in-up-delay-2 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/projects"
              className={cn(buttonVariants({ size: "lg" }), "shadow-lg")}
            >
              프로젝트 둘러보기
              <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link
              href="/resume"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              AI 이력서 작성하기
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </section>

      {/* Stats */}
      <section className="border-b bg-background">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-16 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Features
            </span>
            <h2 className="mt-3 text-3xl font-bold">
              프로젝트부터 취업까지, 한 곳에서
            </h2>
            <p className="mt-3 text-muted-foreground">
              빌디가 제공하는 핵심 기능을 살펴보세요.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group transition-all hover:shadow-lg hover:border-primary/30"
                >
                  <CardContent className="p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon size={24} />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold">
                      {feature.title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              How it works
            </span>
            <h2 className="mt-3 text-3xl font-bold">
              3단계로 시작하는 커리어 빌드
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.step} className="relative">
                  <CardContent className="p-8">
                    <span className="text-4xl font-bold text-primary/15">
                      {item.step}
                    </span>
                    <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">
            지금 바로 커리어를 빌드하세요
          </h2>
          <p className="mt-4 text-primary-foreground/70">
            프로젝트 경험으로 채우는 이력서, 빌디에서 시작합니다.
          </p>
          <Link
            href="/projects"
            className={cn(
              buttonVariants({ size: "lg", variant: "secondary" }),
              "mt-8 shadow-lg"
            )}
          >
            무료로 시작하기
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>
    </>
  );
}
