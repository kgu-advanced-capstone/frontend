"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useMe, useLogin, useLogout, useRegister } from "@/api/hooks/useAuth";
import type { UserResponse } from "@/api/types";

interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useMe();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const login = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return { success: true };
    } catch {
      return { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await registerMutation.mutateAsync({ name, email, password });
      return { success: true };
    } catch {
      return { success: false, error: "회원가입에 실패했습니다. 이미 존재하는 이메일일 수 있습니다." };
    }
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
