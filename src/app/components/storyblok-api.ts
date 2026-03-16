/**
 * Storyblok Content Delivery API Integration
 * 
 * Fetcht Live-Content aus Storyblok und transformiert ihn
 * in die App-Datenstrukturen. Fallback auf lokale Dummy-Daten
 * falls kein Token konfiguriert ist oder API nicht erreichbar.
 * 
 * SETUP:
 *   1. Storyblok → Settings → Access Tokens → "Public" Token erstellen
 *   2. Vercel → Settings → Environment Variables:
 *      Key:   VITE_STORYBLOK_TOKEN
 *      Value: dein Public Token
 *   3. Lokal: .env Datei mit VITE_STORYBLOK_TOKEN=xxx
 */

import { useState, useEffect } from "react";
import type { CourseInfo, CourseSessionRaw, CourseSession, CourseMaterial, CourseTutorial, CourseHomework } from "./course-data";
import {
  courseInfo as fallbackCourseInfo,
  courseSessions as fallbackSessions,
} from "./course-data";

// ============================================================
// CONFIG
// ============================================================

const STORYBLOK_TOKEN = import.meta.env.VITE_STORYBLOK_TOKEN || "";
const STORYBLOK_API = "https://api.storyblok.com/v2/cdn";
const STORYBLOK_VERSION = "published"; // "draft" for preview, "published" for live

function isConfigured(): boolean {
  return STORYBLOK_TOKEN.length > 0 && STORYBLOK_TOKEN !== "DEIN_TOKEN_HIER";
}

// ============================================================
// API FETCH HELPER
// ============================================================

async function fetchFromStoryblok(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const searchParams = new URLSearchParams({
    token: STORYBLOK_TOKEN,
    version: STORYBLOK_VERSION,
    cv: Date.now().toString(), // Cache-Busting: immer frische Daten nach Publish
    ...params,
  });

  const url = `${STORYBLOK_API}${endpoint}?${searchParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Storyblok API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ============================================================
// DATA TRANSFORMERS – Storyblok → App-Datenstruktur
// ============================================================

function transformCourseInfo(story: any): CourseInfo {
  const c = story.content;
  return {
    title: c.title || "",
    subtitle: c.subtitle || "",
    description: c.description || "",
    instructorName: c.instructor_name || "",
    instructorTitle: c.instructor_title || "",
    instructorImage: c.instructor_image || "",
    instructorBio: c.instructor_bio || "",
    semester: c.semester || "",
    schedule: c.schedule || "",
    room: c.room || "",
    credits: c.credits || "",
    heroImage: c.hero_image || "",
    // Highlights kommen als Textarea mit \n-Trennung aus Storyblok
    highlights: (c.highlights || "")
      .split("\n")
      .map((h: string) => h.trim())
      .filter((h: string) => h.length > 0),
    // Landing Page Controls
    heroBadgeText: c.hero_badge_text || "",
    ctaPrimaryText: c.cta_primary_text || "Zum Kursplan",
    ctaSecondaryText: c.cta_secondary_text || "Aktuelle Session",
    announcement: c.announcement || "",
    announcementType: c.announcement_type || "",
    sectionTitleProgress: c.section_title_progress || "Kursfortschritt",
    sectionTitleInstructor: c.section_title_instructor || "Dozent",
    sectionTitleHighlights: c.section_title_highlights || "Kurs-Highlights",
    sectionTitleNextSessions: c.section_title_next_sessions || "Nächste Sessions",
    // Gallery
    galleryFolderId: c.gallery_folder_id || "",
    galleryPassword: c.gallery_password || "",
  };
}

function transformMaterial(block: any): CourseMaterial {
  return {
    name: block.name || "",
    url: block.url || "#",
    type: block.type || "pdf",
    size: block.size || undefined,
  };
}

function transformTutorial(block: any): CourseTutorial {
  return {
    title: block.title || "",
    url: block.url || "#",
    type: block.type || "YouTube Video",
    duration: block.duration || "",
    language: block.language || "Deutsch",
    whenToUse: block.when_to_use || "",
  };
}

function transformHomework(c: any): CourseHomework | null {
  if (!c.homework_title) return null;
  return {
    number: c.homework_number || "",
    title: c.homework_title || "",
    deadline: c.homework_deadline || "",
    goal: c.homework_goal || "",
    description: c.homework_description || "",
    format: c.homework_format || "",
    learningFocus: c.homework_learning_focus || "",
  };
}

type SessionStatus = "upcoming" | "completed" | "current";

function parseGermanDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split(".").map(Number);
  return new Date(year, month - 1, day);
}

function calculateStatuses(sessions: CourseSessionRaw[]): CourseSession[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sorted = [...sessions].sort(
    (a, b) => parseGermanDate(a.date).getTime() - parseGermanDate(b.date).getTime()
  );

  let currentFound = false;
  return sorted.map((session) => {
    const sessionDate = parseGermanDate(session.date);
    let status: SessionStatus;

    if (sessionDate < today && !currentFound) {
      status = "completed";
    } else if (!currentFound) {
      status = "current";
      currentFound = true;
    } else {
      status = "upcoming";
    }

    return { ...session, status };
  });
}

function transformSession(story: any): CourseSessionRaw {
  const c = story.content;
  return {
    id: story.slug || story.uuid,
    sessionNumber: Number(c.session_number) || 0,
    date: c.date || "",
    time: c.time || "09:55-13:05",
    room: c.room || "K115",
    title: c.title || "",
    description: c.description || "",
    schwerpunkt: c.schwerpunkt || "",
    // Topics kommen als Textarea mit \n-Trennung
    topics: (c.topics || "")
      .split("\n")
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0),
    projectSubmission: c.project_submission || "–",
    homework: transformHomework(c),
    tutorials: (c.tutorials || []).map(transformTutorial),
    materials: (c.materials || []).map(transformMaterial),
    galleryFolderId: c.gallery_folder_id || "",
  };
}

// ============================================================
// DATA FETCHERS
// ============================================================

async function fetchCourseInfo(): Promise<CourseInfo> {
  const data = await fetchFromStoryblok("/stories", {
    starts_with: "kursportal/",
    content_type: "course_info",
    per_page: "1",
  });

  if (data.stories && data.stories.length > 0) {
    return transformCourseInfo(data.stories[0]);
  }

  throw new Error("Keine Kurs-Informationen gefunden");
}

async function fetchSessions(): Promise<CourseSession[]> {
  const data = await fetchFromStoryblok("/stories", {
    starts_with: "kursportal/sessions/",
    content_type: "course_session",
    per_page: "100",
    sort_by: "content.session_number:asc",
  });

  if (data.stories && data.stories.length > 0) {
    const rawSessions = data.stories.map(transformSession);
    return calculateStatuses(rawSessions);
  }

  throw new Error("Keine Sessions gefunden");
}

// ============================================================
// REACT HOOKS
// ============================================================

interface StoryblokDataState {
  courseInfo: CourseInfo;
  sessions: CourseSession[];
  loading: boolean;
  error: string | null;
  isLive: boolean; // true wenn Daten aus Storyblok kommen
}

/**
 * Main Hook – lädt Kursinfo + Sessions aus Storyblok.
 * Fällt automatisch auf lokale Dummy-Daten zurück.
 */
export function useStoryblokData(): StoryblokDataState {
  const [state, setState] = useState<StoryblokDataState>({
    courseInfo: fallbackCourseInfo,
    sessions: fallbackSessions,
    loading: isConfigured(),
    error: null,
    isLive: false,
  });

  useEffect(() => {
    if (!isConfigured()) {
      console.log(
        "[Storyblok] Kein Token konfiguriert → verwende Fallback-Daten.\n" +
          "Setze VITE_STORYBLOK_TOKEN in Vercel Environment Variables."
      );
      return;
    }

    let cancelled = false;

    async function loadData() {
      try {
        const [info, sessions] = await Promise.all([
          fetchCourseInfo(),
          fetchSessions(),
        ]);

        if (!cancelled) {
          setState({
            courseInfo: info,
            sessions,
            loading: false,
            error: null,
            isLive: true,
          });
          console.log("[Storyblok] ✅ Live-Daten geladen");
        }
      } catch (err) {
        console.warn("[Storyblok] ⚠️ API-Fehler, verwende Fallback-Daten:", err);
        if (!cancelled) {
          setState({
            courseInfo: fallbackCourseInfo,
            sessions: fallbackSessions,
            loading: false,
            error: err instanceof Error ? err.message : "Unknown error",
            isLive: false,
          });
        }
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  return state;
}

/**
 * Helper-Funktionen die auf den Hook-State arbeiten
 */
export function getSessionByIdFromList(sessions: CourseSession[], id: string): CourseSession | undefined {
  return sessions.find((s) => s.id === id);
}

export function getCurrentSessionFromList(sessions: CourseSession[]): CourseSession | undefined {
  return sessions.find((s) => s.status === "current");
}

export function getCompletedCountFromList(sessions: CourseSession[]): number {
  return sessions.filter((s) => s.status === "completed").length;
}

export function getProgressPercentFromList(sessions: CourseSession[]): number {
  if (sessions.length === 0) return 0;
  return Math.round((getCompletedCountFromList(sessions) / sessions.length) * 100);
}