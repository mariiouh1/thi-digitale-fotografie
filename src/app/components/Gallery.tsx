/**
 * Gallery Component
 * 
 * Features:
 *   - Bento Grid Layout with aspect-ratio-aware sizing
 *   - Lightbox with keyboard navigation
 *   - Password-protected overlay (stored in sessionStorage)
 *   - Loads images from Google Drive folder
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  AlertCircle,
  Unlock,
} from "lucide-react";
import { useGoogleDriveImages, type DriveImage } from "./useGoogleDriveImages";

const STORAGE_KEY = "kursportal_gallery_unlocked";

// ============================================================
// ASPECT-RATIO BASED GRID SIZING
// ============================================================

/**
 * Determines grid span based on actual image aspect ratio.
 * 
 * - Very wide (panorama, 2:1+)  → 2 cols, 1 row
 * - Landscape (3:2 – 2:1)       → 2 cols, 1 row (or 1 col on smaller grids)
 * - Standard landscape (4:3)     → 1 col, 1 row
 * - Square-ish (0.8 – 1.2)      → 1 col, 1 row
 * - Portrait (2:3 – 3:4)        → 1 col, 2 rows
 * - Very tall (< 2:3)           → 1 col, 2 rows
 * 
 * Every ~6th image gets promoted to "hero" (2x2) for visual variety,
 * but only if aspect ratio allows it (not extremely narrow).
 */
function getGridSpan(
  image: DriveImage,
  index: number,
  totalImages: number
): { colSpan: number; rowSpan: number } {
  const r = image.aspectRatio;

  // Hero promotion: every 6th image starting at 0, only if roughly square-ish or landscape
  const isHeroCandidate = index % 7 === 0 && totalImages > 3;
  if (isHeroCandidate && r > 0.7 && r < 2.0) {
    return { colSpan: 2, rowSpan: 2 };
  }

  // Very wide / panorama (ratio > 1.8)
  if (r > 1.8) {
    return { colSpan: 2, rowSpan: 1 };
  }

  // Landscape (ratio 1.3 – 1.8)
  if (r > 1.3) {
    return { colSpan: 2, rowSpan: 1 };
  }

  // Standard / slightly landscape (ratio 1.0 – 1.3)
  if (r >= 0.85) {
    return { colSpan: 1, rowSpan: 1 };
  }

  // Portrait (ratio 0.5 – 0.85)
  if (r >= 0.5) {
    return { colSpan: 1, rowSpan: 2 };
  }

  // Very tall / narrow (ratio < 0.5)
  return { colSpan: 1, rowSpan: 2 };
}

// ============================================================
// PASSWORD OVERLAY
// ============================================================

interface PasswordOverlayProps {
  correctPassword: string;
  onUnlock: () => void;
  imageCount: number;
}

function PasswordOverlay({ correctPassword, onUnlock, imageCount }: PasswordOverlayProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === correctPassword) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 2000);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06]">
      {/* Blurred preview background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-indigo-500/5 to-purple-500/5" />
      <div className="grid grid-cols-3 gap-1 p-2 opacity-20 blur-sm">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-white/10"
          />
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm px-6"
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.08]">
              <Lock className="h-6 w-6 text-white/40" />
            </div>
            <h3 className="mb-1 text-[1rem] text-white/80">Galerie geschützt</h3>
            <p className="mb-5 text-[0.8rem] text-white/30">
              {imageCount > 0
                ? `${imageCount} Bilder · Passwort erforderlich`
                : "Passwort erforderlich zum Anzeigen"}
            </p>

            <form onSubmit={handleSubmit} className="w-full">
              <motion.div
                animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="relative mb-3"
              >
                <input
                  ref={inputRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Passwort eingeben..."
                  className={`w-full rounded-xl border bg-white/[0.04] px-4 py-3 pr-10 text-[0.85rem] text-white/80 placeholder-white/20 outline-none transition-all focus:border-violet-500/40 focus:bg-white/[0.06] ${
                    error ? "border-red-500/40" : "border-white/[0.08]"
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 text-[0.75rem] text-red-400"
                  >
                    Falsches Passwort
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600/80 px-4 py-3 text-[0.85rem] text-white transition-all hover:bg-violet-600"
              >
                <Unlock className="h-4 w-4" />
                Galerie entsperren
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================
// LIGHTBOX
// ============================================================

interface LightboxProps {
  images: DriveImage[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

function Lightbox({ images, currentIndex, onClose, onNext, onPrev }: LightboxProps) {
  const image = images[currentIndex];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev]);

  // Prevent scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!image) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 transition-all hover:bg-white/20 hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-[0.75rem] text-white/50">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Prev */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/60 transition-all hover:bg-white/20 hover:text-white sm:left-6"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Next */}
      {currentIndex < images.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/60 transition-all hover:bg-white/20 hover:text-white sm:right-6"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      <motion.div
        key={image.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.fullUrl}
          alt={image.name}
          className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          loading="eager"
        />
        {/* Image name */}
        <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
          <p className="text-[0.8rem] text-white/70 truncate">{image.name}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// BENTO GRID (aspect-ratio aware)
// ============================================================

interface BentoGridProps {
  images: DriveImage[];
  onImageClick: (index: number) => void;
}

function BentoGrid({ images, onImageClick }: BentoGridProps) {
  return (
    <div className="grid auto-rows-[140px] grid-cols-2 gap-2 sm:auto-rows-[180px] sm:grid-cols-3 md:grid-cols-4 md:gap-3">
      {images.map((image, i) => {
        const { colSpan, rowSpan } = getGridSpan(image, i, images.length);
        // On mobile (< sm), force single column spans to avoid overflow
        const colClass = colSpan === 2 ? "col-span-1 sm:col-span-2" : "col-span-1";
        const rowClass = rowSpan === 2 ? "row-span-2" : "row-span-1";

        return (
          <motion.button
            key={image.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.6) }}
            className={`group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] focus:outline-none focus:ring-2 focus:ring-violet-500/40 ${colClass} ${rowClass}`}
            onClick={() => onImageClick(i)}
          >
            <img
              src={image.thumbnailUrl}
              alt={image.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/20" />
            <div className="absolute inset-0 flex items-end opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="w-full bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                <p className="text-[0.7rem] text-white/80 truncate">{image.name}</p>
                <p className="text-[0.6rem] text-white/40">
                  {image.width} × {image.height}
                </p>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// ============================================================
// MAIN GALLERY COMPONENT
// ============================================================

interface GalleryProps {
  folderId?: string;
  password: string;
  title?: string;
  subtitle?: string;
}

export function Gallery({ folderId, password, title, subtitle }: GalleryProps) {
  const { images, loading, error } = useGoogleDriveImages(folderId);
  const [unlocked, setUnlocked] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Check sessionStorage on mount
  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "true") {
      setUnlocked(true);
    }
  }, []);

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : prev));
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  const handleClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  // Don't show gallery if no folder ID
  if (!folderId || !folderId.trim()) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2 className="flex items-center gap-2 text-[0.8rem] text-white/40 uppercase tracking-wider">
              <ImageIcon className="h-3.5 w-3.5" />
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-1 text-[0.75rem] text-white/25">{subtitle}</p>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-violet-400/50" />
            <p className="text-[0.8rem] text-white/25">Bilder werden geladen...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/10 bg-red-500/[0.03] px-5 py-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400/50" />
          <div>
            <p className="text-[0.8rem] text-red-300/70">Galerie konnte nicht geladen werden</p>
            <p className="text-[0.7rem] text-white/25">{error}</p>
          </div>
        </div>
      )}

      {/* Gallery content */}
      {!loading && !error && images.length > 0 && (
        <>
          {unlocked ? (
            <BentoGrid
              images={images}
              onImageClick={(index) => setLightboxIndex(index)}
            />
          ) : (
            <PasswordOverlay
              correctPassword={password}
              onUnlock={() => setUnlocked(true)}
              imageCount={images.length}
            />
          )}

          {/* Lightbox */}
          <AnimatePresence>
            {lightboxIndex !== null && unlocked && (
              <Lightbox
                images={images}
                currentIndex={lightboxIndex}
                onClose={handleClose}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            )}
          </AnimatePresence>
        </>
      )}

      {/* Empty state */}
      {!loading && !error && images.length === 0 && (
        <div className="flex items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] py-12">
          <div className="flex flex-col items-center gap-2 text-center">
            <ImageIcon className="h-8 w-8 text-white/10" />
            <p className="text-[0.8rem] text-white/25">Noch keine Bilder in dieser Galerie</p>
          </div>
        </div>
      )}
    </div>
  );
}
