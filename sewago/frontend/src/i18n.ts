import { getRequestConfig, type RequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Can be imported from a shared config
export const locales = ['en', 'ne'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }): Promise<RequestConfig> => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) notFound();

  return {
    locale: (locale as string) ?? defaultLocale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
