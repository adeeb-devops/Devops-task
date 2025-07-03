import { useContext, useEffect, useRef, useState } from "react";
import Lottie from "react-lottie-player";
import Loading from '../../../../public/loading.json'
import { DeviceContext } from "../context/deviceContext";

const LottieComponent: React.FC = () => {
  const { isMobile }: any = useContext(DeviceContext);   
  const animationData:any=Loading
  
  return (
    <div
      style={{
        height: "100%",
        position: "absolute",
        width: "100%",
        zIndex: 100000,
        pointerEvents: "none",
        top: 0,
        display:'flex',justifyContent:'center',alignItems:'center'
      }}
    >
      {
        !isMobile ? (
          <div style={{ height: "8%", width: "60%", position: "fixed",}}>
            <Lottie
              animationData={animationData}
              play={true}
              loop={true}
              speed={1}
              direction={1}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ) : (
          <div style={{ width: "40%", height: "50%", position: 'absolute', top: '25%', left: "30%", zIndex: 110}}>
            <Lottie
              animationData={animationData}
              play={true}
              loop={true}
              speed={1}
              style={{
                width: "100%",
                height: "100%",
                position: 'absolute',
                transform: 'scale(2)',
                transformOrigin: 'center',
              }}
            />
          </div>
        )
      }
    </div>
  );
};

export default LottieComponent;
