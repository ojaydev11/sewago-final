export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Chat routes use no header or a different header */}
      {children}
    </>
  );
}
