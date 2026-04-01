import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to ensure profile image URL is correct (handles relative paths)
export function getProfileImageUrl(url: string | null | undefined) {
  if (!url) return null;
  // If it's already an absolute URL or data URL, return it as is
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  
  // If it starts with /api, it's already set up for our proxy
  if (url.startsWith("/api")) return url;
  
  // For relative paths, we prefix with /api to use the Next.js rewrite/proxy
  // This ensures the request goes to the backend server
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `/api${cleanUrl}`;
}
