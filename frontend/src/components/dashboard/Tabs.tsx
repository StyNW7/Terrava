interface TabItem {
  value: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (value: string) => void;
}

export default function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="mb-5 flex gap-1 overflow-x-auto border-b border-terrava-border" role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive ? "text-terrava-primary" : "text-terrava-muted hover:text-terrava-text"
            }`}
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${isActive ? "bg-terrava-light text-terrava-primary" : "bg-terrava-bg text-terrava-muted"}`}>
                {tab.count}
              </span>
            )}
            {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-terrava-primary" />}
          </button>
        );
      })}
    </div>
  );
}
