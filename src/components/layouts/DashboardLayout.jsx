import React, { Children, useContext } from 'react'
import { UserContext } from '../../context/userContext'
import Navbar from './Navbar';
import PageHeader from '../PageHeader';
function DashboardLayout({children}) {
  const {user} = useContext(UserContext);
  return (
    <div className='bg-black text-white'>
      <Navbar />
      {/* <PageHeader path="Home / Main-Dashboard / Q&A Dashboard"/> */}
      {/* Page Header */}

      {user && <div>{children}</div>}
    </div>
  )
}

export default DashboardLayout