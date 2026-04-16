'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLabStore } from '@/lib/store';
import { PARTS_DATA, type Category, type Part } from '@/lib/parts-data';
import LandingScreen from '@/components/screens/LandingScreen';
import CategoryScreen from '@/components/screens/CategoryScreen';
import SubcategoryScreen from '@/components/screens/SubcategoryScreen';
import AssemblyScreen from '@/components/screens/AssemblyScreen';
import CartWidget from '@/components/ui/CartWidget';
import CartPanel from '@/components/ui/CartPanel';
import Toast from '@/components/ui/Toast';

export default function Page() {
  const screen = useLabStore((s) => s.screen);
  const hydrated = useLabStore((s) => s.hydrated);
  const [partsMap, setPartsMap] = useState<Record<Category, Part[]>>(PARTS_DATA);

  // Fetch dynamic parts from API (DB). Falls back to hardcoded PARTS_DATA on error.
  useEffect(() => {
    fetch('/api/parts')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.parts) setPartsMap(data.parts);
      })
      .catch(() => {
        /* keep fallback PARTS_DATA */
      });
  }, []);

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#1a0018]">
      {hydrated && (
        <AnimatePresence mode="wait">
          {screen === 's1' && <LandingScreen />}
          {screen === 's2' && <CategoryScreen />}
          {screen === 's3' && <SubcategoryScreen partsMap={partsMap} />}
          {screen === 's4' && <AssemblyScreen />}
        </AnimatePresence>
      )}

      <CartWidget />
      <CartPanel />
      <Toast />
    </main>
  );
}
