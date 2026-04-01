"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
  Phone,
  Github,
  Globe,
  Check,
  ImagePlus,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import * as authApi from "@/api/generated/auth/auth";
import * as profileApi from "@/api/generated/profile/profile";
import type { ProfileResponse } from "@/api/generated/model";
import { getProfileImageUrl } from "@/lib/utils";

interface FormState {
  name: string;
  phone: string;
  github: string;
  blog: string;
  profileImage: string | null; // Preview URL
  imageFile: File | null;
}

interface FormErrors {
  name?: string;
  phone?: string;
  github?: string;
  blog?: string;
}

function profileToForm(profile: ProfileResponse): FormState {
  return {
    name: profile.name || "",
    phone: profile.phone || "",
    github: profile.github || "",
    blog: profile.blog || "",
    profileImage: profile.profileImage || null,
    imageFile: null,
  };
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "이름을 입력해주세요.";
  } else if (form.name.trim().length < 2) {
    errors.name = "이름은 2자 이상이어야 합니다.";
  }

  if (form.phone && !/^[\d\-+() ]{0,20}$/.test(form.phone)) {
    errors.phone = "올바른 전화번호 형식이 아닙니다.";
  }

  if (form.github && !/^https?:\/\/.+/.test(form.github)) {
    errors.github = "URL 형식으로 입력해주세요. (https://...)";
  }

  if (form.blog && !/^https?:\/\/.+/.test(form.blog)) {
    errors.blog = "URL 형식으로 입력해주세요. (https://...)";
  }

  return errors;
}

function ProfileForm({ profile, userName }: { profile: ProfileResponse; userName: string }) {
  const qc = useQueryClient();
  const updateMutation = profileApi.useUpdateProfile({
    mutation: {
      onSuccess: (res) => {
        // 프로필 이미지가 변경될 수 있으므로 /me 캐시 갱신
        if (res.status === 200) {
          qc.invalidateQueries({ queryKey: authApi.getMeQueryKey() });
        }
      },
    },
  });
  const snapshot = profileToForm(profile);

  const [form, setForm] = useState<FormState>(snapshot);
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty =
    form.name !== snapshot.name ||
    form.phone !== snapshot.phone ||
    form.github !== snapshot.github ||
    form.blog !== snapshot.blog ||
    form.imageFile !== null;

  const updateField = (field: keyof FormState, value: string | File | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field in errors && errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateField("imageFile", file);
      // 로컬 미리보기 URL 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField("profileImage", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setForm(snapshot);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
    updateMutation.reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    updateMutation.mutate({
      data: {
        request: {
          name: form.name.trim() || undefined,
          phone: form.phone.trim() || undefined,
          github: form.github.trim() || undefined,
          blog: form.blog.trim() || undefined,
        },
        profileImage: form.imageFile || undefined,
      }
    });
  };

  const profileImageUrl = getProfileImageUrl(form.profileImage);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 서버 에러 메시지 */}
      {updateMutation.isError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle size={20} />
          <p className="text-sm">프로필 저장에 실패했습니다. 잠시 후 다시 시도해주세요.</p>
        </div>
      )}

      {/* 프로필 이미지 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">프로필 사진</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            {profileImageUrl ? (
              <AvatarImage src={profileImageUrl} alt={form.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-2xl text-primary">
              {form.name?.[0] || userName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Label className="block text-sm">프로필 사진 업로드</Label>
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus size={16} className="mr-2" />
                파일 선택
              </Button>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              {form.imageFile && (
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {form.imageFile.name}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              새로운 프로필 사진을 업로드하세요. (JPG, PNG 등)
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
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="홍길동"
                className="pl-10"
                minLength={2}
                maxLength={50}
                aria-invalid={!!errors.name}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="email"
                value={profile.email}
                disabled
                className="pl-10 bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground">이메일은 변경할 수 없습니다.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">전화번호</Label>
            <div className="relative">
              <Phone
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="010-1234-5678"
                className="pl-10"
                maxLength={20}
                aria-invalid={!!errors.phone}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
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
              <Github
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="github"
                value={form.github}
                onChange={(e) => updateField("github", e.target.value)}
                placeholder="https://github.com/username"
                className="pl-10"
                maxLength={200}
                aria-invalid={!!errors.github}
              />
            </div>
            {errors.github && (
              <p className="text-xs text-destructive">{errors.github}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="blog">블로그</Label>
            <div className="relative">
              <Globe
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="blog"
                value={form.blog}
                onChange={(e) => updateField("blog", e.target.value)}
                placeholder="https://blog.example.com"
                className="pl-10"
                maxLength={200}
                aria-invalid={!!errors.blog}
              />
            </div>
            {errors.blog && (
              <p className="text-xs text-destructive">{errors.blog}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* 저장 / 취소 */}
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
        {isDirty && (
          <Button type="button" variant="outline" onClick={handleReset}>
            <RotateCcw size={14} className="mr-1" />
            되돌리기
          </Button>
        )}
        {updateMutation.isSuccess && !isDirty && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <Check size={14} />
            저장되었습니다
          </span>
        )}
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: profile, isLoading, error: profileError } = profileApi.useGetProfile({
    query: {
      select: (res) => res.data,
    }
  });

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

  if (profileError || !profile) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle size={20} />
          <p className="text-sm">프로필을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">프로필 설정</h1>
        <p className="mt-2 text-muted-foreground">
          프로필 정보를 관리하세요. 이력서 생성 시 기본 정보로 사용됩니다.
        </p>
      </div>

      <ProfileForm key={profile.email} profile={profile} userName={user.name || ""} />
    </div>
  );
}
