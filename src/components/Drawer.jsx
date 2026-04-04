import React from 'react'
import { LuX } from 'react-icons/lu'

function Drawer({
  isOpen,
  onClose,
  title,
  children,
}) {
  return (
    <div 
      className={`fixed top-[64px] right-0 z-40 h-[calc(100dvh-64px)] w-full md:w-[38vw] transition-transform bg-white shadow-2xl shadow-cyan-800/10 border-r border-l-gray-800
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      tabIndex="-1"
      aria-labelledby='drawer-right-label'
    >
      {/* Header - fixed height */}
      <div className='flex items-center justify-between p-4 border-b border-gray-200'>
        <h5 id='drawer-right-label' className='text-base font-semibold text-black'>
          {title}
        </h5>
        <button 
          type='button'
          onClick={onClose}
          className='text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex items-center justify-center'
        >
          <LuX className="text-lg" />
        </button>
      </div>

      {/* Scrollable content area */}
      <div className='h-[calc(100%-56px)] overflow-y-auto p-4'>
        {children}
      </div>
    </div>
  )
}

export default Drawer