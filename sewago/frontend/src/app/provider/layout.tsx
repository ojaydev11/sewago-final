export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Provider routes use no header or a different header */}
      {children}
    </>
  );
}
