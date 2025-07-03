import { useContext, useEffect, useState } from "react";
import { DeviceContext } from "../context/deviceContext";

export const Toggle = ({data,onToggle,type}) => {
  const [isOn, setIsOn] = useState(false);
  const { isMobile } = useContext(DeviceContext);

  const handleClick = () => {
    
    // setIsOn(!isOn);
    onToggle(type)
  };

  useEffect(()=>{
    setIsOn(data);

  },[data])


  return (
    <div
      onClick={handleClick}
      style={{
        height: "67%",
        width: "18%",
        borderColor:isOn?"green": "#fff",
        borderWidth:isMobile? 2:4,
        position: "absolute",
        borderTopRightRadius: "25px",
        borderTopLeftRadius: "25px",
        borderBottomLeftRadius: "25px",
        borderBottomRightRadius: "25px",
        display: "flex",
        left:'60%',
        alignItems: "center",
      }}
    >
      <div
        style={{
          height: "90%",
          width: "30%",
          borderRadius: "50%",
          backgroundColor:isOn? "green":'#fff',
          position: "absolute",
          left: isOn ? "calc(100% - 32%)" : "2%",
          transition: "left 0.3s ease",
        }}
      ></div>
    </div>
  );
};
