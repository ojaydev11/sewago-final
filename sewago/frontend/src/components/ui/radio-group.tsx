import React from 'react';

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface RadioGroupItemProps {
  value: string;
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function RadioGroup({
  children,
  className = ''
}: RadioGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
}

export function RadioGroupItem({
  value,
  id,
  children,
  disabled = false,
  className = ''
}: RadioGroupItemProps) {
  return (
    <label className={`flex items-center space-x-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="radio"
        value={value}
        id={id}
        disabled={disabled}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
      />
      <span className="text-sm text-gray-700">{children}</span>
    </label>
  );
}
