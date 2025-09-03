import React from 'react';

interface TextFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  onKeyPress?: (event: React.KeyboardEvent) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  fullWidth = false,
  disabled = false,
  className = '',
  onKeyPress,
  multiline = false,
  rows = 3,
  placeholder
}) => {
  const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed";

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          rows={rows}
          placeholder={placeholder}
          className={baseClasses}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
    </div>
  );
};

export default TextField;