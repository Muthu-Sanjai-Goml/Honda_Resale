import { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { ArrowLeft, ArrowRight, Camera, Check, RotateCw, Sun } from "lucide-react";

export type PhotoSlotId =
  | "front"
  | "rear"
  | "left"
  | "right"
  | "dashboard"
  | "seat";

export type Photos = Partial<Record<PhotoSlotId, { url: string; name: string }>>;

const SLOTS: { id: PhotoSlotId; label: string }[] = [
  { id: "front", label: "Front View" },
  { id: "rear", label: "Rear View" },
  { id: "left", label: "Left Side" },
  { id: "right", label: "Right Side" },
  { id: "dashboard", label: "Dashboard" },
  { id: "seat", label: "Driver Seat / Seat Area" },
];

type Props = {
  photos: Photos;
  onChange: (p: Photos) => void;
  onBack: () => void;
  onNext: () => void;
};

function Tile({
  slot,
  photo,
  onSelect,
}: {
  slot: { id: PhotoSlotId; label: string };
  photo?: Photos[PhotoSlotId];
  onSelect: (file: File) => void;
}) {
  const onDrop = useCallback(
    (files: File[]) => {
      if (files[0]) onSelect(files[0]);
    },
    [onSelect],
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".heic"] },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        {...getRootProps()}
        className={`group relative flex h-[110px] w-full max-w-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-[8px] border border-dashed transition ${
          isDragActive
            ? "border-[color:var(--honda-red)] bg-[color:var(--honda-red)]/5"
            : "border-[color:var(--neutral-line)] bg-[color:var(--surface)] hover:bg-[color:var(--neutral-soft)]"
        }`}
      >
        <input {...getInputProps()} />
        {photo ? (
          <>
            <img
              src={photo.url}
              alt={slot.label}
              className="h-full w-full object-cover"
            />
            <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--score-green)] text-white">
              <Check size={12} strokeWidth={3} />
            </div>
          </>
        ) : (
          <Camera size={24} className="text-[color:var(--neutral-faint)]" />
        )}
      </div>
      <span className="text-[12px] font-medium text-[color:var(--slate-ink)]">
        {slot.label}
      </span>
    </div>
  );
}

export function Step2Photos({ photos, onChange, onBack, onNext }: Props) {
  const count = useMemo(() => Object.keys(photos).length, [photos]);
  const canContinue = count >= 4;

  const handleSelect = (id: PhotoSlotId) => (file: File) => {
    const url = URL.createObjectURL(file);
    onChange({ ...photos, [id]: { url, name: file.name } });
  };

  const loadDemoPhotos = () => {
    onChange({
      front: { url: "/honda_photos/front.avif", name: "front.avif" },
      rear: { url: "/honda_photos/back.avif", name: "back.avif" },
      left: { url: "/honda_photos/left.avif", name: "left.avif" },
      right: { url: "/honda_photos/right.avif", name: "right.avif" },
      dashboard: { url: "/honda_photos/dash.avif", name: "dash.avif" },
      seat: { url: "/honda_photos/seat.avif", name: "seat.avif" },
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-[32px] sm:text-[34px] font-semibold leading-[1.1] text-[color:var(--slate-ink)]">
            Upload Vehicle Photos
          </h1>
          <p className="mt-2 text-[15px] text-[color:var(--neutral-muted)]">
            Clear photos help our AI assess your Honda&apos;s condition accurately.
          </p>
        </div>
        <button
          type="button"
          onClick={loadDemoPhotos}
          className="shrink-0 inline-flex h-[40px] items-center justify-center rounded-[8px] bg-[color:var(--slate-ink)] px-4 text-[13px] font-semibold text-white hover:opacity-90 transition shadow-sm"
        >
          Load Demo Photos
        </button>
      </div>

      <div className="rounded-[8px] border border-[#F5D174] bg-[#FEF9EC] px-4 py-3 text-[13px] text-[color:var(--slate-ink)]">
        Upload 4–6 clear photos. Our AI vision engine reads condition, wear, and damage from your images.
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
        {SLOTS.map((s) => (
          <Tile
            key={s.id}
            slot={s}
            photo={photos[s.id]}
            onSelect={handleSelect(s.id)}
          />
        ))}
      </div>

      <p className="text-[12px] text-[color:var(--neutral-muted)]">
        Minimum 4 photos required. Accepted: JPG, PNG, HEIC — max 10MB each. ({count}/6 uploaded)
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: Camera, text: "Good lighting, no filters" },
          { icon: Sun, text: "Outdoors or well-lit area preferred" },
          { icon: RotateCw, text: "Hold phone in landscape for exteriors" },
        ].map((tip, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-[8px] border border-[color:var(--neutral-line)] bg-[color:var(--surface)] px-4 py-3"
          >
            <tip.icon
              size={18}
              className="text-[color:var(--slate-ink)]"
              strokeWidth={2}
            />
            <span className="text-[13px] text-[color:var(--slate-ink)]">
              {tip.text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex h-[52px] items-center justify-center gap-2 rounded-[8px] border border-[color:var(--honda-red)] bg-white px-6 text-[15px] font-medium text-[color:var(--honda-red)] transition hover:bg-[color:var(--honda-red)]/5"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={onNext}
          className={`flex h-[52px] items-center justify-center gap-2 rounded-[8px] px-6 text-[15px] font-medium transition ${
            canContinue
              ? "bg-[color:var(--honda-red)] text-white hover:bg-[color:var(--honda-red-hover)]"
              : "bg-[color:var(--neutral-soft)] text-[color:var(--neutral-faint)]"
          }`}
        >
          Analyse My Vehicle <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
