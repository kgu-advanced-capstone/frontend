"use client";

import { createContext, useContext, type ReactNode, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as auth from "@/api/generated/auth/auth";
import type { UserResponse } from "@/api/generated/model";

interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const router = useRouter();

  // useMe 쿼리: 현재 사용자 정보 로드
  const { data: user, isLoading, refetch } = auth.useMe({
    query: {
      select: (res) => res?.data as UserResponse,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    }
  });
  
  const loginMutation = auth.useLogin();
  const registerMutation = auth.useRegister();
  const logoutMutation = auth.useLogout();

  const login = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ data: { email, password } });
      // 로그인 성공 시 세션 쿠키가 생성되므로, me 정보를 다시 가져옴
      await refetch();
      return { success: true };
    } catch (err) {
      const e = err as { response?: { status?: number } };
      return {
        success: false,
        error: e.response?.status === 401
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : "로그인 중 오류가 발생했습니다."
      };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      await registerMutation.mutateAsync({ data: { name, email, password, phone } });
      await refetch();
      return { success: true };
    } catch (err) {
      const e = err as { response?: { status?: number } };
      return {
        success: false,
        error: e.response?.status === 409
          ? "이미 존재하는 이메일입니다."
          : "회원가입에 실패했습니다."
      };
    }
  };

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // 서버 요청 성공 여부와 관계없이 클라이언트 상태는 초기화
      qc.setQueryData(auth.getMeQueryKey(), null);
      qc.clear(); // 모든 쿼리 캐시 삭제 (중요: 다른 유저의 데이터가 남지 않도록)
      router.push("/");
    }
  }, [logoutMutation, qc, router]);

  return (
    <AuthContext.Provider value={{ 
      user: user ?? null, 
      isLoading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
