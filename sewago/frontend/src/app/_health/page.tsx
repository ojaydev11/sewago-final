import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Health',
};

export default async function HealthPage() {
  const api = process.env.NEXT_PUBLIC_API_URL ?? '';
  const ok = await (async () => {
    try {
      const res = await fetch(`${api}/health`, { next: { revalidate: 30 } });
      return res.ok;
    } catch {
      return false;
    }
  })();
  return (
    <div className="p-6">
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded ${ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        <span className={`w-3 h-3 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span>{ok ? 'OK' : 'DOWN'}</span>
      </div>
    </div>
  );
}

