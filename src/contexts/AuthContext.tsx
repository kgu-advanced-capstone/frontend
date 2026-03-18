"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DUMMY_USERS = [
  { email: "test@buildi.com", password: "1234", name: "홍길동" },
  { email: "user@buildi.com", password: "1234", name: "김빌디" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    // 더미 로그인 지연
    await new Promise((r) => setTimeout(r, 800));

    const found = DUMMY_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (found) {
      setUser({ email: found.email, name: found.name });
      return { success: true };
    }

    return { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
