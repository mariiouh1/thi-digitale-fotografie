/**
 * Course Data Layer – Digitale Fotografie (THI)
 * 
 * STORYBLOK INTEGRATION:
 * Fallback data mirrors Storyblok content structure.
 * Mario manages all content in Storyblok – sessions, texts, materials, images.
 * 
 * STATUS IS TIME-BASED:
 * No manual status field. App calculates from session date vs. today:
 *   - Past sessions → "completed"
 *   - First session with date >= today → "current"
 *   - Future sessions → "upcoming"
 */

export interface CourseMaterial {
  name: string;
  url: string;
  type: "pdf" | "zip" | "link" | "video";
  size?: string;
}

export interface CourseTutorial {
  title: string;
  url: string;
  type: string; // "YouTube Video" | "Blog-Artikel" | "Adobe Help"
  duration: string;
  language: string;
  whenToUse: string; // z.B. "Vor/nach Termin 1"
}

export interface CourseHomework {
  number: string; // "HA1", "HA2", ...
  title: string;
  deadline: string; // "29.03.2026, 23:59"
  goal: string;
  description: string;
  format: string;
  learningFocus: string;
}

export interface CourseSessionRaw {
  id: string;
  sessionNumber: number;
  date: string; // DD.MM.YYYY
  time: string; // "09:55-13:05"
  room: string; // "K115"
  title: string;
  description: string;
  schwerpunkt: string; // Focus area
  topics: string[];
  projectSubmission: string; // e.g. "Start P1 (Sport & Bewegung)" or "Abgabe P1 / Start P2"
  homework: CourseHomework | null;
  tutorials: CourseTutorial[];
  materials: CourseMaterial[];
  galleryFolderId: string; // Google Drive folder ID for session gallery
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
  // Landing Page Controls
  heroBadgeText: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  announcement: string;
  announcementType: "info" | "warning" | "success" | "";
  sectionTitleProgress: string;
  sectionTitleInstructor: string;
  sectionTitleHighlights: string;
  sectionTitleNextSessions: string;
  // Gallery
  galleryFolderId: string; // Google Drive folder ID for homepage gallery
  galleryPassword: string; // Password to unlock all galleries
}

// ============================================================
// TIME-BASED STATUS CALCULATION
// ============================================================

function parseGermanDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split(".").map(Number);
  return new Date(year, month - 1, day);
}

function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function calculateSessionStatuses(sessions: CourseSessionRaw[]): CourseSession[] {
  const today = getToday();
  let currentFound = false;

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
// FALLBACK DATA – Mario's real course plan
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
  schedule: "Montags, 09:55 – 13:05 Uhr",
  room: "K115",
  credits: "5 ECTS",
  heroImage:
    "https://images.unsplash.com/photo-1736066330610-c102cab4e942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  highlights: [
    "13 Präsenztermine mit Theorie & Praxis",
    "5 Fotoprojekte + Abschlussarbeit mit Prüfung",
    "Wöchentliche Hausaufgaben mit Feedback",
    "Video-Tutorials & Lightroom/Photoshop-Labs",
    "Portfolio-Review & Generalprobe vor der Prüfung",
  ],
  heroBadgeText: "SoSe 2026",
  ctaPrimaryText: "Zum Kursplan",
  ctaSecondaryText: "Aktuelle Session",
  announcement: "Willkommen zum Kurs Digitale Fotografie! Der erste Termin ist am 23. März 2026.",
  announcementType: "info",
  sectionTitleProgress: "Kursfortschritt",
  sectionTitleInstructor: "Dozent",
  sectionTitleHighlights: "Kurs-Highlights",
  sectionTitleNextSessions: "Nächste Sessions",
  // Gallery
  galleryFolderId: "", // Mario: Google Drive Folder ID hier eintragen
  galleryPassword: "", // Mario: Galerie-Passwort hier eintragen
};

const rawSessions: CourseSessionRaw[] = [
  {
    id: "01-kickoff",
    sessionNumber: 1,
    date: "23.03.2026",
    time: "09:55-13:05",
    room: "K115",
    title: "Kick-off, Sehen lernen & Kameragrundlagen",
    schwerpunkt: "Kamera/Grundlagen",
    description: "Willkommen im Kurs! Wir lernen uns kennen, besprechen den Semesterplan und steigen direkt ein: Wie funktioniert eure Kamera? Was bedeuten die Modi, der Sensor, das Objektiv? Danach geht's raus – Sehen lernen durch bewusstes Fotografieren.",
    topics: [
      "Kursübersicht & Organisatorisches",
      "Kameraaufbau & Modi (P/A/S/M)",
      "Sehen lernen: Formen, Linien, Texturen",
      "Erste Hands-on Übung auf dem Campus",
    ],
    projectSubmission: "–",
    homework: {
      number: "HA1",
      title: "Formen-Jagd & Kamerakenntnis",
      deadline: "29.03.2026, 23:59",
      goal: "Kamera ausprobieren, bewusst sehen lernen",
      description: "12 Bilder (4x Linien, 4x Formen, 4x Texturen), 5 beste auswählen + kurze Reflexion",
      format: "ZIP mit 5 JPG + 1 TXT/PDF",
      learningFocus: "Sehen lernen, Kamera-Modi testen",
    },
    tutorials: [
      { title: "Fotografie Basics – Folge 4: Das Belichtungsdreieck", url: "https://www.youtube.com/watch?v=IC8bPtjQFSw", type: "YouTube Video", duration: "ca. 15 Min", language: "Deutsch", whenToUse: "Vor/nach Termin 1" },
      { title: "10 ERSTE SCHRITTE in LIGHTROOM CLASSIC", url: "https://www.youtube.com/watch?v=9Tu8lqtqhiA", type: "YouTube Video + Blog", duration: "ca. 35 Min", language: "Deutsch", whenToUse: "Selbststudium bis Termin 2" },
    ],
    materials: [],
    galleryFolderId: "", // Mario: Google Drive Folder ID für Session 1
  },
  {
    id: "02-belichtungsdreieck",
    sessionNumber: 2,
    date: "30.03.2026",
    time: "09:55-13:05",
    room: "K115",
    title: "Technik-Intensiv: Belichtungsdreieck, Fokus, RAW & Import",
    schwerpunkt: "Kamera/Belichtung/Technik",
    description: "Das Herzstück der Fotografie: Blende, Verschlusszeit und ISO im Detail. Dazu Fokus-Systeme, RAW vs. JPEG und der erste Lightroom-Import. Am Ende könnt ihr manuell belichten und wisst, warum RAW besser ist.",
    topics: [
      "Blende, Verschlusszeit, ISO – das Belichtungsdreieck",
      "Fokus-Systeme: AF-S, AF-C, Spot-AF",
      "RAW vs. JPEG – warum RAW?",
      "Lightroom: Erster Import & Katalog",
    ],
    projectSubmission: "Start P1 (Sport & Bewegung)",
    homework: {
      number: "HA2",
      title: "Belichtungsdreieck-Experiment",
      deadline: "12.04.2026, 23:59",
      goal: "Zeit, Blende, ISO wirklich verstehen",
      description: "3 Serien je 3 Bilder (Zeit/Blende/ISO variieren) + 3 Action-Bilder",
      format: "ZIP mit 12 JPG + 1 TXT/PDF (Reflexion)",
      learningFocus: "Belichtungsdreieck praktisch anwenden",
    },
    tutorials: [
      { title: "Crashkurs für Anfänger | ISO Blende Verschlusszeit", url: "https://www.youtube.com/watch?v=yMyObFiSSIg", type: "YouTube Video", duration: "ca. 12 Min", language: "Deutsch", whenToUse: "Nach Termin 2" },
      { title: "Belichtungsdreieck in der Praxis – Tipps am Holstentor", url: "https://www.youtube.com/watch?v=EWlHH4PPh4Y", type: "YouTube Video", duration: "ca. 10 Min", language: "Deutsch", whenToUse: "Nach Termin 2" },
      { title: "Der Import - Adobe Lightroom Classic - 2025", url: "https://www.youtube.com/watch?v=vxLpi-DwDZA", type: "YouTube Video", duration: "ca. 8 Min", language: "Deutsch", whenToUse: "Selbststudium bis Termin 3" },
    ],
    materials: [],
    galleryFolderId: "", // Mario: Google Drive Folder ID für Session 2
  },
  {
    id: "03-portrait-grundlagen",
    sessionNumber: 3,
    date: "13.04.2026",
    time: "09:55-13:05",
    room: "K115",
    title: "Feedback P1 + Portrait-Grundlagen & Licht",
    schwerpunkt: "Gestaltung/Licht/Portrait",
    description: "Wir besprechen eure Sport-Fotos (P1), dann tauchen wir ein in die Portrait-Fotografie: Brennweiten, Posing-Basics, Kommunikation und wie ihr natürliches Licht für Portraits nutzt.",
    topics: [
      "Feedback-Runde: Projekt 1 (Sport & Bewegung)",
      "Portrait-Brennweiten & Perspektive",
      "Posing-Basics & Kommunikation",
      "Natürliches Licht für Portraits nutzen",
    ],
    projectSubmission: "Abgabe P1 / Start P2 (Kreative Portraits)",
    homework: {
      number: "HA3",
      title: "Mini-Portrait-Serie",
      deadline: "19.04.2026, 23:59",
      goal: "Portrait-Basics anwenden",
      description: "3 Portraits einer Person (neutral/Umgebung/kreatives Licht) + Reflexion",
      format: "ZIP mit 3 JPG + 1 TXT/PDF",
      learningFocus: "Portrait-Grundlagen, Licht nutzen",
    },
    tutorials: [
      { title: "10 Tipps für gute Portraitfotos – Basics", url: "https://www.youtube.com/watch?v=_U0j6IQ7W6A", type: "YouTube Video", duration: "ca. 15 Min", language: "Deutsch", whenToUse: "Vor/nach Termin 3" },
      { title: "Simple PORTRÄT-TRICKS zum direkt anwenden", url: "https://www.youtube.com/watch?v=SNTqYx3Ioak", type: "YouTube Video", duration: "ca. 10 Min", language: "Deutsch", whenToUse: "Nach Termin 3" },
    ],
    materials: [],
    galleryFolderId: "", // Mario: Google Drive Folder ID für Session 3
  },
  {
    id: "04-licht-farbe",
    sessionNumber: 4,
    date: "20.04.2026",
    time: "09:55-13:05",
    room: "K113",
    title: "Licht & Farbe – Tageszeiten, Weißabgleich, Farblooks",
    schwerpunkt: "Licht/Farbe/Bildbearbeitung",
    description: "Licht ist das wichtigste Werkzeug. Wir analysieren verschiedene Lichtsituationen über den Tag, verstehen Farbtemperatur und Weißabgleich und erstellen erste konsistente Farblooks in Lightroom.",
    topics: [
      "Lichtqualitäten über den Tag",
      "Farbtemperatur & Weißabgleich (Kamera + LR)",
      "Golden Hour, Blue Hour, hartes Mittagslicht",
      "Erste Farblooks in Lightroom",
    ],
    projectSubmission: "–",
    homework: {
      number: "HA4",
      title: "Licht-Tagebuch",
      deadline: "26.04.2026, 23:59",
      goal: "Verschiedene Lichtsituationen erkennen & nutzen",
      description: "6 Fotos in unterschiedlichen Lichtsituationen + Weißabgleich-Reflexion",
      format: "6 JPG + 1 Tabelle/TXT",
      learningFocus: "Lichtqualität, Weißabgleich",
    },
    tutorials: [
      { title: "Der Weißabgleich - Lightroom Grundlagen Tutorial", url: "https://www.youtube.com/watch?v=f3wk630TThQ", type: "YouTube Video", duration: "ca. 8 Min", language: "Deutsch", whenToUse: "Vor Termin 4" },
      { title: "Weißabgleich mit Lightroom - Lightroom Basics Teil 1", url: "https://www.pixolum.com/blog/fotografie/weissabgleich-lightroom", type: "Blog-Artikel", duration: "ca. 5 Min Lesezeit", language: "Deutsch", whenToUse: "Selbststudium" },
    ],
    materials: [],
    galleryFolderId: "", // Mario: Google Drive Folder ID für Session 4
  },
  {
    id: "05-streetfotografie",
    sessionNumber: 5,
    date: "27.04.2026",
    time: "09:55-13:05",
    room: "K115",
    title: "Feedback P2 + Einstieg Streetfotografie",
    schwerpunkt: "Gestaltung/Story/Street",
    description: "Wir besprechen eure Portrait-Arbeiten (P2), dann steigen wir ein in die Streetfotografie: Bildaussage, Komposition im urbanen Raum, Ethik und rechtliche Aspekte. Keine Angst vor der Straße!",
    topics: [
      "Feedback-Runde: Projekt 2 (Kreative Portraits)",
      "Streetfotografie: Was macht ein gutes Street-Foto?",
      "Komposition im urbanen Raum",
      "Ethik & Recht: Fotografieren im öffentlichen Raum",
    ],
    projectSubmission: "Abgabe P2 / Start P3 (Urban Street)",
    homework: {
      number: "HA5",
      title: "Street ohne Gesichter",
      deadline: "03.05.2026, 23:59",
      goal: "Street üben ohne Stress durch Portraitrechte",
      description: "6 Street-Fotos ohne erkennbare Gesichter (Silhouetten, Hände, Schatten)",
      format: "ZIP mit 6 JPG + 1 TXT/PDF",
      learningFocus: "Streetfotografie, Bildaussage",
    },
    tutorials: [
      { title: "8 Streetfotografie Tipps für Anfänger & Fortgeschrittene", url: "https://www.youtube.com/watch?v=9kwSo2NqK58", type: "YouTube Video", duration: "ca. 12 Min", language: "Deutsch", whenToUse: "Vor/nach Termin 5" },
      { title: "Streetfotografie in Deutschland ohne Angst", url: "https://www.youtube.com/watch?v=X6Q2m4WJdTE", type: "YouTube Video", duration: "ca. 10 Min", language: "Deutsch", whenToUse: "Vor Termin 5" },
    ],
    materials: [],
    galleryFolderId: "", // Mario: Google Drive Folder ID für Session 5
  },
  {
    id: "06-lightroom-lab",
    sessionNumber: 6,
    date: "04.05.2026",
    time: "09:55-13:05",
    room: "K115",
    title: "Lightroom-Lab I – Organisieren, Masken, erste Looks",
    schwerpunkt: "Bildbearbeitung/Workflow",
    description: "Hands-on Lightroom Session: Katalog organisieren, mit Masken arbeiten (Himmel, Gesichter, Objekte selektiv bearbeiten) und einen einheitlichen Look für eine Bilderserie erstellen.",
    topics: [
      "Lightroom: Katalog & Sammlungen organisieren",
      "Masken: Himmel, Motive, Pinsel",
      "Serien-Look: Konsistente Bearbeitung",
      "Presets erstellen & anwenden",
    ],
    projectSubmission: "–",
    homework: {
      number: "HA6",
      title: "Masken & Look",
      deadline: "10.05.2026, 23:59",
      goal: "Masken in Lightroom gezielt einsetzen",
      description: "5 Fotos mit Masken bearbeiten + einheitlichen Look erstellen (Before/After)",
      format: "ZIP mit 10 JPG (Vorher/Nachher)",
      learningFocus: "Lightroom Masken, Serien-Look",
    },
    tutorials: [
      { title: "Lightroom Masken – Der ultimative Guide", url: "https://weblog.datenwerk.at/lightroom-masken-der-ultimative-guide", type: "Blog-Artikel", duration: "ca. 10 Min Lesezeit", language: "Deutsch", whenToUse: "Vor/nach Termin 6" },
    ],
    materials: [],
    galleryFolderId: "", // Mario: Google Drive Folder ID für Session 6
  },
  {
    id: "07-storytelling",
    sessionNumber: 7,
    date: "11.05.2026",
    time: "09:55-13:05",
    room: "K115",
    title: "Feedback P3 + Serien & Storytelling",
    schwerpunkt: "Gestaltung/Story/Serien",
    description: "Wir besprechen eure Street-Fotos (P3), dann geht's um das große Thema Storytelling: Wie erzählt man Geschichten mit Bildern? Serien planen, Dramaturgie aufbauen und ein Ereignis dokumentarisch festhalten.",
    topics: [
      "Feedback-Runde: Projekt 3 (Urban Street)",
      "Visuelles Storytelling: Grundlagen",
      "Bildserien: Planung & Dramaturgie",
      "Dokumentarische Fotografie",
    ],
    projectSubmission: "Abgabe P3 / Start P4 (Ereignis-Doku)",
    homework: {
      number: "HA7",
      title: "Ereignis-Skizze",
      deadline: "17.05.2026, 23:59",
      goal: "Dokumentarische Serie vorher planen",
      description: "Storyboard-Sequenz (10-15 Bilder) + 3 Testfotos",
      format: "1 PDF (Storyboard + Testbilder)",
      learningFocus: "Planung, Storytelling",
    },
    tutorials: [],
    materials: [],
    galleryFolderId: "", // Mario: Google Drive Folder ID für Session 7
  },
  {
    id: "08-langzeitbelichtung",
    sessionNumber: 8,
    date: "18.05.2026",
    time: "09:55-13:05",
    room: "K115",
    title: "Langzeitbelichtung & kreative Nachtfotografie",
    schwerpunkt: "Kamera/Technik/Kreativ",
    description: "Stativ raus! Wir experimentieren mit langen Belichtungszeiten: Lichtspuren, weiches Wasser, Sternenhimmel und kreative Light-Painting-Effekte. Theorie und sofortige Praxis.",
    topics: [
      "Langzeitbelichtung: Technik & Einstellungen",
      "Stativ, Fernauslöser, ND-Filter",
      "Lichtspuren, Wasser, Wolken",
      "Light Painting & kreative Nacht-Experimente",
    ],
    projectSubmission: "Start P5 (Langzeitbelichtung)",
    homework: {
      number: "HA8",
      title: "LZB-Experimente indoor/outdoor",
      deadline: "24.05.2026, 23:59",
      goal: "Erste Erfahrungen mit Langzeitbelichtung",
      description: "3 LZB-Fotos (Lichtspuren/Wasser/Experiment, ≥3s)",
      format: "ZIP mit 3 JPG + TXT (Einstellungen)",
      learningFocus: "Langzeitbelichtung, Stativ-Arbeit",
    },
    tutorials: [
      { title: "Langzeitbelichtung - Der ultimative Guide [2026]", url: "https://www.matthiashaltenhof.de/tutorials/langzeitbelichtung/", type: "Blog-Artikel", duration: "ca. 12 Min Lesezeit", language: "Deutsch", whenToUse: "Vor Termin 8" },
      { title: "Langzeitbelichtung am Tag: Schritt-für-Schritt Anleitung", url: "https://www.suitcaseandwanderlust.com/langzeitbelichtung-am-tag/", type: "Blog-Artikel", duration: "ca. 8 Min Lesezeit", language: "Deutsch", whenToUse: "Vor Termin 8" },
    ],
    materials: [],
    galleryFolderId: "", // Mario: Google Drive Folder ID für Session 8
  },
  {
    id: "09-workflow-recht",
    sessionNumber: 9,
    date: "01.06.2026",
    time: "09:55-13:05",
    room: "K115",
    title: "Workflow, Recht, UX & Start Abschlussarbeit",
    schwerpunkt: "Workflow/Recht/UX",
    description: "Wir definieren euren persönlichen Foto-Workflow (Import → Auswahl → Bearbeitung → Export → Backup), besprechen Urheberrecht und Bildrechte und starten offiziell in die Abschlussarbeit.",
    topics: [
      "Persönlicher Foto-Workflow definieren",
      "Urheberrecht & Bildrechte in Deutschland",
      "Backup-Strategien & Katalogpflege",
      "Briefing: Abschlussarbeit",
    ],
    projectSubmission: "Abgabe P4 / Start Abschlussarbeit",
    homework: {
      number: "HA9",
      title: "Mein Foto-Workflow",
      deadline: "07.06.2026, 23:59",
      goal: "Eigenen Workflow definieren",
      description: "Workflow-Diagramm + Screenshot Katalog + 3 Verbesserungspunkte",
      format: "1 PDF (Diagramm + Screenshot)",
      learningFocus: "Workflow, Organisation, Backup",
    },
    tutorials: [
      { title: "Organisation in Lightroom - Fotografie Projekte organisieren", url: "https://www.annamardo.de/lightroom-organisation/", type: "Blog-Artikel", duration: "ca. 6 Min Lesezeit", language: "Deutsch", whenToUse: "Vor/nach Termin 9" },
      { title: "Mastering Photography Workflow: Ein umfassender Leitfaden", url: "https://www.format.com/de/magazine/resources/photography/mastering-photography-workflow-guide/", type: "Blog-Artikel", duration: "ca. 10 Min Lesezeit", language: "Deutsch", whenToUse: "Selbststudium" },
    ],
    materials: [],
    galleryFolderId: "", // Mario: Google Drive Folder ID für Session 9
  },
  {
    id: "10-konzeptwerkstatt",
    sessionNumber: 10,
    date: "08.06.2026",
    time: "09:55-13:05",
    room: "K115",
    title: "Konzeptwerkstatt Abschlussarbeit + freies Shooting",
    schwerpunkt: "Konzept/Story",
    description: "Heute wird's konkret: Ihr stellt eure Themenskizzen vor, bekommt Feedback und verfeinert euer Konzept. Danach freies Shooting für die Abschlussarbeit mit individueller Beratung.",
    topics: [
      "Themenskizzen vorstellen & Feedback",
      "Konzept verfeinern & Machbarkeit prüfen",
      "Freies Shooting: Testbilder",
      "Individuelle Beratung",
    ],
    projectSubmission: "M1: Themenskizze Abschlussarbeit",
    homework: {
      number: "HA10",
      title: "Konzept-Finishing & Testshots",
      deadline: "14.06.2026, 23:59",
      goal: "Konzept konkret machen",
      description: "1-seitiges Konzept + 4-6 Testfotos Abschlussarbeit",
      format: "1 PDF (Konzept + Bilder)",
      learningFocus: "Konzeptarbeit, Machbarkeit",
    },
    tutorials: [],
    materials: [],
    galleryFolderId: "", // Mario: Google Drive Folder ID für Session 10
  },
  {
    id: "11-retusche-look",
    sessionNumber: 11,
    date: "15.06.2026",
    time: "09:55-13:05",
    room: "K115",
    title: "LR/PS-Vertiefung, Retusche & konsistenter Look",
    schwerpunkt: "Bildbearbeitung/Technik",
    description: "Fortgeschrittene Bearbeitung: Retusche-Techniken, Schärfen, Rauschreduzierung und wie ihr einen konsistenten Look über eure gesamte Abschluss-Serie hinbekommt. Lightroom + Photoshop im Zusammenspiel.",
    topics: [
      "Retusche in Lightroom & Photoshop",
      "Schärfen & Rauschreduzierung",
      "Konsistenter Look für die Serie",
      "Before/After Workflow",
    ],
    projectSubmission: "Abgabe P5 / M2: Rohserie (4-6 Bilder)",
    homework: {
      number: "HA11",
      title: "Before/After Abschlussarbeit",
      deadline: "21.06.2026, 23:59",
      goal: "Bearbeitung als kreatives Werkzeug nutzen",
      description: "2 Bilder Before/After + Reflexion Bearbeitungsschritte",
      format: "1 PDF (Vorher/Nachher)",
      learningFocus: "Retusche, Schärfen, Look",
    },
    tutorials: [
      { title: "So schärfst du richtig in Adobe Lightroom", url: "https://www.youtube.com/watch?v=GU0WhDyQ4vg", type: "YouTube Video", duration: "ca. 8 Min", language: "Deutsch", whenToUse: "Vor Termin 11" },
      { title: "Retuschieren von Fotos in Lightroom Classic", url: "https://helpx.adobe.com/de/lightroom-classic/help/retouch-photos.html", type: "Adobe Help", duration: "ca. 5 Min Lesezeit", language: "Deutsch", whenToUse: "Selbststudium" },
    ],
    materials: [],
    galleryFolderId: "", // Mario: Google Drive Folder ID für Session 11
  },
  {
    id: "12-praesentation-portfolio",
    sessionNumber: 12,
    date: "22.06.2026",
    time: "09:55-13:05",
    room: "K115",
    title: "Präsentation, Portfolio & Generalprobe",
    schwerpunkt: "Präsentation/Portfolio",
    description: "Generalprobe für die Prüfung! Ihr stellt eure nahezu fertige Serie vor, übt die Präsentation und bekommt letztes Feedback. Dazu Tipps für Portfolio-Aufbau und Bildreihenfolge.",
    topics: [
      "Generalprobe: Serie präsentieren",
      "Feedback & letzte Korrekturen",
      "Portfolio-Aufbau & Bildreihenfolge",
      "Prüfungsvorbereitung: Ablauf & Tipps",
    ],
    projectSubmission: "M3: Nahezu fertige Serie (8-12 Bilder)",
    homework: {
      number: "HA12",
      title: "Prüfungs-Skript & Bildreihenfolge",
      deadline: "27.06.2026, 23:59",
      goal: "Sicher in Präsentation gehen",
      description: "Endgültige Bildreihenfolge + Stichwort-Skript + PDF-Portfolio",
      format: "1 PDF (Serie + Skript)",
      learningFocus: "Präsentationsvorbereitung",
    },
    tutorials: [],
    materials: [],
    galleryFolderId: "", // Mario: Google Drive Folder ID für Session 12
  },
  {
    id: "13-pruefung",
    sessionNumber: 13,
    date: "29.06.2026",
    time: "09:55-13:05",
    room: "K115",
    title: "Prüfungs-Session & Retrospektive",
    schwerpunkt: "Prüfung",
    description: "Der große Tag! Ihr präsentiert eure Abschlussarbeiten (8-12 Bilder als zusammenhängende Serie). Danach Retrospektive: Was habt ihr gelernt? Wie geht's weiter mit der Fotografie?",
    topics: [
      "Prüfungspräsentationen",
      "Bewertung & Feedback",
      "Kurs-Retrospektive",
      "Ausblick: Wege in der Fotografie",
    ],
    projectSubmission: "Prüfung: Abschlussarbeit",
    homework: null,
    tutorials: [],
    materials: [],
    galleryFolderId: "", // Mario: Google Drive Folder ID für Session 13
  },
];

// ============================================================
// COMPUTED EXPORTS
// ============================================================

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