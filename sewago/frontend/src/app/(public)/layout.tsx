export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Public routes use the global header from root layout */}
      {children}
    </>
  );
}
