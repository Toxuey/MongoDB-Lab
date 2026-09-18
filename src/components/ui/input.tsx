import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-neutral-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-1.5 text-xs bg-neutral-950 border rounded text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#00ED64] transition-colors ${
          error ? 'border-red-500' : 'border-neutral-800'
        } ${className}`}
        {...props}
      />
      {error && <span className="block text-[11px] text-red-400 mt-1">{error}</span>}
    </div>
  );
};
