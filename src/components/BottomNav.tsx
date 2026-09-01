import { IconHeute, IconKunden, IconKandidaten, IconMatching, IconVorlagen } from './Icons';
import type { TabId } from '../types/ui';

interface Tab {
  id: TabId;
  label: string;
  icon: (props: { className?: string }) => React.JSX.Element;
}

const TABS: Tab[] = [
  { id: 'heute', label: 'Heute', icon: IconHeute },
  { id: 'kunden', label: 'Kunden', icon: IconKunden },
  { id: 'kandidaten', label: 'Kandidaten', icon: IconKandidaten },
  { id: 'matching', label: 'Matching', icon: IconMatching },
  { id: 'vorlagen', label: 'Vorlagen', icon: IconVorlagen },
];

export function BottomNav({ active, onChange }: { active: TabId; onChange: (tab: TabId) => void }) {
  return (
    <nav className="sticky bottom-0 left-0 right-0 z-30 border-t border-[var(--color-line)] bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-between px-1">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium"
            >
              <Icon className={isActive ? 'text-[var(--color-orange)]' : 'text-[var(--color-ink)]/45'} />
              <span className={isActive ? 'text-[var(--color-orange)]' : 'text-[var(--color-ink)]/55'}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
