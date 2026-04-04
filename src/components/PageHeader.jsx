import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

function PageHeader({ path }) {

  const navigate = useNavigate();

  return (
    <div>
      <div className='flex fixed top-5 px-2 items-center space-x-4 text-gray-300 mb-5'>
        <button className='cursor-pointer' onClick={() => navigate(-1)}>
          <ChevronLeft size={26}/>
        </button>

        {/* Path Display */}
        <div className='text-md font-medium text-gray-200'>
          {path.split("/").map((segment,index, arr) => (
            <span key={index}>{segment} {index < arr.length - 1 && "/"}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PageHeader