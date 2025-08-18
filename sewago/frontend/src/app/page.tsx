import Link from "next/link";
export const dynamic = "force-static";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white">
      {/* Debug info */}
      <div className="fixed top-0 left-0 z-50 bg-red-500 text-white p-2 text-xs">
        Debug: Page loaded successfully
      </div>
      
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-4xl font-bold sm:text-5xl">SewaGo</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Book trusted local services in Nepal — plumbing, electrical, repairs, moving and more.
            </p>
            <div className="mt-8 flex gap-4">
              <Link className="rounded-md bg-blue-600 px-5 py-3 text-white hover:bg-blue-700" href="/services">
                Explore Services
              </Link>
              <Link className="rounded-md border px-5 py-3 hover:bg-gray-100 dark:hover:bg-gray-800" href="/auth/register">
                Become a Provider
              </Link>
            </div>
          </div>
          <div className="rounded-xl border p-6 dark:border-gray-800">
            <ul className="grid gap-3 sm:grid-cols-2">
              <li className="rounded-lg border p-4 dark:border-gray-800">Plumbing</li>
              <li className="rounded-lg border p-4 dark:border-gray-800">Electrical</li>
              <li className="rounded-lg border p-4 dark:border-gray-800">Repairs</li>
              <li className="rounded-lg border p-4 dark:border-gray-800">Moving</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
