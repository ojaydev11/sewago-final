export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Admin routes use no header or a different header */}
      {children}
    </>
  );
}
