"use client"

import { Suspense } from 'react';
import GetStartedPageClient from './GetStartedPageClient';

export default function GetStartedPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GetStartedPageClient />
        </Suspense>
    )
}
