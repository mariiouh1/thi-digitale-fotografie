/**
 * ============================================================
 * STORYBLOK KURSPORTAL – COMPLETE SETUP SCRIPT
 * ============================================================
 * 
 * Dieses Script legt in Storyblok alles an:
 *   1. Components (Content Types): material, course_info, course_session
 *   2. Folder-Struktur: "Kursportal" mit Unterordner "Sessions"
 *   3. Stories: 1x course_info (Singleton) + 11x course_session (pre-filled)
 * 
 * ANLEITUNG:
 *   1. Öffne https://script.google.com
 *   2. Neues Projekt erstellen
 *   3. Diesen Code einfügen
 *   4. STORYBLOK_TOKEN unten eintragen (Management API Token!)
 *   5. Funktion "main" ausführen
 * 
 * HINWEIS: Das Script löscht KEINE bestehenden Inhalte.
 *          Falls du es mehrfach ausführst, werden Duplikate erstellt.
 *          Nutze "cleanAll" zum Zurücksetzen vor erneutem Ausführen.
 * ============================================================
 */

// ============================================================
// KONFIGURATION – Hier deine Werte eintragen
// ============================================================
const CONFIG = {
  SPACE_ID: "291045863485848",
  TOKEN: "DEIN_MANAGEMENT_API_TOKEN_HIER", // ← Management Token aus Storyblok Settings > Access Tokens
  API_BASE: "https://mapi.storyblok.com/v1",
  RATE_LIMIT_MS: 500, // Pause zwischen API-Calls (Storyblok Rate Limit)
};

// ============================================================
// API HELPER
// ============================================================

function apiCall(method, endpoint, payload) {
  const url = `${CONFIG.API_BASE}/spaces/${CONFIG.SPACE_ID}${endpoint}`;
  const options = {
    method: method,
    headers: {
      "Authorization": CONFIG.TOKEN,
      "Content-Type": "application/json",
    },
    muteHttpExceptions: true,
  };
  if (payload) {
    options.payload = JSON.stringify(payload);
  }

  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();
  const body = response.getContentText();

  if (code >= 400) {
    Logger.log(`❌ ${method} ${endpoint} → ${code}`);
    Logger.log(body);
    throw new Error(`API Error ${code}: ${body.substring(0, 300)}`);
  }

  Utilities.sleep(CONFIG.RATE_LIMIT_MS);

  if (body && body.trim().length > 0) {
    return JSON.parse(body);
  }
  return null;
}

function apiGet(endpoint) { return apiCall("get", endpoint); }
function apiPost(endpoint, payload) { return apiCall("post", endpoint, payload); }
function apiPut(endpoint, payload) { return apiCall("put", endpoint, payload); }
function apiDelete(endpoint) { return apiCall("delete", endpoint); }

// ============================================================
// SCHRITT 1: COMPONENTS (Content Types) ANLEGEN
// ============================================================

/**
 * Nested Block: "material"
 * Wird innerhalb von course_session als Bloks-Feld verwendet.
 * Mario kann pro Session beliebig viele Materialien anlegen.
 */
function createComponentMaterial() {
  Logger.log("📦 Erstelle Component: material ...");

  const result = apiPost("/components", {
    component: {
      name: "material",
      display_name: "Kursmaterial",
      is_root: false,      // Nested block, kein eigenständiger Content Type
      is_nestable: true,
      schema: {
        name: {
          type: "text",
          display_name: "Dateiname",
          description: "Anzeigename des Materials (z.B. 'Slides: Belichtungsdreieck')",
          pos: 0,
          required: true,
        },
        url: {
          type: "text",
          display_name: "Download-URL",
          description: "Link zur Datei (Google Drive, Dropbox, etc.)",
          pos: 1,
          required: true,
        },
        type: {
          type: "option",
          display_name: "Dateityp",
          description: "Art des Materials",
          pos: 2,
          use_uuid: false,
          options: [
            { name: "PDF", value: "pdf" },
            { name: "ZIP-Archiv", value: "zip" },
            { name: "Externer Link", value: "link" },
            { name: "Video", value: "video" },
          ],
          default_value: "pdf",
        },
        size: {
          type: "text",
          display_name: "Dateigröße",
          description: "Optional – z.B. '2.4 MB'",
          pos: 3,
        },
      },
    },
  });

  Logger.log(`✅ Component 'material' erstellt (ID: ${result.component.id})`);
  return result.component.id;
}

/**
 * Singleton: "course_info"
 * Allgemeine Kursinfos – nur 1x pro Kurs.
 */
function createComponentCourseInfo() {
  Logger.log("📦 Erstelle Component: course_info ...");

  const result = apiPost("/components", {
    component: {
      name: "course_info",
      display_name: "Kurs-Informationen",
      is_root: true,
      is_nestable: false,
      schema: {
        // --- Kurs-Basics ---
        tab_basics: {
          type: "tab",
          display_name: "Kurs-Basics",
          pos: 0,
        },
        title: {
          type: "text",
          display_name: "Kurstitel",
          description: "z.B. 'Digitale Fotografie'",
          pos: 1,
          required: true,
        },
        subtitle: {
          type: "text",
          display_name: "Untertitel",
          description: "z.B. 'Sommersemester 2026'",
          pos: 2,
        },
        description: {
          type: "textarea",
          display_name: "Kursbeschreibung",
          description: "Ausführliche Beschreibung des Kurses",
          pos: 3,
        },
        semester: {
          type: "text",
          display_name: "Semester",
          description: "z.B. 'SoSe 2026'",
          pos: 4,
        },
        schedule: {
          type: "text",
          display_name: "Zeitplan",
          description: "z.B. 'Mittwochs, 14:00 – 17:15 Uhr'",
          pos: 5,
        },
        room: {
          type: "text",
          display_name: "Raum",
          description: "z.B. 'Raum G.013 – Fotolabor'",
          pos: 6,
        },
        credits: {
          type: "text",
          display_name: "ECTS Credits",
          description: "z.B. '5 ECTS'",
          pos: 7,
        },
        // --- Dozent ---
        tab_instructor: {
          type: "tab",
          display_name: "Dozent",
          pos: 8,
        },
        instructor_name: {
          type: "text",
          display_name: "Name des Dozenten",
          pos: 9,
          required: true,
        },
        instructor_title: {
          type: "text",
          display_name: "Titel / Rolle",
          description: "z.B. 'Dozent für Digitale Fotografie'",
          pos: 10,
        },
        instructor_image: {
          type: "text",
          display_name: "Dozenten-Bild URL",
          description: "ImageKit oder andere Bild-URL",
          pos: 11,
        },
        instructor_bio: {
          type: "textarea",
          display_name: "Kurzbiografie",
          pos: 12,
        },
        // --- Bilder & Highlights ---
        tab_visuals: {
          type: "tab",
          display_name: "Bilder & Highlights",
          pos: 13,
        },
        hero_image: {
          type: "text",
          display_name: "Hero-Bild URL",
          description: "Großes Headerbild auf der Startseite",
          pos: 14,
        },
        highlights: {
          type: "textarea",
          display_name: "Kurs-Highlights",
          description: "Ein Highlight pro Zeile – wird als Liste angezeigt",
          pos: 15,
        },
      },
    },
  });

  Logger.log(`✅ Component 'course_info' erstellt (ID: ${result.component.id})`);
  return result.component.id;
}

/**
 * Collection: "course_session"
 * Pro Kurstermin eine Story – Mario legt neue an / löscht alte.
 * Das Datum wird für die zeitbasierte Fortschrittsberechnung verwendet.
 */
function createComponentCourseSession(materialComponentId) {
  Logger.log("📦 Erstelle Component: course_session ...");

  const result = apiPost("/components", {
    component: {
      name: "course_session",
      display_name: "Kurstermin",
      is_root: true,
      is_nestable: false,
      schema: {
        session_number: {
          type: "number",
          display_name: "Session-Nummer",
          description: "Reihenfolge im Kursplan (1, 2, 3, ...)",
          pos: 0,
          required: true,
        },
        date: {
          type: "text",
          display_name: "Datum",
          description: "Format: TT.MM.JJJJ (z.B. '16.04.2026') – WICHTIG für automatische Fortschrittsberechnung!",
          pos: 1,
          required: true,
        },
        title: {
          type: "text",
          display_name: "Titel der Session",
          description: "z.B. 'Das Belichtungsdreieck'",
          pos: 2,
          required: true,
        },
        description: {
          type: "textarea",
          display_name: "Beschreibung",
          description: "Ausführliche Beschreibung der Kursstunde",
          pos: 3,
        },
        topics: {
          type: "textarea",
          display_name: "Themen",
          description: "Ein Thema pro Zeile",
          pos: 4,
        },
        materials: {
          type: "bloks",
          display_name: "Kursmaterialien",
          description: "Dateien zum Download – beliebig viele hinzufügen",
          pos: 5,
          restrict_type: "",
          restrict_components: true,
          component_whitelist: ["material"],
        },
      },
    },
  });

  Logger.log(`✅ Component 'course_session' erstellt (ID: ${result.component.id})`);
  return result.component.id;
}

// ============================================================
// SCHRITT 2: FOLDER-STRUKTUR ANLEGEN
// ============================================================

function createFolders() {
  Logger.log("📁 Erstelle Folder-Struktur ...");

  // Hauptordner: "Kursportal"
  const kursportal = apiPost("/stories", {
    story: {
      name: "Kursportal",
      slug: "kursportal",
      is_folder: true,
      default_root: "course_info",
    },
  });
  const kursportalId = kursportal.story.id;
  Logger.log(`✅ Folder 'Kursportal' erstellt (ID: ${kursportalId})`);

  // Unterordner: "Sessions" (für alle Kurstermine)
  const sessions = apiPost("/stories", {
    story: {
      name: "Sessions",
      slug: "sessions",
      is_folder: true,
      parent_id: kursportalId,
      default_root: "course_session",
    },
  });
  const sessionsId = sessions.story.id;
  Logger.log(`✅ Folder 'Sessions' erstellt (ID: ${sessionsId})`);

  return { kursportalId, sessionsId };
}

// ============================================================
// SCHRITT 3: STORIES MIT DUMMY-DATEN ANLEGEN
// ============================================================

/**
 * Kurs-Informationen (Singleton)
 */
function createCourseInfoStory(kursportalFolderId) {
  Logger.log("📝 Erstelle Story: Kurs-Informationen ...");

  const result = apiPost("/stories", {
    story: {
      name: "Kurs-Informationen",
      slug: "kurs-informationen",
      parent_id: kursportalFolderId,
      content: {
        component: "course_info",
        title: "Digitale Fotografie",
        subtitle: "Sommersemester 2026",
        description: "Von den Grundlagen der Kameratechnik bis zur professionellen Bildbearbeitung – dieser Kurs vermittelt euch das Handwerk der digitalen Fotografie. Theorie trifft Praxis: Jede Woche neue Techniken, Hands-on Übungen und kreative Challenges.",
        semester: "SoSe 2026",
        schedule: "Mittwochs, 14:00 – 17:15 Uhr",
        room: "Raum G.013 – Fotolabor",
        credits: "5 ECTS",
        instructor_name: "Mario Schubert",
        instructor_title: "Dozent für Digitale Fotografie",
        instructor_image: "https://ik.imagekit.io/r2yqrg6np/6966a461e78df6320fd2fd1e_20251019_Hundeshooting-3528_(WebRes).jpg?updatedAt=1772998407934",
        instructor_bio: "Professioneller Fotograf mit Schwerpunkt Hochzeits-, Tier- und Porträtfotografie in Tirol und Bayern. Mario verbindet jahrelange Praxiserfahrung mit seiner Leidenschaft für die Lehre.",
        hero_image: "https://images.unsplash.com/photo-1736066330610-c102cab4e942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
        highlights: "Praxisorientiert mit wöchentlichen Foto-Challenges\nProfessionelle Ausrüstung im Fotolabor verfügbar\nPortfolio-Review am Semesterende\nGastvorträge von Branchenprofis",
      },
      publish: 1,
    },
    publish: 1,
  });

  Logger.log(`✅ Story 'Kurs-Informationen' erstellt & published (ID: ${result.story.id})`);
  return result.story.id;
}

/**
 * Alle 11 Kurstermine als einzelne Stories
 */
function createSessionStories(sessionsFolderId) {
  Logger.log("📝 Erstelle Session-Stories ...");

  const sessions = [
    {
      slug: "01-einfuehrung",
      name: "01 – Einführung & Kameratechnik Basics",
      content: {
        component: "course_session",
        session_number: 1,
        date: "16.04.2026",
        title: "Einführung & Kameratechnik Basics",
        description: "Willkommen im Kurs! Wir starten mit einer Übersicht über den Semesterplan, lernen uns kennen und steigen direkt in die Grundlagen ein: Wie funktioniert eine Digitalkamera? Was bedeuten Sensor, Verschluss und Objektiv? Ihr bekommt eure erste Hands-on Session mit den Kamera-Leihgeräten.",
        topics: "Kursübersicht & Organisatorisches\nAufbau einer Digitalkamera\nSensor-Typen: APS-C vs. Vollformat\nErste Hands-on Übung",
        materials: [
          { component: "material", name: "Kursübersicht SoSe 2026", url: "#", type: "pdf", size: "1.2 MB", _uid: Utilities.getUuid() },
          { component: "material", name: "Slides: Kameratechnik Basics", url: "#", type: "pdf", size: "4.8 MB", _uid: Utilities.getUuid() },
        ],
      },
    },
    {
      slug: "02-belichtungsdreieck",
      name: "02 – Das Belichtungsdreieck",
      content: {
        component: "course_session",
        session_number: 2,
        date: "23.04.2026",
        title: "Das Belichtungsdreieck",
        description: "Das Herzstück der Fotografie: Blende, Verschlusszeit und ISO. Wir verstehen nicht nur die Theorie, sondern experimentieren im Fotolabor mit verschiedenen Einstellungen. Am Ende der Session könnt ihr manuell belichten und wisst, wann welche Einstellung Sinn macht.",
        topics: "Blende (Aperture) & Schärfentiefe\nVerschlusszeit & Bewegungsunschärfe\nISO & Bildrauschen\nPraxis: Manueller Modus",
        materials: [
          { component: "material", name: "Slides: Belichtungsdreieck", url: "#", type: "pdf", size: "3.6 MB", _uid: Utilities.getUuid() },
          { component: "material", name: "Cheat Sheet: Belichtung", url: "#", type: "pdf", size: "0.8 MB", _uid: Utilities.getUuid() },
          { component: "material", name: "Übungsblatt Woche 2", url: "#", type: "pdf", size: "0.5 MB", _uid: Utilities.getUuid() },
        ],
      },
    },
    {
      slug: "03-komposition",
      name: "03 – Bildkomposition & Gestaltungsregeln",
      content: {
        component: "course_session",
        session_number: 3,
        date: "30.04.2026",
        title: "Bildkomposition & Gestaltungsregeln",
        description: "Ein gutes Foto ist mehr als korrekte Belichtung. Wir lernen die wichtigsten Gestaltungsregeln: Drittelregel, Goldener Schnitt, Führungslinien, Rahmen im Bild und Symmetrie. Danach geht's raus – Foto-Walk auf dem Campus mit konkreten Aufgaben.",
        topics: "Drittelregel & Goldener Schnitt\nFührungslinien & Fluchtpunkte\nSymmetrie & Patterns\nFoto-Walk: Campus Kompositions-Challenge",
        materials: [
          { component: "material", name: "Slides: Bildkomposition", url: "#", type: "pdf", size: "5.2 MB", _uid: Utilities.getUuid() },
          { component: "material", name: "Inspiration Board (Pinterest)", url: "#", type: "link", size: "", _uid: Utilities.getUuid() },
        ],
      },
    },
    {
      slug: "04-licht",
      name: "04 – Licht verstehen & nutzen",
      content: {
        component: "course_session",
        session_number: 4,
        date: "07.05.2026",
        title: "Licht verstehen & nutzen",
        description: "Licht ist das wichtigste Werkzeug eines Fotografen. Natural Light, Golden Hour, Blue Hour, hartes vs. weiches Licht – wir analysieren Lichtsituationen und lernen, wie man mit einfachen Mitteln (Reflektor, Diffusor) Licht kontrolliert.",
        topics: "Lichtqualitäten: hart vs. weich\nFarbtemperatur & Weißabgleich\nGolden Hour & Blue Hour\nPraxis: Available Light Portraits",
        materials: [
          { component: "material", name: "Slides: Licht in der Fotografie", url: "#", type: "pdf", size: "4.1 MB", _uid: Utilities.getUuid() },
          { component: "material", name: "Golden Hour Rechner (Link)", url: "#", type: "link", size: "", _uid: Utilities.getUuid() },
        ],
      },
    },
    {
      slug: "05-portrait",
      name: "05 – Porträtfotografie",
      content: {
        component: "course_session",
        session_number: 5,
        date: "14.05.2026",
        title: "Porträtfotografie",
        description: "People Photography! Von der richtigen Brennweite über Posing-Basics bis zur Kommunikation mit dem Model. Wir üben uns gegenseitig zu fotografieren und lernen, wie man Menschen vor der Kamera zum Strahlen bringt.",
        topics: "Brennweiten für Portraits\nPosing-Grundlagen\nKommunikation mit dem Model\nStudio-Setup: 1-Licht-Portrait",
        materials: [
          { component: "material", name: "Slides: Porträtfotografie", url: "#", type: "pdf", size: "6.3 MB", _uid: Utilities.getUuid() },
          { component: "material", name: "Posing Guide", url: "#", type: "pdf", size: "2.1 MB", _uid: Utilities.getUuid() },
        ],
      },
    },
    {
      slug: "06-landschaft",
      name: "06 – Landschafts- & Architekturfotografie",
      content: {
        component: "course_session",
        session_number: 6,
        date: "21.05.2026",
        title: "Landschafts- & Architekturfotografie",
        description: "Raus in die Natur! Wir besprechen Techniken für Landschaftsaufnahmen: Stativ-Einsatz, Langzeitbelichtung, Filter und HDR. Dazu gibt's einen Exkurs in Architekturfotografie mit Fokus auf Linien und Perspektive.",
        topics: "Stativ & Langzeitbelichtung\nND-Filter & Polfilter\nHDR-Technik\nArchitektur: Perspektivkorrektur",
        materials: [
          { component: "material", name: "Slides: Landschaft & Architektur", url: "#", type: "pdf", size: "5.7 MB", _uid: Utilities.getUuid() },
        ],
      },
    },
    {
      slug: "07-lightroom",
      name: "07 – Adobe Lightroom: RAW-Entwicklung",
      content: {
        component: "course_session",
        session_number: 7,
        date: "28.05.2026",
        title: "Adobe Lightroom: RAW-Entwicklung",
        description: "Der digitale Dunkelraum. Warum RAW statt JPEG? Wir lernen Lightroom von Grund auf: Import, Katalogisierung, Grundentwicklung, Farbanpassungen und Export. Jeder bringt eigene Fotos mit und bearbeitet live.",
        topics: "RAW vs. JPEG\nLightroom: Import & Katalog\nGrundentwicklung & Tonwerte\nFarb-Grading & Presets",
        materials: [
          { component: "material", name: "Slides: Lightroom Workflow", url: "#", type: "pdf", size: "3.9 MB", _uid: Utilities.getUuid() },
          { component: "material", name: "Starter Presets Pack", url: "#", type: "zip", size: "12.4 MB", _uid: Utilities.getUuid() },
          { component: "material", name: "RAW-Übungsdateien", url: "#", type: "zip", size: "89.2 MB", _uid: Utilities.getUuid() },
        ],
      },
    },
    {
      slug: "08-photoshop",
      name: "08 – Adobe Photoshop: Retusche & Composing",
      content: {
        component: "course_session",
        session_number: 8,
        date: "04.06.2026",
        title: "Adobe Photoshop: Retusche & Composing",
        description: "Fortgeschrittene Bildbearbeitung in Photoshop. Wir lernen Ebenen, Masken, Frequenztrennung für Hautretusche und einfache Composings. Wann braucht man Photoshop und wann reicht Lightroom?",
        topics: "Ebenen & Masken\nFrequenztrennung (Hautretusche)\nDodge & Burn\nEinfaches Composing",
        materials: [
          { component: "material", name: "Slides: Photoshop Retusche", url: "#", type: "pdf", size: "4.5 MB", _uid: Utilities.getUuid() },
          { component: "material", name: "Übungsdateien Retusche", url: "#", type: "zip", size: "34.7 MB", _uid: Utilities.getUuid() },
        ],
      },
    },
    {
      slug: "09-storytelling",
      name: "09 – Visuelles Storytelling & Reportage",
      content: {
        component: "course_session",
        session_number: 9,
        date: "11.06.2026",
        title: "Visuelles Storytelling & Reportage",
        description: "Ein Foto erzählt eine Geschichte. Wir beschäftigen uns mit Bildserien, Reportage-Fotografie und wie man mit Bildern Emotionen transportiert. Gastvortrag: Einblicke in die Hochzeitsfotografie als visuelles Storytelling.",
        topics: "Storytelling mit Bildern\nReportage-Fotografie\nBildserien & Editing\nGastvortrag: Hochzeitsfotografie",
        materials: [
          { component: "material", name: "Slides: Visuelles Storytelling", url: "#", type: "pdf", size: "5.0 MB", _uid: Utilities.getUuid() },
          { component: "material", name: "Gastvortrag Recording", url: "#", type: "video", size: "", _uid: Utilities.getUuid() },
        ],
      },
    },
    {
      slug: "10-projekt",
      name: "10 – Projektarbeit & Beratung",
      content: {
        component: "course_session",
        session_number: 10,
        date: "18.06.2026",
        title: "Projektarbeit & Beratung",
        description: "Freie Session für eure Semesterprojekte. Individuelle Beratung zu euren Portfolio-Arbeiten, offene Fragen klären, gemeinsames Feedback in der Gruppe. Vorbereitung auf die finale Präsentation.",
        topics: "Individuelle Projektberatung\nPeer-Review in Kleingruppen\nPortfolio-Aufbau Tipps\nTechnische Fragen klären",
        materials: [
          { component: "material", name: "Portfolio-Template", url: "#", type: "zip", size: "8.3 MB", _uid: Utilities.getUuid() },
          { component: "material", name: "Bewertungskriterien", url: "#", type: "pdf", size: "0.4 MB", _uid: Utilities.getUuid() },
        ],
      },
    },
    {
      slug: "11-praesentationen",
      name: "11 – Abschlusspräsentationen & Portfolio-Review",
      content: {
        component: "course_session",
        session_number: 11,
        date: "25.06.2026",
        title: "Abschlusspräsentationen & Portfolio-Review",
        description: "Der große Abschluss! Ihr präsentiert eure Semester-Portfolios vor der Gruppe. Konstruktives Feedback, Diskussion und Ausblick – was kommt nach dem Kurs? Möglichkeiten in der Fotografie, Community und Weiterbildung.",
        topics: "Portfolio-Präsentationen\nGruppen-Feedback & Diskussion\nAusblick: Wege in der Fotografie\nKursabschluss & Feedback",
        materials: [
          { component: "material", name: "Abschluss-Infos & Noten", url: "#", type: "pdf", size: "0.3 MB", _uid: Utilities.getUuid() },
        ],
      },
    },
  ];

  const createdIds = [];
  for (const session of sessions) {
    const result = apiPost("/stories", {
      story: {
        name: session.name,
        slug: session.slug,
        parent_id: sessionsFolderId,
        content: session.content,
        publish: 1,
      },
      publish: 1,
    });
    Logger.log(`  ✅ Session '${session.name}' erstellt (ID: ${result.story.id})`);
    createdIds.push(result.story.id);
  }

  Logger.log(`✅ Alle ${sessions.length} Sessions erstellt!`);
  return createdIds;
}

// ============================================================
// MAIN – Alles der Reihe nach ausführen
// ============================================================

function main() {
  Logger.log("🚀 STORYBLOK KURSPORTAL SETUP – Start");
  Logger.log("=========================================");

  // Validierung
  if (CONFIG.TOKEN === "DEIN_MANAGEMENT_API_TOKEN_HIER") {
    throw new Error("❌ Bitte trage deinen Storyblok Management API Token in CONFIG.TOKEN ein!");
  }

  // 1. Components anlegen (Reihenfolge wichtig: material zuerst, da course_session es referenziert)
  Logger.log("\n📦 SCHRITT 1: Components anlegen ...");
  const materialId = createComponentMaterial();
  const courseInfoId = createComponentCourseInfo();
  const courseSessionId = createComponentCourseSession(materialId);

  // 2. Folder-Struktur anlegen
  Logger.log("\n📁 SCHRITT 2: Folder-Struktur anlegen ...");
  const { kursportalId, sessionsId } = createFolders();

  // 3. Stories mit Dummy-Daten anlegen
  Logger.log("\n📝 SCHRITT 3: Stories anlegen ...");
  createCourseInfoStory(kursportalId);
  createSessionStories(sessionsId);

  // Fertig!
  Logger.log("\n=========================================");
  Logger.log("🎉 SETUP KOMPLETT!");
  Logger.log(`   📦 3 Components: material, course_info, course_session`);
  Logger.log(`   📁 2 Folder: Kursportal > Sessions`);
  Logger.log(`   📝 12 Stories: 1x Kurs-Info + 11x Sessions`);
  Logger.log(`   🌐 Alles published & ready to use!`);
  Logger.log("=========================================");
  Logger.log("");
  Logger.log("NÄCHSTE SCHRITTE:");
  Logger.log("  1. Gehe zu Storyblok → Content → Kursportal");
  Logger.log("  2. Prüfe ob alle Inhalte korrekt sind");
  Logger.log("  3. Ersetze '#' Download-URLs mit echten Links");
  Logger.log("  4. Verbinde das Frontend mit der Storyblok API");
}

// ============================================================
// CLEANUP – Alles löschen (vor erneutem Ausführen)
// ============================================================

/**
 * Löscht alle Kursportal-Stories und -Components.
 * ACHTUNG: Unwiderruflich! Nur ausführen wenn du sicher bist.
 */
function cleanAll() {
  Logger.log("🧹 CLEANUP – Lösche alle Kursportal-Inhalte ...");

  if (CONFIG.TOKEN === "DEIN_MANAGEMENT_API_TOKEN_HIER") {
    throw new Error("❌ Bitte trage deinen Storyblok Management API Token in CONFIG.TOKEN ein!");
  }

  // 1. Stories löschen
  Logger.log("\n🗑️ Lösche Stories ...");
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const response = apiGet(`/stories?per_page=100&page=${page}`);
    const stories = response.stories || [];
    if (stories.length === 0) {
      hasMore = false;
      break;
    }

    // Sortieren: Nicht-Folder zuerst, dann Folder (Kinder vor Eltern)
    const nonFolders = stories.filter(s => !s.is_folder);
    const folders = stories.filter(s => s.is_folder);

    for (const story of [...nonFolders, ...folders]) {
      // Nur Kursportal-relevante Stories löschen
      if (story.full_slug && (story.full_slug.startsWith("kursportal") || story.full_slug === "kursportal")) {
        try {
          apiDelete(`/stories/${story.id}`);
          Logger.log(`  🗑️ Story '${story.name}' gelöscht`);
        } catch (e) {
          Logger.log(`  ⚠️ Konnte '${story.name}' nicht löschen: ${e.message}`);
        }
      }
    }
    page++;
    if (stories.length < 100) hasMore = false;
  }

  // 2. Components löschen
  Logger.log("\n🗑️ Lösche Components ...");
  const componentsToDelete = ["course_session", "course_info", "material"];
  const allComponents = apiGet("/components");
  for (const comp of (allComponents.components || [])) {
    if (componentsToDelete.includes(comp.name)) {
      try {
        apiDelete(`/components/${comp.id}`);
        Logger.log(`  🗑️ Component '${comp.name}' gelöscht`);
      } catch (e) {
        Logger.log(`  ⚠️ Konnte '${comp.name}' nicht löschen: ${e.message}`);
      }
    }
  }

  Logger.log("\n✅ Cleanup abgeschlossen! Du kannst jetzt 'main' erneut ausführen.");
}

// ============================================================
// HELPER: Einzelne Schritte zum Testen
// ============================================================

/** Nur Components anlegen (zum Testen) */
function testCreateComponents() {
  const materialId = createComponentMaterial();
  createComponentCourseInfo();
  createComponentCourseSession(materialId);
}

/** Nur Folder anlegen (zum Testen) */
function testCreateFolders() {
  createFolders();
}

/** Status check: Zeigt alle bestehenden Components und Stories */
function statusCheck() {
  Logger.log("📊 STATUS CHECK");
  Logger.log("================");

  const components = apiGet("/components");
  Logger.log(`\n📦 Components (${components.components.length}):`);
  for (const c of components.components) {
    Logger.log(`   - ${c.name} (ID: ${c.id}, root: ${c.is_root}, nestable: ${c.is_nestable})`);
  }

  const stories = apiGet("/stories?per_page=100");
  Logger.log(`\n📝 Stories (${stories.stories.length}):`);
  for (const s of stories.stories) {
    Logger.log(`   - ${s.full_slug} ${s.is_folder ? '📁' : '📄'} (ID: ${s.id}, component: ${s.content?.component || 'folder'})`);
  }
}
