import React, { useState, useEffect } from 'react';
import { PuffLoader, ClipLoader, PulseLoader, BeatLoader } from 'react-spinners';

const Loader = ({ type = 'puff', color = '#3B82F6', size = 60 }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prevDots => prevDots.length >= 3 ? '' : prevDots + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const loaderComponents = {
    puff: PuffLoader,
    clip: ClipLoader,
    pulse: PulseLoader,
    beat: BeatLoader,
  };

  const LoaderComponent = loaderComponents[type] || PuffLoader;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <LoaderComponent color={color} size={size} />
      <p className="mt-4 text-lg font-semibold text-gray-700">
        Loading{dots}
      </p>
    </div>
  );
};

export default Loader;