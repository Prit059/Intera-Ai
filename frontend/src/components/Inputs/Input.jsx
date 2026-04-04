import React from 'react'
import {FaRegEye, FaRegEyeSlash} from "react-icons/fa6";
import { useState } from 'react';

function Input({
  value,
  onChange,
  label,
  placeholder,
  type,
  name,  // Add this!
  required, // Add this!
  inputClassName, // Add this!
  labelClassName // Add this!
}) {

  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  }
  
  return (
    <div className='input-container'>
      <label className={`text-[15px] text-black ${labelClassName || ''}`}>{label}</label>

      <div className=' flex items-center'>
        <input
          name={name}  // Add this!
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          className={`w-full text-black font-medium text-[16px] outline-none ${inputClassName || ''}`}
          value={value}
          onChange={onChange}  // This is correct, onChange should receive the event
          required={required}  // Add this!
        />
        {type === "password" && (
          showPassword ? (
            <FaRegEye
              size={22}
              className='text-black cursor-pointer ml-2'
              onClick={toggleShowPassword}
            />
          ) : (
            <FaRegEyeSlash
              size={22}
              className='text-black cursor-pointer ml-2'
              onClick={toggleShowPassword}
            />
          )
        )}
      </div>
    </div>
  )
}

export default Input