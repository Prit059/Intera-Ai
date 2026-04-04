import React, { useRef, useState } from 'react'
import { LuUser, LuUpload, LuTrash } from "react-icons/lu"

function ProfilePhotoSelector({ image, setImage, preview, setPreview }) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      const preview = URL.createObjectURL(file);
      if (setPreview) {
        setPreview(preview)
      }
      setPreviewUrl(preview);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
    if (setPreview) {
      setPreview(null)
    }
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <input
        type="file"
        accept='image/*'
        ref={inputRef}
        onChange={handleImageChange}
        className='hidden'
      />

      {!image ? (
        <div className="relative w-24 h-24 flex items-center justify-center bg-blue-100 rounded-full">
          <LuUser className='text-blue-400 text-4xl' />
          <button
            type='button'
            className='absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-md'
            onClick={onChooseFile}
          >
            <LuUpload className="text-lg" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={preview || previewUrl}
              alt="profile photo"
              className='w-32 h-32 rounded-xl border-2 border-orange-200 object-cover'
            />
            <button
              type='button'
              className='absolute -top-3 -right-3 bg-white p-2 rounded-full shadow-md hover:bg-red-100 transition-colors'
              onClick={handleRemoveImage}
            >
              <LuTrash className="text-red-500 text-lg" />
            </button>
          </div>
          <button
            type="button"
            onClick={onChooseFile}
            className="text-sm text-orange-600 hover:text-orange-700 underline"
          >
            Change Photo
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfilePhotoSelector