"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getMeQueryKey } from "@/api/generated/auth/auth";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    const hash = window.location.hash;
    const token = hash.startsWith("#token=") ? hash.slice("#token=".length) : "";

    if (token) {
      localStorage.setItem("accessToken", token);
      qc.invalidateQueries({ queryKey: getMeQueryKey() });
    }

    router.replace("/");
  }, [router, qc]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">로그인 처리 중...</p>
      </div>
    </div>
  );
}
