import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const InputField = ({
  type,
  placeholder,
  value,
  onChange,
  icon
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative group">
      <div className={`
        relative backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl
        transition-all duration-300 ease-out
        ${isFocused ? 'bg-white/15 border-blue-400/50 shadow-lg shadow-blue-500/20' : 'hover:bg-white/15 hover:border-white/30'}
      `}>
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full h-14 bg-transparent text-white placeholder-white/50
            ${icon ? 'pl-12 pr-4' : 'px-4'} ${type === 'password' ? 'pr-12' : ''}
            focus:outline-none font-medium
          `}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
}; 