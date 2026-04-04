import React from 'react'
import { AdNavbar, AdSidebar } from "./AdImport/Adimportfile";
import { Outlet } from 'react-router-dom';

function AdMainPage() {
  return (
    <div className='bg-black'>
      <div className='fixed w-full z-1'>
        <AdNavbar />
      </div>
      <div className='flex min-h-screen'>
        <div className='fixed mt-15'>
          <AdSidebar />
        </div>
        <div className='flex-1 p-6'>
          {/* Main content goes here */}
          <Outlet />
        </div>
      </div>
    </div>  
  )
}

export default AdMainPage