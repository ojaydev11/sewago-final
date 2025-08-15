export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Wallet routes use no header or a different header */}
      {children}
    </>
  );
}
