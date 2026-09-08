"use client";

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100/80 flex flex-col">
      {/* Thumbnail skeleton */}
      <div className="w-full pt-[56.25%] bg-slate-100 relative">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s ease-in-out infinite",
          }}
        />
      </div>

      {/* Content skeleton — matches TalentCard structure */}
      <div className="p-5 flex-grow flex flex-col">
        {/* Name */}
        <div className="h-5 w-2/3 bg-slate-100 rounded-lg" />
        {/* Role badge */}
        <div className="h-6 w-24 bg-slate-100 rounded-full mt-2.5" />
        {/* Link lines */}
        <div className="mt-4 flex flex-col gap-2.5">
          <div className="h-4 w-36 bg-slate-100 rounded-lg" />
          <div className="h-4 w-32 bg-slate-100 rounded-lg" />
        </div>
        {/* CTA button */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="h-12 w-full bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
