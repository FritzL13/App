import { useState } from 'react';
import { StoreProvider, useStore } from './lib/store';
import { BottomNav } from './components/BottomNav';
import type { TabId } from './types/ui';
import { HeutePage } from './pages/HeutePage';
import { KundenPage } from './pages/KundenPage';
import { KandidatenPage } from './pages/KandidatenPage';
import { MatchingPage } from './pages/MatchingPage';
import { VorlagenPage } from './pages/VorlagenPage';

function AppShell() {
  const [tab, setTab] = useState<TabId>('heute');
  const { geladen } = useStore();

  if (!geladen) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-[var(--color-ink)]/50">
        Lade Daten…
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 pb-4">
        {tab === 'heute' && <HeutePage onNavigate={setTab} />}
        {tab === 'kunden' && <KundenPage />}
        {tab === 'kandidaten' && <KandidatenPage />}
        {tab === 'matching' && <MatchingPage />}
        {tab === 'vorlagen' && <VorlagenPage />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </>
  );
}

function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}

export default App;
