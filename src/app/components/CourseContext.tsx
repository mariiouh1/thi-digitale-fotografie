import { createContext, useContext, type ReactNode } from "react";
import {
  useStoryblokData,
  getProgressPercentFromList,
  getCompletedCountFromList,
  getCurrentSessionFromList,
  getSessionByIdFromList,
} from "./storyblok-api";
import type { CourseInfo, CourseSession } from "./course-data";

interface CourseContextValue {
  courseInfo: CourseInfo;
  sessions: CourseSession[];
  loading: boolean;
  error: string | null;
  isLive: boolean;
  getProgress: () => number;
  getCompletedCount: () => number;
  getCurrentSession: () => CourseSession | undefined;
  getSessionById: (id: string) => CourseSession | undefined;
}

const CourseContext = createContext<CourseContextValue | null>(null);

export function CourseProvider({ children }: { children: ReactNode }) {
  const { courseInfo, sessions, loading, error, isLive } = useStoryblokData();

  const value: CourseContextValue = {
    courseInfo,
    sessions,
    loading,
    error,
    isLive,
    getProgress: () => getProgressPercentFromList(sessions),
    getCompletedCount: () => getCompletedCountFromList(sessions),
    getCurrentSession: () => getCurrentSessionFromList(sessions),
    getSessionById: (id: string) => getSessionByIdFromList(sessions, id),
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export function useCourse(): CourseContextValue {
  const ctx = useContext(CourseContext);
  if (!ctx) {
    throw new Error("useCourse must be used within CourseProvider");
  }
  return ctx;
}
