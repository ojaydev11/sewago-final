'use client';
import 'client-only';

import { createI18n } from 'next-international';

export type Locale = 'en' | 'ne';

export interface I18nConfig {
  defaultLocale: Locale;
  locales: Locale[];
  localeNames: Record<Locale, string>;
}

export const i18nConfig: I18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'ne'],
  localeNames: {
    en: 'English',
    ne: 'नेपाली'
  }
};

export function getLocaleFromCookie(): Locale {
  if (typeof document === 'undefined') return 'en';
  
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('sewago_locale='));
  
  if (cookie) {
    const locale = cookie.split('=')[1] as Locale;
    if (i18nConfig.locales.includes(locale)) {
      return locale;
    }
  }
  
  return 'en';
}

export function setLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = `sewago_locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

export function getLocaleFromHeader(acceptLanguage: string): Locale {
  const languages = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].trim().toLowerCase());
  
  // Check for Nepali first
  if (languages.some(lang => lang.startsWith('ne') || lang.startsWith('np'))) {
    return 'ne';
  }
  
  // Default to English
  return 'en';
}
