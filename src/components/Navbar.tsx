"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/projects", label: "프로젝트 매칭" },
  { href: "/resume", label: "AI 이력서" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold text-primary">
          Buildi
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={logout}>
                <LogOut size={16} />
              </Button>
            </div>
          ) : (
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              로그인
            </Link>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-background px-6 py-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 text-sm font-medium ${
                pathname.startsWith(link.href)
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
              >
                <LogOut size={16} />
                로그아웃
              </Button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className={cn(buttonVariants({ size: "sm" }), "mt-2 w-full")}
            >
              로그인
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
