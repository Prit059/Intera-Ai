import React, { createContext, useContext, useEffect, useState } from 'react';

const DarkModeContext = createContext();

export const useDarkMode = () => useContext(DarkModeContext);

const DarkModeProvider = ({ children }) => {
  const [darkmode, setDarkmode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkmode') === 'true';
    setDarkmode(savedMode);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkmode', darkmode);
  }, [darkmode]);

  return (
    <DarkModeContext.Provider value={{ darkmode, setDarkmode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export default DarkModeProvider;
