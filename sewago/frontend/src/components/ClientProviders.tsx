'use client';
import 'client-only';

import React from 'react';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
