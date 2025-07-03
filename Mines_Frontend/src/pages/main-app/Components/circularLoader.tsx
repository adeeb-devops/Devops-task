import React, { useEffect } from 'react';
import LottieComponent from './lottie';

const CircularLoader = () => {
  return (
    <div style={{position:'absolute',zIndex:1000000,justifyContent:'center',alignItems:'center',width:'100%',backgroundColor:'rgba(0,0,0,0.5)',height:'100%'}}>
      <LottieComponent/>
    </div>
  );
};

export default CircularLoader;
