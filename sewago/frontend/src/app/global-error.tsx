'use client';

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html>
      <body>
        <div className="mx-auto max-w-xl p-10 text-center">
          <h1 className="text-3xl font-bold">App crashed</h1>
          <p className="mt-2 text-muted-foreground">Please try again.</p>
          <div className="mt-6">
            <button onClick={() => reset()} className="rounded-md border px-4 py-2">
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
