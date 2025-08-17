import GlobalHeader from '@/components/site/Header';

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

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
