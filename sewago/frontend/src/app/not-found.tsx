import 'server-only';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl p-10 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <div className="mt-6">
        <a href="/" className="underline">Go home</a>
      </div>
    </div>
  );
}
