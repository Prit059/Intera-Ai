import React from 'react'
import {FaRegEye, FaRegEyeSlash} from "react-icons/fa6";
import { useState } from 'react';

function SignUpInput({
  value,
  onChange,
  label,
  placeholder,
  type,
}) {

  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  }
    return (
    <div className='input-container'>
      <label className='text-[17px] text-white'>{label}</label>

      <div className='bg-gray-600/20 border border-gray-600 rounded-xl p-2 mt-2 text-white flex items-center'>
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          className='w-full font-medium text-[16px] outline-none'
          value={value}
          onChange={(e) => onChange(e)}
        />
        {type === "password" && (
          showPassword ? (
            <FaRegEye
              size={22}
              className='cursor-pointer ml-2'
              onClick={toggleShowPassword}
            />
          ) : (
            <FaRegEyeSlash
              size={22}
              className='cursor-pointer ml-2'
              onClick={toggleShowPassword}
            />
          )
        )}
      </div>
    </div>
  )
}

export default SignUpInput