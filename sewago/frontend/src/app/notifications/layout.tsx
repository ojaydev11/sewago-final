export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Notifications routes use no header or a different header */}
      {children}
    </>
  );
}
