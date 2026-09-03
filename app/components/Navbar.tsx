"use client";

import Image from "next/image";

export default function Navbar({
  talentCount,
  loading,
}: {
  talentCount: number;
  loading: boolean;
}) {
  return (
    <nav className="flex justify-between items-center px-6 md:px-10 py-4 bg-white/80 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.04)] sticky top-0 z-40 border-b border-slate-100/60">
      <div className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Elevate Remote Solutions"
          width={38}
          height={38}
          className="rounded-full object-contain"
          priority
        />
        <span className="text-xl font-bold tracking-tight">
          Elevate Remote Solutions
        </span>
      </div>

      {!loading && talentCount > 0 && (
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200/80 text-sm font-medium text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {talentCount} Talent Available
        </div>
      )}
    </nav>
  );
}
