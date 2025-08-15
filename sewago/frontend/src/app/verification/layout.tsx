export default function VerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Verification routes use no header or a different header */}
      {children}
    </>
  );
}
