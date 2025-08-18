import { useLocale, useTranslations } from 'next-intl';
import { formatNPR } from '@/lib/currency';

export function useLocalizedCurrency() {
  const locale = useLocale();
  const t = useTranslations('currency');

  const formatCurrency = (amount: number): string => {
    // Use the enhanced formatNPR function with locale support
    return formatNPR(amount, locale);
  };

  const formatCurrencyWithTemplate = (amount: number): string => {
    // Use translation template for currency formatting
    const formattedAmount = amount.toLocaleString(locale === 'ne' ? 'ne-NP' : 'en-NP');
    return t('format', { amount: formattedAmount });
  };

  const getCurrencySymbol = (): string => {
    return t('npr');
  };

  const formatRange = (min: number, max: number): string => {
    const minFormatted = formatCurrency(min);
    const maxFormatted = formatCurrency(max);
    return `${minFormatted} - ${maxFormatted}`;
  };

  const formatWithPrefix = (amount: number, prefix: string): string => {
    return `${prefix} ${formatCurrency(amount)}`;
  };

  return {
    formatCurrency,
    formatCurrencyWithTemplate,
    getCurrencySymbol,
    formatRange,
    formatWithPrefix,
    locale,
  };
}
