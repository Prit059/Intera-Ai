import React from 'react'
import { LuTrash2 } from 'react-icons/lu';
import { getInitials } from '../../utils/helper';
import { useDarkMode } from '../../context/DarkModeContext';

function SummaryCard({
  colors,
  role,
  topicsFocus,
  experience,
  description,        
  questions,       
  lastUpdatedAt,
  onSelect,
  onDelete,
}) {
  const { darkmode } = useDarkMode();
  return (
    <div
      className={`w-100 md:w-120 relative group rounded-2xl border border-gray-200 p-3 cursor-pointer ${darkmode ? 'bg-white text-black' : 'bg-black text-white'}`}
      style={{ boxShadow: `1px 4px 8px 1px ${colors.bgcolor}` }}
      onClick={onSelect}>
      {/* Header section */}
      <div className='w-full p-2 rounded-2xl' style={{ background: colors.bgcolor }}>
        <div className='flex m-5 gap-2'>
          <div>
            <span className={`text-2xl font-bold rounded-2xl p-3.5 flex border ${darkmode ? 'bg-white text-black border-gray-400' : 'bg-black text-white border-gray-600'}`}>
              {getInitials(role)}
            </span>
          </div>

          <div className={`text-${darkmode ? 'white' : 'black'}`}>
            <h2 className='font-bold text-2xl'>{role}</h2>
            <p className='text-sm'>{topicsFocus}</p>
          </div>
        </div>

        {/* Delete button - only shows on hover */}
        <button
          className='hidden group-hover:flex items-center gap-2 text-rose-500 font-medium bg-rose-50 px-3 py-1 rounded text-nowrap border border-rose-100 hover:border-rose-200 absolute top-2 right-2 z-10'
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <LuTrash2 />
        </button>
      </div>

      {/* Info section */}
      <div className={`p-3 ${darkmode ? 'text-black' : 'text-white'}`}>
        {/* Mobile view - single column */}
        <div className='flex flex-col gap-2 sm:hidden'>
          <div className='border border-gray-600 p-2 rounded-3xl text-sm'>
            Experience: {experience} {experience === 1 ? "Year" : "Years"}
          </div>
          
          <div className='border border-gray-600 p-2 rounded-3xl text-sm'>
            {questions.length} Q&A
          </div>
          <div className='border border-gray-600 p-2 rounded-3xl text-sm'>
            Last Updated: {lastUpdatedAt}
          </div>
        </div>

        {/* Desktop/tablet view - horizontal layout */}
        <div className='hidden sm:flex gap-2'>
          <div className='border border-gray-600 p-2 rounded-3xl text-sm'>
            Experience: {experience} {experience === 1 ? "Year" : "Years"}
          </div>
          
          <div className='border border-gray-600 p-2 rounded-3xl text-sm'>
            {questions.length} Q&A
          </div>
          <div className='border border-gray-600 p-2 rounded-3xl text-sm'>
            Last Updated: {lastUpdatedAt}
          </div>
        </div>

        <div className='text-sm text-gray-300 ml-1'>
          <p className='mt-2'>{description}</p>
        </div>

      </div>
    </div>
  );
}

export default SummaryCard;