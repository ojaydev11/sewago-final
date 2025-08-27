import React from 'react';

interface SliderProps {
  value?: number | number[];
  onValueChange?: (value: number | number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export function Slider({
  value = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className = ''
}: SliderProps) {
  // Handle both single number and array values
  const currentValue = Array.isArray(value) ? value[0] : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (onValueChange) {
      if (Array.isArray(value)) {
        onValueChange([newValue]);
      } else {
        onValueChange(newValue);
      }
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}</span>
        <span>{currentValue}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
