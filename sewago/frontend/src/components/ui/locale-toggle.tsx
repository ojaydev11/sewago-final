'use client';

import { useState, useEffect } from 'react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { i18nConfig, getLocaleFromCookie, setLocaleCookie, type Locale } from '@/lib/i18n';
import { useToast } from './toast';

export function LocaleToggle() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('en');
  const [isOpen, setIsOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const locale = getLocaleFromCookie();
    setCurrentLocale(locale);
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    setLocaleCookie(locale);
    setCurrentLocale(locale);
    setIsOpen(false);
    
    // Show success message
    const localeName = i18nConfig.localeNames[locale];
    addToast({
      type: 'success',
      title: `Language changed to ${localeName}`,
      message: locale === 'ne' ? 'भाषा परिवर्तन गरियो' : 'Language changed successfully',
      duration: 3000
    });

    // Reload page to apply new locale
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        aria-label="Toggle language"
      >
        <GlobeAltIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{i18nConfig.localeNames[currentLocale]}</span>
        <span className="sm:hidden">{currentLocale.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {i18nConfig.locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                className={`${
                  currentLocale === locale
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                } block w-full text-left px-4 py-2 text-sm transition-colors`}
              >
                {i18nConfig.localeNames[locale]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
