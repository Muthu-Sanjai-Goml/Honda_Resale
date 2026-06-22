import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ArrowLeft, ArrowRight, Camera, Check, RotateCw, Sun } from "lucide-react";

export type PhotoSlotId =
  | "front"
  | "rear"
  | "left"
  | "right"
  | "dashboard"
  | "seat";

export type Photos = Partial<Record<PhotoSlotId, { url: string; name: string; file?: File }>>;

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
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  const loadDemoPhotos = async () => {
    setIsLoadingDemo(true);
    try {
      const demoMapping: { slot: PhotoSlotId; fileName: string }[] = [
        { slot: "front", fileName: "front.avif" },
        { slot: "rear", fileName: "back.avif" },
        { slot: "left", fileName: "left.avif" },
        { slot: "right", fileName: "right.avif" },
        { slot: "dashboard", fileName: "dash.avif" },
        { slot: "seat", fileName: "seat.avif" },
      ];

      const newPhotos = { ...photos };

      for (const item of demoMapping) {
        const response = await fetch(`/honda_photos/${item.fileName}`);
        if (!response.ok) throw new Error(`Failed to load ${item.fileName}`);
        const blob = await response.blob();
        const file = new File([blob], item.fileName, { type: "image/avif" });
        const url = URL.createObjectURL(file);
        newPhotos[item.slot] = { url, name: item.fileName, file };
      }

      onChange(newPhotos);
    } catch (error) {
      console.error("Failed to load demo photos:", error);
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleSelect = (id: PhotoSlotId) => (file: File) => {
    const url = URL.createObjectURL(file);
    onChange({ ...photos, [id]: { url, name: file.name, file } });
  };

  return (
    <div className="space-y-8">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[color:var(--neutral-muted)] hover:text-[color:var(--slate-ink)] transition-colors"
        >
          <ArrowLeft size={15} /> Back to Details
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between flex-wrap gap-4">
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
            disabled={isLoadingDemo}
            onClick={loadDemoPhotos}
            className="flex h-11 items-center justify-center gap-2 rounded-[8px] border border-[color:var(--honda-red)] bg-white px-5 text-[14px] font-medium text-[color:var(--honda-red)] shadow-sm transition hover:bg-[color:var(--honda-red)]/5 disabled:opacity-50"
          >
            <Camera size={16} />
            {isLoadingDemo ? "Loading..." : "Load Demo Photos"}
          </button>
        </div>
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
