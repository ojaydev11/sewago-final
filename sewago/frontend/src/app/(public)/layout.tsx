import Header from '@/components/site/Header';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Public routes use the global header */}
      <Header />
      {children}
    </>
  );
}
