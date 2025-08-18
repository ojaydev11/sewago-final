"use client";
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html>
      <body>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
          <p className="text-slate-600">Please try again later.</p>
          {process.env.NODE_ENV !== 'production' && (
            <pre className="mt-6 text-left bg-slate-50 border p-4 rounded text-sm overflow-auto">
              {error?.message}
            </pre>
          )}
        </div>
      </body>
    </html>
  );
}

