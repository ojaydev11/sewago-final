export const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';
// With next-intl middleware using localePrefix: 'as-needed', default locale is not prefixed
export const useLocalePrefix = false;
export const homeHref = useLocalePrefix ? `/${defaultLocale}/services` : '/services';


