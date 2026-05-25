"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetHrUsers } from "@/api/hr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { HrUsersParams } from "@/api/types";

export default function HrUsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [certInput, setCertInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [params, setParams] = useState<HrUsersParams>({ page: 0, size: 20 });

  useEffect(() => {
    if (!authLoading && user?.role !== "ADMIN") {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  const { data, isLoading } = useGetHrUsers(params);

  const handleSearch = () => {
    setParams({
      certifications: certInput.trim() || undefined,
      skills: skillInput.trim() || undefined,
      page: 0,
      size: 20,
    });
  };

  const handleReset = () => {
    setCertInput("");
    setSkillInput("");
    setParams({ page: 0, size: 20 });
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user?.role !== "ADMIN") return null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">인사팀 사용자 조회</h1>
          <p className="text-sm text-muted-foreground">자격증 및 스킬로 인재를 검색하세요.</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">자격증</label>
              <Input
                placeholder="예: 정보처리기사,SQLD (쉼표로 구분)"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">스킬</label>
              <Input
                placeholder="예: Java,Spring (쉼표로 구분)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleSearch} className="gap-2">
              <Search size={16} />
              검색
            </Button>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <X size={16} />
              초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            총 <span className="font-semibold text-foreground">{data?.totalCount ?? 0}</span>명
          </p>

          {data?.users.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed text-center">
              <Users size={32} className="mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">검색 조건에 해당하는 사용자가 없습니다.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data?.users.map((u) => (
                <Card
                  key={u.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
                  onClick={() => router.push(`/hr/users/${u.id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={u.profileImage} alt={u.name} />
                        <AvatarFallback>{u.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>

                    {u.certificationNames.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">자격증</p>
                        <div className="flex flex-wrap gap-1">
                          {u.certificationNames.map((c) => (
                            <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {u.projectSkills.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">스킬</p>
                        <div className="flex flex-wrap gap-1">
                          {u.projectSkills.map((s) => (
                            <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {(data?.totalPages ?? 0) > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={(params.page ?? 0) === 0}
                onClick={() => handlePageChange((params.page ?? 0) - 1)}
              >
                이전
              </Button>
              {Array.from({ length: data!.totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={i === (params.page ?? 0) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(i)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={(params.page ?? 0) >= (data?.totalPages ?? 1) - 1}
                onClick={() => handlePageChange((params.page ?? 0) + 1)}
              >
                다음
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
