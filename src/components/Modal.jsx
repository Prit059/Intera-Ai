import React from 'react';

function Modal({
  children,
  isOpen,
  onClose,
  hideHeader,
  title,
  showBackButton,
  onBack
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 border border-gray-200 overflow-hidden">
        {/* Modal Header */}
        {!hideHeader && (
          <div className="flex items-center p-4 border-b border-gray-200">
            {showBackButton && (
              <button 
                onClick={onBack}
                className="mr-2 text-gray-600 hover:text-orange-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            {/* {showBackButton && (
              <button 
                onClick={onBack}
                className="mr-2 text-black hover:text-amber-700"
              >
                ←
              </button>
            )} */}
            <h3 className="text-lg font-semibold text-gray-900 flex-grow">
              {title}
            </h3>
            {/* <button 
              onClick={onClose}
              className="text-black hover:text-amber-700"
            >
              ✕
            </button> */}
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-orange-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;