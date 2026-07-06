'use client';

import React, { Suspense } from 'react';
import PageComponent from '../../../admin/about-intan/index.jsx';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageComponent />
    </Suspense>
  );
}
