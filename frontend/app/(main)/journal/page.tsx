'use client'

import { Suspense } from 'react';
import JournalPageClient from './JournalPageClient';

export default function JournalPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JournalPageClient />
    </Suspense>
  )
}
