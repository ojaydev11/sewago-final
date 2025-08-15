export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Settings routes use no header or a different header */}
      {children}
    </>
  );
}
