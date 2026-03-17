import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Download,
  ExternalLink,
  Video,
  Archive,
  CheckCircle2,
  Circle,
  Radio,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ClipboardList,
  Target,
  Tag,
  Play,
  Globe,
} from "lucide-react";
import { motion } from "motion/react";
import { useCourse } from "../CourseContext";
import type { CourseMaterial } from "../course-data";
import { Gallery } from "../Gallery";

function getMaterialIcon(type: CourseMaterial["type"]) {
  switch (type) {
    case "pdf":
      return FileText;
    case "zip":
      return Archive;
    case "video":
      return Video;
    case "link":
      return ExternalLink;
    default:
      return FileText;
  }
}

function getMaterialColor(type: CourseMaterial["type"]) {
  switch (type) {
    case "pdf":
      return "text-red-400/70 bg-red-400/10";
    case "zip":
      return "text-amber-400/70 bg-amber-400/10";
    case "video":
      return "text-blue-400/70 bg-blue-400/10";
    case "link":
      return "text-emerald-400/70 bg-emerald-400/10";
    default:
      return "text-white/40 bg-white/5";
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[0.7rem] text-emerald-400">
          <CheckCircle2 className="h-3 w-3" /> Abgeschlossen
        </span>
      );
    case "current":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-[0.7rem] text-violet-400">
          <Radio className="h-3 w-3" /> Aktuelle Session
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[0.7rem] text-white/30">
          <Circle className="h-3 w-3" /> Demnächst
        </span>
      );
  }
}

function getTutorialIcon(type: string) {
  if (type.toLowerCase().includes("youtube") || type.toLowerCase().includes("video")) return Play;
  if (type.toLowerCase().includes("blog") || type.toLowerCase().includes("artikel")) return Globe;
  return ExternalLink;
}

export function SessionDetailPage() {
  const { sessionId } = useParams();
  const { sessions, getSessionById, loading, courseInfo } = useCourse();
  const session = getSessionById(sessionId || "");

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-500" />
          <p className="text-[0.85rem] text-white/30">Session wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <h1 className="mb-4 text-[1.5rem] text-white/80">Session nicht gefunden</h1>
        <p className="mb-8 text-[0.9rem] text-white/40">
          Die angeforderte Kursstunde existiert nicht.
        </p>
        <Link
          to="/kursplan"
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-[0.85rem] text-white/70 transition-all hover:bg-white/15"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zum Kursplan
        </Link>
      </div>
    );
  }

  // Find prev/next sessions
  const currentIndex = sessions.findIndex((s) => s.id === session.id);
  const prevSession = currentIndex > 0 ? sessions[currentIndex - 1] : null;
  const nextSession = currentIndex < sessions.length - 1 ? sessions[currentIndex + 1] : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Back link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to="/kursplan"
          className="mb-6 inline-flex items-center gap-2 text-[0.8rem] text-white/30 transition-colors hover:text-white/60"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Kursplan
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-[0.75rem] text-white/40">
            Session #{session.sessionNumber}
          </span>
          <div className="flex items-center gap-1.5 text-[0.75rem] text-white/30">
            <Calendar className="h-3.5 w-3.5" />
            {session.date}
          </div>
          <div className="flex items-center gap-1.5 text-[0.75rem] text-white/30">
            <Clock className="h-3.5 w-3.5" />
            {session.time}
          </div>
          <div className="flex items-center gap-1.5 text-[0.75rem] text-white/30">
            <MapPin className="h-3.5 w-3.5" />
            {session.room}
          </div>
          {getStatusBadge(session.status)}
        </div>

        <h1 className="mb-3 text-[1.8rem] tracking-tight text-white sm:text-[2.2rem]" style={{ lineHeight: 1.15 }}>
          {session.title}
        </h1>

        {/* Schwerpunkt & Project badges */}
        <div className="flex flex-wrap gap-2">
          {session.schwerpunkt && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-[0.7rem] text-indigo-300">
              <Tag className="h-3 w-3" />
              {session.schwerpunkt}
            </span>
          )}
          {session.projectSubmission && session.projectSubmission !== "–" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[0.7rem] text-amber-300">
              <Target className="h-3 w-3" />
              {session.projectSubmission}
            </span>
          )}
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          {/* Description */}
          <div className="mb-8">
            <h2 className="mb-3 text-[0.8rem] text-white/40 uppercase tracking-wider">Beschreibung</h2>
            <p className="text-[0.9rem] text-white/60" style={{ lineHeight: 1.8 }}>
              {session.description}
            </p>
          </div>

          {/* Topics */}
          <div className="mb-8">
            <h2 className="mb-3 text-[0.8rem] text-white/40 uppercase tracking-wider">Themen</h2>
            <div className="flex flex-col gap-2">
              {session.topics.map((topic, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3"
                >
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-violet-500/10 text-[0.65rem] text-violet-400">
                    {i + 1}
                  </span>
                  <span className="text-[0.85rem] text-white/60">{topic}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Homework */}
          {session.homework && (
            <div className="mb-8">
              <h2 className="mb-3 flex items-center gap-2 text-[0.8rem] text-white/40 uppercase tracking-wider">
                <ClipboardList className="h-3.5 w-3.5" />
                Hausaufgabe: {session.homework.number}
              </h2>
              <div className="rounded-2xl border border-amber-500/10 bg-amber-500/[0.03] p-5">
                <h3 className="mb-2 text-[0.95rem] text-amber-200">{session.homework.title}</h3>
                <p className="mb-4 text-[0.85rem] text-white/50" style={{ lineHeight: 1.7 }}>
                  {session.homework.description}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white/[0.03] px-4 py-3">
                    <p className="mb-1 text-[0.65rem] text-white/25 uppercase tracking-wider">Ziel</p>
                    <p className="text-[0.8rem] text-white/50">{session.homework.goal}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] px-4 py-3">
                    <p className="mb-1 text-[0.65rem] text-white/25 uppercase tracking-wider">Abgabeformat</p>
                    <p className="text-[0.8rem] text-white/50">{session.homework.format}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] px-4 py-3">
                    <p className="mb-1 text-[0.65rem] text-white/25 uppercase tracking-wider">Lernfokus</p>
                    <p className="text-[0.8rem] text-white/50">{session.homework.learningFocus}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] px-4 py-3">
                    <p className="mb-1 text-[0.65rem] text-amber-400/60 uppercase tracking-wider">Abgabe bis</p>
                    <p className="text-[0.8rem] text-amber-300/80">{session.homework.deadline}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tutorials */}
          {session.tutorials.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-3 flex items-center gap-2 text-[0.8rem] text-white/40 uppercase tracking-wider">
                <BookOpen className="h-3.5 w-3.5" />
                Video-Tutorials & Ressourcen
              </h2>
              <div className="flex flex-col gap-2">
                {session.tutorials.map((tutorial, i) => {
                  const Icon = getTutorialIcon(tutorial.type);
                  const isVideo = tutorial.type.toLowerCase().includes("video") || tutorial.type.toLowerCase().includes("youtube");
                  return (
                    <a
                      key={i}
                      href={tutorial.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]"
                    >
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${isVideo ? "bg-red-500/10" : "bg-blue-500/10"}`}>
                        <Icon className={`h-4 w-4 ${isVideo ? "text-red-400/70" : "text-blue-400/70"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.85rem] text-white/70 transition-colors group-hover:text-white/90">
                          {tutorial.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-[0.65rem] text-white/25">{tutorial.type}</span>
                          {tutorial.duration && (
                            <>
                              <span className="text-[0.65rem] text-white/15">·</span>
                              <span className="text-[0.65rem] text-white/25">{tutorial.duration}</span>
                            </>
                          )}
                          {tutorial.whenToUse && (
                            <>
                              <span className="text-[0.65rem] text-white/15">·</span>
                              <span className="text-[0.65rem] text-violet-400/50">{tutorial.whenToUse}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-white/10 transition-colors group-hover:text-white/30" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-5"
        >
          {/* Materials */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h2 className="mb-4 flex items-center gap-2 text-[0.8rem] text-white/40 uppercase tracking-wider">
              <Download className="h-3.5 w-3.5" />
              Materialien
            </h2>

            {session.materials.length === 0 ? (
              <p className="text-[0.8rem] text-white/20">
                Noch keine Materialien verfügbar.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {session.materials.map((material, i) => {
                  const Icon = getMaterialIcon(material.type);
                  const colorClass = getMaterialColor(material.type);
                  const [iconColor, iconBg] = colorClass.split(" ");

                  return (
                    <a
                      key={i}
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 transition-all hover:border-white/10 hover:bg-white/[0.04]"
                    >
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                        <Icon className={`h-4 w-4 ${iconColor}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.8rem] text-white/70 transition-colors group-hover:text-white/90 truncate">
                          {material.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[0.65rem] text-white/25 uppercase">{material.type}</span>
                          {material.size && (
                            <>
                              <span className="text-[0.65rem] text-white/15">·</span>
                              <span className="text-[0.65rem] text-white/25">{material.size}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Download className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-white/10 transition-colors group-hover:text-white/30" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Info Card */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h2 className="mb-4 text-[0.8rem] text-white/40 uppercase tracking-wider">
              Auf einen Blick
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-white/20" />
                <div>
                  <p className="text-[0.65rem] text-white/25">Datum</p>
                  <p className="text-[0.8rem] text-white/60">{session.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-white/20" />
                <div>
                  <p className="text-[0.65rem] text-white/25">Zeit</p>
                  <p className="text-[0.8rem] text-white/60">{session.time} Uhr</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-white/20" />
                <div>
                  <p className="text-[0.65rem] text-white/25">Raum</p>
                  <p className="text-[0.8rem] text-white/60">{session.room}</p>
                </div>
              </div>
              {session.schwerpunkt && (
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-white/20" />
                  <div>
                    <p className="text-[0.65rem] text-white/25">Schwerpunkt</p>
                    <p className="text-[0.8rem] text-white/60">{session.schwerpunkt}</p>
                  </div>
                </div>
              )}
              {session.homework && (
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-4 w-4 text-amber-400/40" />
                  <div>
                    <p className="text-[0.65rem] text-amber-400/40">Hausaufgabe bis</p>
                    <p className="text-[0.8rem] text-amber-300/70">{session.homework.deadline}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gallery – full width, after all content sections */}
      {session.galleryFolderId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <Gallery
            folderId={session.galleryFolderId}
            password={courseInfo.galleryPassword}
            title={`Galerie – Session ${session.sessionNumber}`}
            subtitle="Fotos aus dieser Kursstunde"
          />
        </motion.div>
      )}

      {/* Prev / Next Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12 grid gap-3 sm:grid-cols-2"
      >
        {prevSession ? (
          <Link
            to={`/kursplan/${prevSession.id}`}
            className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]"
          >
            <ChevronLeft className="h-5 w-5 text-white/20 transition-transform group-hover:-translate-x-0.5" />
            <div className="min-w-0">
              <p className="text-[0.65rem] text-white/25 uppercase tracking-wider">Vorherige</p>
              <p className="text-[0.82rem] text-white/60 truncate group-hover:text-white/80">
                {prevSession.title}
              </p>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextSession ? (
          <Link
            to={`/kursplan/${nextSession.id}`}
            className="group flex items-center justify-end gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-right transition-all hover:border-white/10 hover:bg-white/[0.04]"
          >
            <div className="min-w-0">
              <p className="text-[0.65rem] text-white/25 uppercase tracking-wider">Nächste</p>
              <p className="text-[0.82rem] text-white/60 truncate group-hover:text-white/80">
                {nextSession.title}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-white/20 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <div />
        )}
      </motion.div>
    </div>
  );
}