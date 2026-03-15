/**
 * Course Data Layer
 * 
 * STORYBLOK INTEGRATION:
 * This file contains hardcoded fallback data that mirrors the Storyblok content structure.
 * Mario manages all content in Storyblok – sessions, texts, materials, images.
 * He can create new semesters by adding/removing course_session entries.
 * 
 * STATUS IS TIME-BASED:
 * There is NO manual status field in Storyblok. The app calculates session status
 * automatically based on the session date vs. today:
 *   - Past sessions → "completed"
 *   - Today's session (or nearest upcoming if none today) → "current"
 *   - Future sessions → "upcoming"
 * 
 * Storyblok Content Types:
 * 
 * 1. "course_info" (Singleton) – Fields:
 *    - title (text): "Digitale Fotografie"
 *    - subtitle (text): "Sommersemester 2026"
 *    - description (textarea): Course description
 *    - instructor_name (text): "Mario Schubert"
 *    - instructor_title (text): "Dozent für Digitale Fotografie"
 *    - instructor_image (text): ImageKit URL
 *    - instructor_bio (textarea): Short bio
 *    - semester (text): "SoSe 2026"
 *    - schedule (text): "Mittwochs, 14:00 – 17:15 Uhr"
 *    - room (text): "Raum G.013 – Fotolabor"
 *    - credits (text): "5 ECTS"
 *    - hero_image (text): ImageKit URL
 *    - highlights (textarea): One per line
 * 
 * 2. "course_session" (Collection – Mario creates one per Kurstermin) – Fields:
 *    - session_number (number): 1, 2, 3...
 *    - date (text): "16.04.2026" (DD.MM.YYYY – used for time-based status!)
 *    - title (text): Session title
 *    - description (textarea): Detailed session description
 *    - topics (textarea): One topic per line
 *    - materials (bloks): Nested "material" blocks
 * 
 * 3. "material" (Nested block inside course_session) – Fields:
 *    - name (text): Display name
 *    - url (text): Download URL (Mario pastes link to file, e.g. Google Drive, Dropbox)
 *    - type (option): "pdf" | "zip" | "link" | "video"
 *    - size (text): "2.4 MB" (optional)
 */

export interface CourseMaterial {
  name: string;
  url: string;
  type: "pdf" | "zip" | "link" | "video";
  size?: string;
}

export interface CourseSessionRaw {
  id: string;
  sessionNumber: number;
  date: string; // DD.MM.YYYY
  title: string;
  description: string;
  topics: string[];
  materials: CourseMaterial[];
}

export type SessionStatus = "upcoming" | "completed" | "current";

export interface CourseSession extends CourseSessionRaw {
  status: SessionStatus;
}

export interface CourseInfo {
  title: string;
  subtitle: string;
  description: string;
  instructorName: string;
  instructorTitle: string;
  instructorImage: string;
  instructorBio: string;
  semester: string;
  schedule: string;
  room: string;
  credits: string;
  heroImage: string;
  highlights: string[];
}

// ============================================================
// TIME-BASED STATUS CALCULATION
// Mario only enters dates in Storyblok – no manual status needed.
// ============================================================

function parseGermanDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split(".").map(Number);
  return new Date(year, month - 1, day);
}

function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Calculates status for all sessions based on their dates:
 * - Sessions with date < today → "completed"
 * - The first session with date >= today → "current"
 * - All remaining sessions → "upcoming"
 */
function calculateSessionStatuses(sessions: CourseSessionRaw[]): CourseSession[] {
  const today = getToday();
  let currentFound = false;

  // Sort by date to ensure correct order
  const sorted = [...sessions].sort((a, b) => {
    return parseGermanDate(a.date).getTime() - parseGermanDate(b.date).getTime();
  });

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

// ============================================================
// FALLBACK DATA – Replace with Storyblok API calls
// ============================================================

export const courseInfo: CourseInfo = {
  title: "Digitale Fotografie",
  subtitle: "Sommersemester 2026",
  description:
    "Von den Grundlagen der Kameratechnik bis zur professionellen Bildbearbeitung – dieser Kurs vermittelt euch das Handwerk der digitalen Fotografie. Theorie trifft Praxis: Jede Woche neue Techniken, Hands-on Übungen und kreative Challenges.",
  instructorName: "Mario Schubert",
  instructorTitle: "Dozent für Digitale Fotografie",
  instructorImage:
    "https://ik.imagekit.io/r2yqrg6np/6966a461e78df6320fd2fd1e_20251019_Hundeshooting-3528_(WebRes).jpg?updatedAt=1772998407934",
  instructorBio:
    "Professioneller Fotograf mit Schwerpunkt Hochzeits-, Tier- und Porträtfotografie in Tirol und Bayern. Mario verbindet jahrelange Praxiserfahrung mit seiner Leidenschaft für die Lehre.",
  semester: "SoSe 2026",
  schedule: "Mittwochs, 14:00 – 17:15 Uhr",
  room: "Raum G.013 – Fotolabor",
  credits: "5 ECTS",
  heroImage:
    "https://images.unsplash.com/photo-1736066330610-c102cab4e942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwcGhvdG9ncmFwaHklMjBjYW1lcmElMjB1bml2ZXJzaXR5JTIwbGVjdHVyZXxlbnwxfHx8fDE3NzM0MTM5MTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  highlights: [
    "Praxisorientiert mit wöchentlichen Foto-Challenges",
    "Professionelle Ausrüstung im Fotolabor verfügbar",
    "Portfolio-Review am Semesterende",
    "Gastvorträge von Branchenprofis",
  ],
};

// Raw session data (as it comes from Storyblok – NO status field)
const rawSessions: CourseSessionRaw[] = [
  {
    id: "01-einfuehrung",
    sessionNumber: 1,
    date: "16.04.2026",
    title: "Einführung & Kameratechnik Basics",
    description:
      "Willkommen im Kurs! Wir starten mit einer Übersicht über den Semesterplan, lernen uns kennen und steigen direkt in die Grundlagen ein: Wie funktioniert eine Digitalkamera? Was bedeuten Sensor, Verschluss und Objektiv? Ihr bekommt eure erste Hands-on Session mit den Kamera-Leihgeräten.",
    topics: [
      "Kursübersicht & Organisatorisches",
      "Aufbau einer Digitalkamera",
      "Sensor-Typen: APS-C vs. Vollformat",
      "Erste Hands-on Übung",
    ],
    materials: [
      { name: "Kursübersicht SoSe 2026", url: "#", type: "pdf", size: "1.2 MB" },
      { name: "Slides: Kameratechnik Basics", url: "#", type: "pdf", size: "4.8 MB" },
    ],
  },
  {
    id: "02-belichtungsdreieck",
    sessionNumber: 2,
    date: "23.04.2026",
    title: "Das Belichtungsdreieck",
    description:
      "Das Herzstück der Fotografie: Blende, Verschlusszeit und ISO. Wir verstehen nicht nur die Theorie, sondern experimentieren im Fotolabor mit verschiedenen Einstellungen. Am Ende der Session könnt ihr manuell belichten und wisst, wann welche Einstellung Sinn macht.",
    topics: [
      "Blende (Aperture) & Schärfentiefe",
      "Verschlusszeit & Bewegungsunschärfe",
      "ISO & Bildrauschen",
      "Praxis: Manueller Modus",
    ],
    materials: [
      { name: "Slides: Belichtungsdreieck", url: "#", type: "pdf", size: "3.6 MB" },
      { name: "Cheat Sheet: Belichtung", url: "#", type: "pdf", size: "0.8 MB" },
      { name: "Übungsblatt Woche 2", url: "#", type: "pdf", size: "0.5 MB" },
    ],
  },
  {
    id: "03-komposition",
    sessionNumber: 3,
    date: "30.04.2026",
    title: "Bildkomposition & Gestaltungsregeln",
    description:
      "Ein gutes Foto ist mehr als korrekte Belichtung. Wir lernen die wichtigsten Gestaltungsregeln: Drittelregel, Goldener Schnitt, Führungslinien, Rahmen im Bild und Symmetrie. Danach geht's raus – Foto-Walk auf dem Campus mit konkreten Aufgaben.",
    topics: [
      "Drittelregel & Goldener Schnitt",
      "Führungslinien & Fluchtpunkte",
      "Symmetrie & Patterns",
      "Foto-Walk: Campus Kompositions-Challenge",
    ],
    materials: [
      { name: "Slides: Bildkomposition", url: "#", type: "pdf", size: "5.2 MB" },
      { name: "Inspiration Board (Pinterest)", url: "#", type: "link" },
    ],
  },
  {
    id: "04-licht",
    sessionNumber: 4,
    date: "07.05.2026",
    title: "Licht verstehen & nutzen",
    description:
      "Licht ist das wichtigste Werkzeug eines Fotografen. Natural Light, Golden Hour, Blue Hour, hartes vs. weiches Licht – wir analysieren Lichtsituationen und lernen, wie man mit einfachen Mitteln (Reflektor, Diffusor) Licht kontrolliert.",
    topics: [
      "Lichtqualitäten: hart vs. weich",
      "Farbtemperatur & Weißabgleich",
      "Golden Hour & Blue Hour",
      "Praxis: Available Light Portraits",
    ],
    materials: [
      { name: "Slides: Licht in der Fotografie", url: "#", type: "pdf", size: "4.1 MB" },
      { name: "Golden Hour Rechner (Link)", url: "#", type: "link" },
    ],
  },
  {
    id: "05-portrait",
    sessionNumber: 5,
    date: "14.05.2026",
    title: "Porträtfotografie",
    description:
      "People Photography! Von der richtigen Brennweite über Posing-Basics bis zur Kommunikation mit dem Model. Wir üben uns gegenseitig zu fotografieren und lernen, wie man Menschen vor der Kamera zum Strahlen bringt.",
    topics: [
      "Brennweiten für Portraits",
      "Posing-Grundlagen",
      "Kommunikation mit dem Model",
      "Studio-Setup: 1-Licht-Portrait",
    ],
    materials: [
      { name: "Slides: Porträtfotografie", url: "#", type: "pdf", size: "6.3 MB" },
      { name: "Posing Guide", url: "#", type: "pdf", size: "2.1 MB" },
    ],
  },
  {
    id: "06-landschaft",
    sessionNumber: 6,
    date: "21.05.2026",
    title: "Landschafts- & Architekturfotografie",
    description:
      "Raus in die Natur! Wir besprechen Techniken für Landschaftsaufnahmen: Stativ-Einsatz, Langzeitbelichtung, Filter und HDR. Dazu gibt's einen Exkurs in Architekturfotografie mit Fokus auf Linien und Perspektive.",
    topics: [
      "Stativ & Langzeitbelichtung",
      "ND-Filter & Polfilter",
      "HDR-Technik",
      "Architektur: Perspektivkorrektur",
    ],
    materials: [
      { name: "Slides: Landschaft & Architektur", url: "#", type: "pdf", size: "5.7 MB" },
    ],
  },
  {
    id: "07-lightroom",
    sessionNumber: 7,
    date: "28.05.2026",
    title: "Adobe Lightroom: RAW-Entwicklung",
    description:
      "Der digitale Dunkelraum. Warum RAW statt JPEG? Wir lernen Lightroom von Grund auf: Import, Katalogisierung, Grundentwicklung, Farbanpassungen und Export. Jeder bringt eigene Fotos mit und bearbeitet live.",
    topics: [
      "RAW vs. JPEG",
      "Lightroom: Import & Katalog",
      "Grundentwicklung & Tonwerte",
      "Farb-Grading & Presets",
    ],
    materials: [
      { name: "Slides: Lightroom Workflow", url: "#", type: "pdf", size: "3.9 MB" },
      { name: "Starter Presets Pack", url: "#", type: "zip", size: "12.4 MB" },
      { name: "RAW-Übungsdateien", url: "#", type: "zip", size: "89.2 MB" },
    ],
  },
  {
    id: "08-photoshop",
    sessionNumber: 8,
    date: "04.06.2026",
    title: "Adobe Photoshop: Retusche & Composing",
    description:
      "Fortgeschrittene Bildbearbeitung in Photoshop. Wir lernen Ebenen, Masken, Frequenztrennung für Hautretusche und einfache Composings. Wann braucht man Photoshop und wann reicht Lightroom?",
    topics: [
      "Ebenen & Masken",
      "Frequenztrennung (Hautretusche)",
      "Dodge & Burn",
      "Einfaches Composing",
    ],
    materials: [
      { name: "Slides: Photoshop Retusche", url: "#", type: "pdf", size: "4.5 MB" },
      { name: "Übungsdateien Retusche", url: "#", type: "zip", size: "34.7 MB" },
    ],
  },
  {
    id: "09-storytelling",
    sessionNumber: 9,
    date: "11.06.2026",
    title: "Visuelles Storytelling & Reportage",
    description:
      "Ein Foto erzählt eine Geschichte. Wir beschäftigen uns mit Bildserien, Reportage-Fotografie und wie man mit Bildern Emotionen transportiert. Gastvortrag: Einblicke in die Hochzeitsfotografie als visuelles Storytelling.",
    topics: [
      "Storytelling mit Bildern",
      "Reportage-Fotografie",
      "Bildserien & Editing",
      "Gastvortrag: Hochzeitsfotografie",
    ],
    materials: [
      { name: "Slides: Visuelles Storytelling", url: "#", type: "pdf", size: "5.0 MB" },
      { name: "Gastvortrag Recording", url: "#", type: "video" },
    ],
  },
  {
    id: "10-projekt",
    sessionNumber: 10,
    date: "18.06.2026",
    title: "Projektarbeit & Beratung",
    description:
      "Freie Session für eure Semesterprojekte. Individuelle Beratung zu euren Portfolio-Arbeiten, offene Fragen klären, gemeinsames Feedback in der Gruppe. Vorbereitung auf die finale Präsentation.",
    topics: [
      "Individuelle Projektberatung",
      "Peer-Review in Kleingruppen",
      "Portfolio-Aufbau Tipps",
      "Technische Fragen klären",
    ],
    materials: [
      { name: "Portfolio-Template", url: "#", type: "zip", size: "8.3 MB" },
      { name: "Bewertungskriterien", url: "#", type: "pdf", size: "0.4 MB" },
    ],
  },
  {
    id: "11-praesentationen",
    sessionNumber: 11,
    date: "25.06.2026",
    title: "Abschlusspräsentationen & Portfolio-Review",
    description:
      "Der große Abschluss! Ihr präsentiert eure Semester-Portfolios vor der Gruppe. Konstruktives Feedback, Diskussion und Ausblick – was kommt nach dem Kurs? Möglichkeiten in der Fotografie, Community und Weiterbildung.",
    topics: [
      "Portfolio-Präsentationen",
      "Grupppen-Feedback & Diskussion",
      "Ausblick: Wege in der Fotografie",
      "Kursabschluss & Feedback",
    ],
    materials: [
      { name: "Abschluss-Infos & Noten", url: "#", type: "pdf", size: "0.3 MB" },
    ],
  },
];

// ============================================================
// COMPUTED EXPORTS – Status is calculated from dates, not stored
// ============================================================

/** All sessions with time-based status (recalculated on every import/render) */
export const courseSessions: CourseSession[] = calculateSessionStatuses(rawSessions);

export function getSessionById(id: string): CourseSession | undefined {
  return courseSessions.find((s) => s.id === id);
}

export function getCurrentSession(): CourseSession | undefined {
  return courseSessions.find((s) => s.status === "current");
}

export function getCompletedCount(): number {
  return courseSessions.filter((s) => s.status === "completed").length;
}

export function getProgressPercent(): number {
  if (courseSessions.length === 0) return 0;
  return Math.round((getCompletedCount() / courseSessions.length) * 100);
}
