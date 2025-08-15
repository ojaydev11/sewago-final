import GlobalHeader from '@/components/site/Header';
import Footer from '@/components/site/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GlobalHeader />
      {children}
      <Footer />
    </>
  );
}
