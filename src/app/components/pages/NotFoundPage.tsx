import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-[4rem] tracking-tighter text-white/10">404</h1>
      <p className="mb-6 text-[0.95rem] text-white/40">Seite nicht gefunden</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-[0.85rem] text-white/70 transition-all hover:bg-white/15"
      >
        <ArrowLeft className="h-4 w-4" /> Zur Startseite
      </Link>
    </div>
  );
}
