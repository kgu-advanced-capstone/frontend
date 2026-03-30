"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Github, Globe, Check, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/api/hooks/useProfile";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [github, setGithub] = useState("");
  const [blog, setBlog] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [initialized, setInitialized] = useState(false);

  // 프로필 데이터 로드 후 폼 초기화
  useEffect(() => {
    if (profile && !initialized) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setGithub(profile.github || "");
      setBlog(profile.blog || "");
      setProfileImage(profile.profileImage || "");
      setInitialized(true);
    }
  }, [profile, initialized]);

  if (!user) {
    router.push("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: name || undefined,
      phone: phone || undefined,
      github: github || undefined,
      blog: blog || undefined,
      profileImage: profileImage || undefined,
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">프로필 설정</h1>
        <p className="mt-2 text-muted-foreground">
          프로필 정보를 관리하세요. 이력서 생성 시 기본 정보로 사용됩니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 프로필 이미지 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">프로필 사진</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              {profileImage ? (
                <AvatarImage src={profileImage} alt={name} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                {name?.[0] || user.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label className="mb-2 block text-sm">이미지 URL</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ImagePlus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="pl-10"
                    maxLength={500}
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                프로필 사진 URL을 입력하세요.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  className="pl-10"
                  minLength={2}
                  maxLength={50}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                  className="pl-10 bg-muted"
                />
              </div>
              <p className="text-xs text-muted-foreground">이메일은 변경할 수 없습니다.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-1234-5678"
                  className="pl-10"
                  maxLength={20}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 링크 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">외부 링크</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <div className="relative">
                <Github size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="github"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className="pl-10"
                  maxLength={200}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blog">블로그</Label>
              <div className="relative">
                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="blog"
                  value={blog}
                  onChange={(e) => setBlog(e.target.value)}
                  placeholder="https://blog.example.com"
                  className="pl-10"
                  maxLength={200}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* 저장 */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                저장 중...
              </div>
            ) : (
              "프로필 저장"
            )}
          </Button>
          {updateMutation.isSuccess && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Check size={14} />
              저장되었습니다
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
