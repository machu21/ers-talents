"use client";

const TABS = ["All", "General VA", "Tech VA"];

export default function Hero({
  activeTab,
  onTabChange,
  minRate,
  maxRate,
  onMinRateChange,
  onMaxRateChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  minRate: number;
  maxRate: number;
  onMinRateChange: (rate: number) => void;
  onMaxRateChange: (rate: number) => void;
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

        <div className="flex flex-col gap-2 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm min-w-[200px]">
          <div className="flex justify-between text-xs font-semibold text-slate-500 px-1">
            <span>Rate</span>
            <span className="text-[#5E26DF]">${minRate} - ${maxRate}/hr</span>
          </div>
          <div className="relative w-full h-5 flex items-center">
            {/* Track */}
            <div className="absolute w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-[#5E26DF] rounded-full" 
                style={{ left: `${(minRate / 50) * 100}%`, right: `${100 - (maxRate / 50) * 100}%` }} 
              />
            </div>
            
            {/* Min Input */}
            <input 
              type="range"
              min={0}
              max={50}
              value={minRate}
              onChange={(e) => onMinRateChange(Math.min(Number(e.target.value), maxRate - 1))}
              className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#5E26DF] [&::-webkit-slider-thumb]:shadow-md cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#5E26DF]"
              style={{ zIndex: minRate > maxRate - 10 ? 5 : 3 }}
            />
            {/* Max Input */}
            <input 
              type="range"
              min={0}
              max={50}
              value={maxRate}
              onChange={(e) => onMaxRateChange(Math.max(Number(e.target.value), minRate + 1))}
              className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#5E26DF] [&::-webkit-slider-thumb]:shadow-md cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#5E26DF]"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
