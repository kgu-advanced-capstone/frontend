"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { projects as allProjects, type Project } from "@/data/dummy";

export interface JoinedProject {
  project: Project;
  joinedAt: string;
  markdown: string;
  summary: string | null;
}

export interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

interface ProjectContextType {
  joinedProjects: JoinedProject[];
  createdProjects: Project[];
  notifications: Notification[];
  joinProject: (id: number) => void;
  leaveProject: (id: number) => void;
  isJoined: (id: number) => boolean;
  updateMarkdown: (projectId: number, markdown: string) => void;
  updateSummary: (projectId: number, summary: string) => void;
  createProject: (data: Omit<Project, "id" | "createdAt" | "currentMembers">) => void;
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  unreadCount: number;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

let nextProjectId = 100;
let nextNotifId = 1;

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [joinedProjects, setJoinedProjects] = useState<JoinedProject[]>([]);
  const [createdProjects, setCreatedProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string) => {
    setNotifications((prev) => [
      {
        id: nextNotifId++,
        message,
        time: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const joinProject = useCallback(
    (id: number) => {
      const project =
        allProjects.find((p) => p.id === id) ||
        createdProjects.find((p) => p.id === id);
      if (!project) return;

      setJoinedProjects((prev) => {
        if (prev.some((jp) => jp.project.id === id)) return prev;
        return [
          ...prev,
          {
            project,
            joinedAt: new Date().toISOString().slice(0, 10),
            markdown: "",
            summary: null,
          },
        ];
      });

      addNotification(`"${project.title}" 프로젝트에 참가했습니다.`);
    },
    [createdProjects, addNotification]
  );

  const leaveProject = useCallback(
    (id: number) => {
      const jp = joinedProjects.find((j) => j.project.id === id);
      setJoinedProjects((prev) => prev.filter((j) => j.project.id !== id));
      if (jp) {
        addNotification(`"${jp.project.title}" 프로젝트에서 탈퇴했습니다.`);
      }
    },
    [joinedProjects, addNotification]
  );

  const isJoined = useCallback(
    (id: number) => joinedProjects.some((jp) => jp.project.id === id),
    [joinedProjects]
  );

  const updateMarkdown = useCallback((projectId: number, markdown: string) => {
    setJoinedProjects((prev) =>
      prev.map((jp) =>
        jp.project.id === projectId ? { ...jp, markdown } : jp
      )
    );
  }, []);

  const updateSummary = useCallback(
    (projectId: number, summary: string) => {
      setJoinedProjects((prev) =>
        prev.map((jp) =>
          jp.project.id === projectId ? { ...jp, summary } : jp
        )
      );
      const jp = joinedProjects.find((j) => j.project.id === projectId);
      if (jp) {
        addNotification(
          `"${jp.project.title}" AI 요약이 완료되었습니다.`
        );
      }
    },
    [joinedProjects, addNotification]
  );

  const createProject = useCallback(
    (data: Omit<Project, "id" | "createdAt" | "currentMembers">) => {
      const newProject: Project = {
        ...data,
        id: nextProjectId++,
        currentMembers: 1,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setCreatedProjects((prev) => [newProject, ...prev]);
      // 자동으로 참가
      setJoinedProjects((prev) => [
        ...prev,
        {
          project: newProject,
          joinedAt: newProject.createdAt,
          markdown: "",
          summary: null,
        },
      ]);
      addNotification(`"${newProject.title}" 프로젝트를 생성했습니다.`);
    },
    [addNotification]
  );

  const markNotificationRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <ProjectContext.Provider
      value={{
        joinedProjects,
        createdProjects,
        notifications,
        joinProject,
        leaveProject,
        isJoined,
        updateMarkdown,
        updateSummary,
        createProject,
        markNotificationRead,
        markAllNotificationsRead,
        unreadCount,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectProvider");
  return ctx;
}
