"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ProjectCard from "@/components/ProjectCard";
import { projects as allProjects, categories } from "@/data/dummy";

const PAGE_SIZE = 6;

export default function ProjectsPage() {
  const [category, setCategory] = useState("전체");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [joinedIds, setJoinedIds] = useState<Set<number>>(new Set());
  const loaderRef = useRef<HTMLDivElement>(null);

  const filtered = allProjects.filter((p) => {
    const matchCategory = category === "전체" || p.category === category;
    const matchSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) => prev + PAGE_SIZE);
    }
  }, [hasMore]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category, search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    const current = loaderRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [loadMore]);

  const handleJoin = (id: number) => {
    setJoinedIds((prev) => new Set(prev).add(id));
    alert("참가 신청이 완료되었습니다! (데모)");
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">프로젝트 매칭</h1>
        <p className="mt-2 text-muted-foreground">
          나에게 맞는 프로젝트를 찾고 팀에 합류하세요.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="프로젝트 또는 기술 스택 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={category === cat ? "default" : "secondary"}
              className="cursor-pointer text-sm px-3 py-1"
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        총{" "}
        <span className="font-semibold text-primary">{filtered.length}</span>
        개의 프로젝트
      </p>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg">검색 결과가 없습니다.</p>
          <p className="mt-1 text-sm">
            다른 키워드나 카테고리를 시도해보세요.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard
              key={project.id}
              project={
                joinedIds.has(project.id)
                  ? {
                      ...project,
                      currentMembers: Math.min(
                        project.currentMembers + 1,
                        project.maxMembers
                      ),
                    }
                  : project
              }
              onJoin={handleJoin}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      )}

      {!hasMore && visible.length > 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          모든 프로젝트를 불러왔습니다.
        </p>
      )}
    </div>
  );
}
