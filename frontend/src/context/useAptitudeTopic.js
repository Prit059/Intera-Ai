import { useState, useEffect, useContext } from 'react';
import { AptitudeContext } from './AptitudeContext';

export const useAptitudeTopic = () => {
  const context = useContext(AptitudeContext);
  if (!context) {
    throw new Error('useAptitudeTopic must be used within AptitudeProvider');
  }
  return context;
};