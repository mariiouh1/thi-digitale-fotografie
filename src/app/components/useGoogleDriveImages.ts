/**
 * Google Drive Images Hook
 * 
 * Lädt Bilder aus einem öffentlich geteilten Google Drive Ordner.
 * 
 * SETUP:
 *   1. Google Cloud Console → API Key erstellen (eingeschränkt auf Drive API)
 *   2. VITE_GOOGLE_DRIVE_API_KEY in Vercel/env setzen
 *   3. Google Drive Ordner: "Für jeden mit dem Link freigeben" (Betrachter)
 * 
 * Image URLs:
 *   Thumbnail: https://drive.google.com/thumbnail?id={ID}&sz=w{width}
 *   Full:      https://drive.google.com/thumbnail?id={ID}&sz=w1920
 */

import { useState, useEffect } from "react";

const API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY || "";

export interface DriveImage {
  id: string;
  name: string;
  mimeType: string;
  thumbnailUrl: string;
  fullUrl: string;
}

interface UseDriveImagesResult {
  images: DriveImage[];
  loading: boolean;
  error: string | null;
}

function getDriveImageUrl(fileId: string, width: number): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
}

export function useGoogleDriveImages(folderId: string | undefined): UseDriveImagesResult {
  const [images, setImages] = useState<DriveImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!folderId || !folderId.trim()) {
      setImages([]);
      return;
    }

    if (!API_KEY) {
      console.log("[GoogleDrive] Kein API Key konfiguriert (VITE_GOOGLE_DRIVE_API_KEY)");
      setError("API Key nicht konfiguriert");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchImages() {
      try {
        const query = encodeURIComponent(`'${folderId}' in parents and mimeType contains 'image/' and trashed = false`);
        const fields = encodeURIComponent("files(id,name,mimeType)");
        const url = `https://www.googleapis.com/drive/v3/files?q=${query}&key=${API_KEY}&fields=${fields}&pageSize=100&orderBy=name`;

        const response = await fetch(url);

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`Google Drive API Error: ${response.status} – ${errBody.substring(0, 200)}`);
        }

        const data = await response.json();
        const files = data.files || [];

        if (!cancelled) {
          const driveImages: DriveImage[] = files.map((file: any) => ({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            thumbnailUrl: getDriveImageUrl(file.id, 800),
            fullUrl: getDriveImageUrl(file.id, 1920),
          }));

          setImages(driveImages);
          setLoading(false);
          console.log(`[GoogleDrive] ${driveImages.length} Bilder aus Ordner ${folderId} geladen`);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("[GoogleDrive] Fehler:", err);
          setError(err instanceof Error ? err.message : "Unbekannter Fehler");
          setLoading(false);
        }
      }
    }

    fetchImages();
    return () => { cancelled = true; };
  }, [folderId]);

  return { images, loading, error };
}
