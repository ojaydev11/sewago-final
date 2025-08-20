import { NextIntlClientProvider } from 'next-intl';

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '../../../../i18n-config';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // Await params before using its properties
  const resolvedParams = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(resolvedParams.locale as any)) {
    notFound();
  }

  // Provide all messages to the client
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
