export default function BookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Bookings routes use no header or a different header */}
      {children}
    </>
  );
}
