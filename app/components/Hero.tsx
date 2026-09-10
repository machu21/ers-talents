"use client";

const TABS = ["All", "General VA", "Tech VA"];

export default function Hero({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <header className="max-w-[1440px] mx-auto px-6 flex flex-col items-center text-center pt-16 pb-12">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 text-sm font-semibold text-slate-500 mb-7 shadow-sm">
        <span className="text-[#F5B800] text-lg leading-none">&bull;</span>
        Virtual assistants &amp; remote professionals
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
        Meet Our{" "}
        <span className="text-[#5E26DF] relative inline-block">
          Talent
          <svg
            className="absolute w-full h-3 -bottom-1.5 left-0 text-[#F5B800]"
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
          >
            <path
              d="M0 5 Q 50 10 100 5"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
            />
          </svg>
        </span>
      </h1>

      <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
        Watch video introductions from our vetted virtual professionals and find
        the right fit for your team.
      </p>

      {/* Filter controls */}
      <div className="flex flex-col md:flex-row items-center gap-4 mt-10">
        <div
          className="flex gap-2 p-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm"
          role="tablist"
          aria-label="Filter by role type"
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => onTabChange(tab)}
              className={`px-6 py-2 rounded-full font-medium text-sm transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5E26DF] ${
                activeTab === tab
                  ? "bg-[#5E26DF] text-white shadow-md"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
