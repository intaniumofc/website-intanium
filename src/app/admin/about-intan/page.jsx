'use client';

import React, { Suspense } from 'react';
import PageComponent from '../../../admin/modules/about-intan/index.jsx';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageComponent />
    </Suspense>
  );
}
