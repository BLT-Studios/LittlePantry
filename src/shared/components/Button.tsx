import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'iconOnly';
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  startIcon,
  endIcon,
  disabled,
  type = 'button',
  onClick,
  children,
}: ButtonProps) {
  const base =
        'inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-full transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variants: Record<
    NonNullable<ButtonProps['variant']>,
    string
  > = {
    primary:
      'w-full h-12 rounded-3xl bg-teal-800 text-white font-medium hover:bg-black transition',

    secondary:
      'bg-slate-700 text-white hover:bg-slate-800 focus-visible:ring-slate-600',

    tertiary:
      'bg-white text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400',

    destructive:
      'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',

    iconOnly:
      'p-3 bg-indigo-500 text-white hover:bg-indigo-600 rounded-full focus-visible:ring-indigo-500',
  };

  return (
    <button
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={`
        ${base}
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {startIcon && <span className="mr-2 flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-2 flex items-center">{endIcon}</span>}
    </button>
  );
}
