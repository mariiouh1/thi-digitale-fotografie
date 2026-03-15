import { Link } from "react-router";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  ArrowRight,
  FileText,
  Download,
  Radio,
  ClipboardList,
  Target,
  BookOpen,
  Tag,
} from "lucide-react";
import { motion } from "motion/react";
import { useCourse } from "../CourseContext";

export function CoursePlanPage() {
  const { sessions, getProgress, getCompletedCount, loading } = useCourse();
  const progress = getProgress();
  const completed = getCompletedCount();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-500" />
          <p className="text-[0.85rem] text-white/30">Kursplan wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="mb-2 text-[1.8rem] tracking-tight text-white sm:text-[2.2rem]" style={{ lineHeight: 1.15 }}>
          Kursplan
        </h1>
        <p className="mb-6 text-[0.9rem] text-white/40">
          {sessions.length} Sessions · {completed} abgeschlossen
        </p>

        {/* Progress bar */}
        <div className="flex items-center gap-4">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
            />
          </div>
          <span className="text-[0.8rem] text-white/30">{progress}%</span>
        </div>
      </motion.div>

      {/* Session List */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[1.05rem] top-2 bottom-2 w-px bg-white/[0.06] sm:left-[1.55rem]" />

        <div className="flex flex-col gap-2">
          {sessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
            >
              <Link
                to={`/kursplan/${session.id}`}
                className="group flex gap-4 rounded-2xl border border-transparent p-3 transition-all hover:border-white/[0.06] hover:bg-white/[0.02] sm:gap-5 sm:p-4"
              >
                {/* Timeline dot */}
                <div className="relative z-10 mt-1 flex flex-shrink-0 items-start justify-center">
                  {session.status === "completed" ? (
                    <CheckCircle2 className="h-[1.1rem] w-[1.1rem] text-emerald-400/70 sm:h-5 sm:w-5" />
                  ) : session.status === "current" ? (
                    <div className="relative">
                      <Radio className="h-[1.1rem] w-[1.1rem] text-violet-400 sm:h-5 sm:w-5" />
                      <span className="absolute -inset-1 animate-ping rounded-full bg-violet-400/20" />
                    </div>
                  ) : (
                    <Circle className="h-[1.1rem] w-[1.1rem] text-white/15 sm:h-5 sm:w-5" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-[0.7rem] text-white/25">#{session.sessionNumber}</span>
                    <span className="text-[0.7rem] text-white/25">·</span>
                    <span className="flex items-center gap-1 text-[0.7rem] text-white/25">
                      <Calendar className="h-3 w-3" />
                      {session.date}
                    </span>
                    <span className="text-[0.7rem] text-white/25">·</span>
                    <span className="flex items-center gap-1 text-[0.7rem] text-white/25">
                      <Clock className="h-3 w-3" />
                      {session.time}
                    </span>
                    <span className="text-[0.7rem] text-white/25">·</span>
                    <span className="flex items-center gap-1 text-[0.7rem] text-white/25">
                      <MapPin className="h-3 w-3" />
                      {session.room}
                    </span>
                    {session.status === "current" && (
                      <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[0.6rem] text-violet-400">
                        Aktuell
                      </span>
                    )}
                  </div>

                  <h3
                    className={`mb-1 text-[0.9rem] transition-colors group-hover:text-white sm:text-[0.95rem] ${
                      session.status === "completed"
                        ? "text-white/40"
                        : session.status === "current"
                        ? "text-white"
                        : "text-white/70"
                    }`}
                  >
                    {session.title}
                  </h3>

                  {/* Schwerpunkt */}
                  {session.schwerpunkt && (
                    <p className="mb-1.5 flex items-center gap-1.5 text-[0.72rem] text-indigo-400/50">
                      <Tag className="h-3 w-3" />
                      {session.schwerpunkt}
                    </p>
                  )}

                  {/* Indicators row */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Project submission */}
                    {session.projectSubmission && session.projectSubmission !== "–" && (
                      <span className="flex items-center gap-1 text-[0.68rem] text-amber-400/50">
                        <Target className="h-3 w-3" />
                        {session.projectSubmission}
                      </span>
                    )}

                    {/* Homework indicator */}
                    {session.homework && (
                      <span className="flex items-center gap-1 text-[0.68rem] text-amber-300/40">
                        <ClipboardList className="h-3 w-3" />
                        {session.homework.number}: {session.homework.title}
                      </span>
                    )}

                    {/* Tutorials indicator */}
                    {session.tutorials.length > 0 && (
                      <span className="flex items-center gap-1 text-[0.68rem] text-blue-400/40">
                        <BookOpen className="h-3 w-3" />
                        {session.tutorials.length} Tutorial{session.tutorials.length !== 1 ? "s" : ""}
                      </span>
                    )}

                    {/* Materials indicator */}
                    {session.materials.length > 0 && (
                      <span className="flex items-center gap-1 text-[0.68rem] text-white/20">
                        <FileText className="h-3 w-3" />
                        {session.materials.length} Material{session.materials.length !== 1 ? "ien" : ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center">
                  <ArrowRight className="h-4 w-4 text-white/10 transition-all group-hover:translate-x-0.5 group-hover:text-white/30" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
