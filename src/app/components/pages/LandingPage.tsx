import { Link } from "react-router";
import {
  Camera,
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCourse } from "../CourseContext";
import { useState } from "react";

const announcementStyles = {
  info: {
    bg: "bg-blue-500/10 border-blue-500/20",
    text: "text-blue-300",
    icon: Info,
  },
  warning: {
    bg: "bg-amber-500/10 border-amber-500/20",
    text: "text-amber-300",
    icon: AlertTriangle,
  },
  success: {
    bg: "bg-emerald-500/10 border-emerald-500/20",
    text: "text-emerald-300",
    icon: CheckCircle2,
  },
};

export function LandingPage() {
  const { courseInfo, sessions, getProgress, getCurrentSession, loading } = useCourse();
  const currentSession = getCurrentSession();
  const progress = getProgress();
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-500" />
          <p className="text-[0.85rem] text-white/30">Kursdaten werden geladen...</p>
        </div>
      </div>
    );
  }

  const showAnnouncement =
    !announcementDismissed &&
    courseInfo.announcement &&
    courseInfo.announcement.trim().length > 0 &&
    courseInfo.announcementType &&
    courseInfo.announcementType in announcementStyles;

  const announcementStyle = courseInfo.announcementType
    ? announcementStyles[courseInfo.announcementType as keyof typeof announcementStyles]
    : null;

  return (
    <div>
      {/* Announcement Banner (editable in Storyblok) */}
      <AnimatePresence>
        {showAnnouncement && announcementStyle && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={`border-b ${announcementStyle.bg}`}>
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                  <announcementStyle.icon className={`h-4 w-4 flex-shrink-0 ${announcementStyle.text}`} />
                  <p className={`text-[0.82rem] ${announcementStyle.text}`}>
                    {courseInfo.announcement}
                  </p>
                </div>
                <button
                  onClick={() => setAnnouncementDismissed(true)}
                  className="flex-shrink-0 rounded-lg p-1 text-white/30 transition-colors hover:bg-white/5 hover:text-white/60"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src={courseInfo.heroImage}
            alt="Digital Photography"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/70 via-[#0a0a0f]/80 to-[#0a0a0f]" />
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            {/* Badge (editable: heroBadgeText or falls back to semester) */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-[0.75rem] text-violet-300">
                {courseInfo.heroBadgeText || courseInfo.semester}
              </span>
            </div>

            <h1 className="mb-4 text-[2.5rem] tracking-tight text-white sm:text-[3.2rem]" style={{ lineHeight: 1.1 }}>
              {courseInfo.title}
            </h1>

            {courseInfo.subtitle && (
              <p className="mb-2 text-[1.1rem] text-violet-300/70">{courseInfo.subtitle}</p>
            )}

            <p className="mb-8 max-w-lg text-[1rem] text-white/50" style={{ lineHeight: 1.7 }}>
              {courseInfo.description}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/kursplan"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-[0.85rem] text-white transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-violet-500/20"
              >
                <BookOpen className="h-4 w-4" />
                {courseInfo.ctaPrimaryText || "Zum Kursplan"}
                <ArrowRight className="h-4 w-4" />
              </Link>

              {currentSession && (
                <Link
                  to={`/kursplan/${currentSession.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-[0.85rem] text-white/70 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  {courseInfo.ctaSecondaryText || "Aktuelle Session"} →
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Course Info Cards */}
      <section className="relative -mt-4 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Calendar, label: "Zeitraum", value: courseInfo.schedule },
            { icon: MapPin, label: "Raum", value: courseInfo.room },
            { icon: GraduationCap, label: "Credits", value: courseInfo.credits },
            { icon: Clock, label: "Sessions", value: `${sessions.length} Kurstermine` },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
                <item.icon className="h-4.5 w-4.5 text-white/40" />
              </div>
              <p className="mb-0.5 text-[0.7rem] text-white/30 uppercase tracking-wider">{item.label}</p>
              <p className="text-[0.85rem] text-white/80">{item.value}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Progress + Instructor Section */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 lg:col-span-2"
          >
            <h3 className="mb-4 text-[0.8rem] text-white/40 uppercase tracking-wider">
              {courseInfo.sectionTitleProgress || "Kursfortschritt"}
            </h3>
            
            {/* Progress bar */}
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
              />
            </div>
            <p className="mb-6 text-[0.8rem] text-white/40">
              {progress}% abgeschlossen · Session {sessions.findIndex(s => s.status === "current") + 1} von {sessions.length}
            </p>

            {/* Current session teaser */}
            {currentSession && (
              <Link
                to={`/kursplan/${currentSession.id}`}
                className="block rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 transition-all hover:border-violet-500/30 hover:bg-violet-500/10"
              >
                <p className="mb-1 text-[0.7rem] text-violet-400 uppercase tracking-wider">Aktuell</p>
                <p className="mb-1 text-[0.9rem] text-white/90">{currentSession.title}</p>
                <p className="text-[0.75rem] text-white/40">{currentSession.date}</p>
              </Link>
            )}
          </motion.div>

          {/* Instructor Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 lg:col-span-3"
          >
            <h3 className="mb-5 text-[0.8rem] text-white/40 uppercase tracking-wider">
              {courseInfo.sectionTitleInstructor || "Dozent"}
            </h3>
            
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-white/[0.06]">
                <img
                  src={courseInfo.instructorImage}
                  alt={courseInfo.instructorName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-[1.1rem] text-white/90">{courseInfo.instructorName}</h4>
                <p className="mb-3 text-[0.8rem] text-violet-400">{courseInfo.instructorTitle}</p>
                <p className="text-[0.85rem] text-white/40" style={{ lineHeight: 1.7 }}>
                  {courseInfo.instructorBio}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Course Highlights */}
      {courseInfo.highlights.length > 0 && (
        <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="mb-6 text-[0.8rem] text-white/40 uppercase tracking-wider">
              {courseInfo.sectionTitleHighlights || "Kurs-Highlights"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {courseInfo.highlights.map((highlight, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400/60" />
                  <span className="text-[0.85rem] text-white/60">{highlight}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Quick Access: Nächste Sessions */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[0.8rem] text-white/40 uppercase tracking-wider">
              {courseInfo.sectionTitleNextSessions || "Nächste Sessions"}
            </h2>
            <Link
              to="/kursplan"
              className="flex items-center gap-1 text-[0.8rem] text-violet-400 transition-colors hover:text-violet-300"
            >
              Alle anzeigen <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sessions
              .filter((s) => s.status === "current" || s.status === "upcoming")
              .slice(0, 3)
              .map((session) => (
                <Link
                  key={session.id}
                  to={`/kursplan/${session.id}`}
                  className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/10 hover:bg-white/[0.04]"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[0.7rem] text-white/40">
                      #{session.sessionNumber}
                    </span>
                    {session.status === "current" ? (
                      <span className="flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[0.65rem] text-violet-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                        Aktuell
                      </span>
                    ) : (
                      <span className="text-[0.7rem] text-white/25">{session.date}</span>
                    )}
                  </div>
                  <h3 className="mb-2 text-[0.9rem] text-white/80 transition-colors group-hover:text-white">
                    {session.title}
                  </h3>
                  <p className="text-[0.78rem] text-white/30 line-clamp-2" style={{ lineHeight: 1.6 }}>
                    {session.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-[0.75rem] text-violet-400/60 transition-colors group-hover:text-violet-400">
                    Details ansehen <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
