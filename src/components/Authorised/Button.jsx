import React from 'react';

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  icon,
  className = '',
  type = 'button'
}) => {
  const baseStyles = "w-full h-14 rounded-2xl font-semibold transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50",
    secondary: "backdrop-blur-lg bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30 text-white",
    outline: "border-2 border-white/20 hover:border-white/40 text-white hover:bg-white/5"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}; 