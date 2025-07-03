import { useContext } from "react";
import { DeviceContext } from "../../context/deviceContext";
import { ResponsiveFontSize } from "../../utils/ResponsiveFontSize"


export const DisconnectionPopup=()=>{
    const { isMobile } = useContext(DeviceContext);

    return(
        <div style={{height:isMobile?"28.4%":'35.4%',width:isMobile?"89%":'40%',backgroundColor:'#1C1F32',border:"1.5px solid #fff",borderRadius:20,display:'flex',justifyContent:'space-evenly',flexDirection:'column',alignItems:'center', transform: "scale(0)", // Start with a scale of 0
          animation: "scaleIn 0.5s ease forwards",}}>
            <img src={'/game/alert.png'} style={{height:'27%',width:'22%'}}/>
            <div style={{height:'30%',width:'100%',display:'flex',justifyContent:'space-around',alignItems:'center',flexDirection:'column'}}>
            <h2
              style={{
                color: "#EEC73B",
                textAlign: "center",
                fontFamily: "Montserrat",
                fontSize: ResponsiveFontSize(isMobile,isMobile?17: 27),
                fontStyle: "normal",
                fontWeight: 600,
                lineHeight: "normal",
              }}
            >
                You've been disconnected
        </h2>
        <h2
              style={{
                color: "#fff",
                textAlign: "center",
                fontFamily: "Montserrat",
                fontSize: ResponsiveFontSize(isMobile,isMobile?17: 27),
                fontStyle: "normal",
                fontWeight: 600,
                lineHeight: "normal",
              }}
            >
                trying to reconnect...
        </h2>
            </div>
          </div>
    )
}

