export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Account routes use no header or a different header */}
      {children}
    </>
  );
}
