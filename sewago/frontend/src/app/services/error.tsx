"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="p-6 text-center">
      <p className="mb-4">Failed to load services. Please try again.</p>
      <button onClick={reset} className="px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
    </div>
  );
}

