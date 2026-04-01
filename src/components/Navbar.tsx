"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, Bell, CheckCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import * as notificationApi from "@/api/generated/notification/notification";
import { cn, getProfileImageUrl } from "@/lib/utils";

const navLinks = [
  { href: "/projects", label: "프로젝트 매칭" },
  { href: "/my-projects", label: "프로젝트 관리" },
  { href: "/resume", label: "AI 이력서" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { data: notifications = [] } = notificationApi.useGetNotifications({
    query: {
      select: (res) => res.data,
      enabled: !!user, // 로그인한 경우에만 알림 조회
    }
  });
  const markAsRead = notificationApi.useMarkAsRead();
  const markAllAsRead = notificationApi.useMarkAllAsRead();
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
  };

  const profileImageUrl = getProfileImageUrl(user?.profileImage);

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

          {/* 알림 */}
          <Popover>
            <PopoverTrigger className="relative p-1">
              <Bell size={20} className="text-muted-foreground hover:text-foreground transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <p className="text-sm font-semibold">알림</p>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => markAllAsRead.mutate()}
                  >
                    <CheckCheck size={14} className="mr-1" />
                    모두 읽음
                  </Button>
                )}
              </div>
              <ScrollArea className="max-h-64">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                    알림이 없습니다.
                  </p>
                ) : (
                  <div className="divide-y">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        className={cn(
                          "w-full px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50",
                          !n.read && "bg-primary/5"
                        )}
                        onClick={() => n.id && markAsRead.mutate({ id: n.id })}
                      >
                        <p className={cn("leading-snug", !n.read && "font-medium")}>
                          {n.message}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {n.time}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-muted"
              >
                <Avatar className="h-7 w-7">
                  {profileImageUrl ? (
                    <AvatarImage src={profileImageUrl} alt={user.name || ""} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {user.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.name}</span>
              </Link>
              <Button size="sm" variant="ghost" onClick={handleLogout}>
                <LogOut size={16} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                로그인
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                회원가입
              </Link>
            </div>
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
            <div className="mt-2 space-y-2">
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                  pathname === "/profile"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Avatar className="h-6 w-6">
                  {profileImageUrl ? (
                    <AvatarImage src={profileImageUrl} alt={user.name || ""} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                    {user.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                프로필 수정
              </Link>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{user.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  로그아웃
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                로그인
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className={cn(buttonVariants({ size: "sm" }))}
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
