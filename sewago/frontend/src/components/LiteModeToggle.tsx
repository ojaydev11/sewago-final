'use client';

import { useLiteMode } from '@/providers/lite-mode';
import { useTranslations } from 'next-intl';

export default function LiteModeToggle() {
  const { isLiteMode, toggleLiteMode, connectionSpeed } = useLiteMode();
  const t = useTranslations('common');

  const getConnectionIcon = () => {
    switch (connectionSpeed) {
      case 'fast':
        return '🚀';
      case 'slow':
        return '🐌';
      default:
        return '📶';
    }
  };

  const getConnectionText = () => {
    switch (connectionSpeed) {
      case 'fast':
        return 'Fast connection';
      case 'slow':
        return 'Slow connection';
      default:
        return 'Connection unknown';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getConnectionIcon()}</span>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Lite Mode
            </h3>
            <p className="text-xs text-gray-500">
              {getConnectionText()} • Optimizes for performance
            </p>
          </div>
        </div>
      </div>
      
      <button
        onClick={toggleLiteMode}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isLiteMode ? 'bg-blue-600' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={isLiteMode}
        aria-label="Toggle lite mode"
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isLiteMode ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// Component to show lite mode status in the UI
export function LiteModeIndicator() {
  const { isLiteMode, connectionSpeed } = useLiteMode();
  
  if (!isLiteMode) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-orange-800 bg-orange-100 border border-orange-200 rounded-full">
      <span>⚡</span>
      <span>Lite Mode</span>
      {connectionSpeed === 'slow' && (
        <span className="text-orange-600">(Slow network detected)</span>
      )}
    </div>
  );
}
