export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Dashboard routes use no header or a different header */}
      {children}
    </>
  );
}
