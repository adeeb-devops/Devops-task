import { useContext, useEffect } from "react";
import { DeviceContext } from "../../context/deviceContext";
import { ResponsiveFontSize } from "../../utils/ResponsiveFontSize"

export const ErrorPopup=({onClose})=>{
    const { isMobile } = useContext(DeviceContext);
    useEffect(()=>{
       setTimeout(()=>{
          onClose()
       },3000)
    },[])
    return(
        <div style={{height:'100%',width:'100%',position:'absolute',display:'flex',justifyContent:'center',alignItems:'center'}}>
        <div
        style={{
          height:isMobile?"16%": "20%",
          width:isMobile?"70%": "31%",
          backgroundColor: "#1C1F32",
          position: "absolute",
          border: "6px solid #585858",
          borderRadius: 8,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          transform: "scale(0)", // Start with a scale of 0
          animation: "scaleIn 0.5s ease forwards",
        }}
      >
        <h2
          style={{
            color: "#FF0008",
            textAlign: "center",
            fontFamily: "Montserrat",
            fontSize: ResponsiveFontSize(false, 44),
            fontStyle: "normal",
            fontWeight: 700,
            lineHeight: "normal",
          }}
        >
          {"Invalid Bet Amount"}
        </h2>
      </div>
      </div>

    
    )
}