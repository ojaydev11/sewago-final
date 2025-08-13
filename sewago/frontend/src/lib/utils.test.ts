import { describe, it, expect } from 'vitest';
import { cn, formatPrice, formatDate, generateSlug } from './utils';

describe('Utility Functions', () => {
  describe('cn', () => {
    it('should combine class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
      expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
      expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2');
    });

    it('should handle empty inputs', () => {
      expect(cn()).toBe('');
      expect(cn('')).toBe('');
      expect(cn('', '', '')).toBe('');
    });
  });

  describe('formatPrice', () => {
    it('should format price correctly', () => {
      expect(formatPrice(1000)).toBe('₹1,000');
      expect(formatPrice(1500)).toBe('₹1,500');
      expect(formatPrice(0)).toBe('₹0');
      expect(formatPrice(999999)).toBe('₹9,99,999');
    });

    it('should handle decimal prices', () => {
      expect(formatPrice(1000.50)).toBe('₹1,000.50');
      expect(formatPrice(1500.99)).toBe('₹1,500.99');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const testDate = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(testDate)).toBe('15 Jan 2024');
    });

    it('should handle different date formats', () => {
      const date1 = new Date('2024-12-25T00:00:00Z');
      const date2 = new Date('2024-06-01T12:00:00Z');
      
      expect(formatDate(date1)).toBe('25 Dec 2024');
      expect(formatDate(date2)).toBe('1 Jun 2024');
    });
  });

  describe('generateSlug', () => {
    it('should generate valid slugs', () => {
      expect(generateSlug('House Cleaning Service')).toBe('house-cleaning-service');
      expect(generateSlug('Electrical Work & Repairs')).toBe('electrical-work-repairs');
      expect(generateSlug('Gardening & Landscaping')).toBe('gardening-landscaping');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Service with @#$%^&*()')).toBe('service-with');
      expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces');
      expect(generateSlug('UPPERCASE TEXT')).toBe('uppercase-text');
    });

    it('should handle edge cases', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug('   ')).toBe('');
      expect(generateSlug('123 Numbers')).toBe('123-numbers');
    });
  });
});


