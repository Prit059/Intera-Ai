import React from 'react'

function DeleteAlertContent({content, onDelete}) {
  return (
    <div className='text-black'>
      <p className='text-xl'>{content}</p>

      <div className='flex justify-end mt-6'>
        <button 
        type='button'
        className='btn-small'
        onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}

export default DeleteAlertContent