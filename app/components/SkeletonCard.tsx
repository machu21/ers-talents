"use client";

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100/80">
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
      <div className="p-5 space-y-3">
        <div className="h-5 w-2/3 bg-slate-100 rounded-lg" />
        <div className="h-4 w-1/3 bg-slate-100 rounded-lg" />
        <div className="h-11 w-full bg-slate-100 rounded-xl mt-2" />
      </div>
    </div>
  );
}
