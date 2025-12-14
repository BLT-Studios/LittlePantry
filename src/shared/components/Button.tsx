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
    'inline-flex items-center justify-center px-4 py-2 rounded-full font-medium transition';

  const variants: Record<
    NonNullable<ButtonProps['variant']>,
    string
  > = {
    primary:
      'bg-[--btn-primary-bg] text-[--btn-primary-text] hover:bg-[--btn-primary-hover-bg]',
    secondary:
      'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200',
    destructive:
      'bg-[--color-destructive] text-white hover:bg-[--color-destructive-600]',
    tertiary: 'text-slate-200 hover:bg-fuchsia-500',
    iconOnly:
      'p-2 bg-[--color-primary] text-white rounded-full inline-flex items-center justify-center',
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
