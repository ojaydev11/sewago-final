'use client';

import Link from 'next/link';

type Props = { error: Error & { digest?: string }; reset: () => void };

export default function ErrorPage({ reset }: Props) {
  // No DOM work in render; any DOM should be in useEffect if needed.
  return (
    <div className="mx-auto max-w-xl p-10 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">An unexpected error occurred.</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button onClick={() => reset()} className="rounded-md border px-4 py-2">
          Try again
        </button>
        <Link href="/" className="underline">Go home</Link>
      </div>
    </div>
  );
}