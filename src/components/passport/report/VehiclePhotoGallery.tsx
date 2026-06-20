import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { VehiclePhoto } from "@/lib/submissions";

export function VehiclePhotoGallery({ photos }: { photos: VehiclePhoto[] }) {
  const [active, setActive] = useState<number | null>(null);

  if (!photos.length) return null;

  const open = (i: number) => setActive(i);
  const close = () => setActive(null);
  const prev = () => setActive((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
  const next = () => setActive((i) => (i === null ? null : (i + 1) % photos.length));

  return (
    <div className="hvp-card">
      <div className="flex items-end justify-between">
        <div>
          <div className="font-display text-[20px] font-semibold text-[color:var(--slate-ink)]">
            Vehicle Photos
          </div>
          <div className="mt-1 text-[13px] text-[color:var(--neutral-muted)]">
            {photos.length} images submitted by the owner — exterior, interior, engine and tyres
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p, i) => (
          <button
            key={p.label + i}
            onClick={() => open(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-[10px] border border-[color:var(--neutral-line)] bg-[color:var(--surface)] text-left"
          >
            <img
              src={p.url}
              alt={p.label}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2">
              <span className="text-[11px] font-medium text-white drop-shadow">{p.label}</span>
            </div>
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 bottom-4 sm:bottom-auto sm:top-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
          <div className="max-h-[88vh] max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[active].url}
              alt={photos[active].label}
              className="max-h-[80vh] w-auto rounded-[10px] object-contain"
            />
            <div className="mt-3 text-center text-[13px] font-medium text-white/90">
              {photos[active].label}
              <span className="ml-2 text-white/50">
                {active + 1} / {photos.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
