import React from 'react'
import { useDarkMode } from '../../../context/DarkModeContext'

function RoleInfoHeader({
  role,
  experience,
  topicsFocus,
  questions,
  description,
  lastUpdatedAt,
}) {

  const { darkmode } = useDarkMode;
  return (
    <div id='main' className={`${darkmode ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <div className='flex justify-between'>
        <div>
          <div className='w-full h-25 p-3.5'>
            <h2 className='text-3xl font-bold'>{role}</h2>
            <p className='text-lg'>{topicsFocus}</p>
          </div>

          <div className='flex gap-3 p-2'>
            <p className='text-sm p-2 bg-violet-600 text-white font-medium rounded-4xl'>Experience: {experience} {experience == 1 ? "year" : "years"}</p>
            <p className='text-sm p-2 bg-violet-600 text-white font-medium rounded-4xl'>{questions.length} - Q&A</p>
            <p className='text-sm p-2 bg-violet-600 text-white font-medium rounded-4xl'>Last-Update {lastUpdatedAt}</p>
          </div>
        </div>

        <div className="w-[40vw] md:w-[50vw] h-[240px] flex items-center justify-center overflow-hidden absolute top-0 right-0">
          <div className='w-20 h-16 bg-lime-700 blur-[51px] animate-blob1' />
          <div className='w-16 h-16 bg-violet-700 blur-[51px] animate-blob2' />
          <div className='w-16 h-16 bg-red-400 blur-[51px] animate-blob3' />
          <div className='w-16 h-16 bg-blue-800 blur-[51px] animate-blob4' />
        </div>
      </div>
    </div>
  )
}

export default RoleInfoHeader