export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Auth routes use no header or a different header */}
      {children}
    </>
  );
}
