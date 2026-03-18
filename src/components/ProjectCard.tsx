"use client";

import Link from "next/link";
import { Users, Calendar, Tag } from "lucide-react";
import type { Project } from "@/data/dummy";

interface ProjectCardProps {
  project: Project;
  onJoin?: (id: number) => void;
}

export default function ProjectCard({ project, onJoin }: ProjectCardProps) {
  const isFull = project.currentMembers >= project.maxMembers;

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
          {project.category}
        </span>
        {isFull && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
            마감
          </span>
        )}
      </div>

      <Link href={`/projects/${project.id}`} className="group">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
          {project.title}
        </h3>
      </Link>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">
        {project.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.skills.map((skill) => (
          <span
            key={skill}
            className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600"
          >
            <Tag size={10} />
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users size={14} />
            {project.currentMembers}/{project.maxMembers}명
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            ~{project.deadline}
          </span>
        </div>

        <button
          onClick={() => onJoin?.(project.id)}
          disabled={isFull}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            isFull
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isFull ? "마감" : "참가"}
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        {project.author} · {project.createdAt}
      </p>
    </div>
  );
}
