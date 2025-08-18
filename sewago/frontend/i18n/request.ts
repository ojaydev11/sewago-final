import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    throw new Error('Locale not provided');
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
