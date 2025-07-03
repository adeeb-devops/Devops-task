import { useContext } from "react";
import { DeviceContext } from "../../context/deviceContext";
import { ResponsiveFontSize } from "../../utils/ResponsiveFontSize"


export const LowBalance=({onClose})=>{
    const { isMobile } = useContext(DeviceContext);

    return(
        <div style={{height:isMobile?"23.7%":'35.4%',width:isMobile?"89%":'40%',backgroundColor:'#1C1F32',border:"1.5px solid #fff",borderRadius:20,display:'flex',justifyContent:'space-evenly',flexDirection:'column',alignItems:'center',position:'absolute', transform: "scale(0)", // Start with a scale of 0
          animation: "scaleIn 0.5s ease forwards",}}>
            <img src={'/game/alert.png'} style={{height:isMobile?'22.2%':'27%',width:isMobile?"14.6%":'22%',position:'absolute',top:'3%'}}/>
            <div style={{height:'30%',width:'100%',display:'flex',justifyContent:'space-around',alignItems:'center',flexDirection:'column',position:'absolute',top:'39%'}}>
            <h2
              style={{
                color: "#EEC73B",
                textAlign: "center",
                fontFamily: "Montserrat",
                fontSize: ResponsiveFontSize(isMobile,isMobile?12: 20),
                fontStyle: "normal",
                fontWeight: 600,
                // position:'absolute',
                lineHeight: "normal",
                // top:'48%'
                
              }}
            >
                LOW BALANCE
        </h2>
        <h2
              style={{
                color: "#fff",
                textAlign: "center",
                paddingLeft:'5%',
                paddingRight:'5%',
                fontFamily: "Montserrat",
                fontSize: ResponsiveFontSize(isMobile,isMobile?12: 20),
                fontStyle: "normal",
                fontWeight: 600,
                // position:'absolute',
                lineHeight: "normal",
                // bottom:'40%'
              }}
            >
             Your balance is too low to play. Please 
             deposit funds into your account
        </h2>
            </div>
            <div onClick={onClose} style={{height:'10%',width:'27%',background:'#fff',position:'absolute',bottom:'10%',borderRadius:20,display:'flex',justifyContent:'space-around',alignItems:'center',}}>
            <h2
              style={{
                color: "#000",
                textAlign: "center",
                fontFamily: "Montserrat",
                fontSize: ResponsiveFontSize(isMobile,isMobile?7: 16),
                fontStyle: "normal",
                fontWeight: 600,
                position:'absolute',
              }}
            >
          CLOSE
        </h2>
            </div>
          </div>
    )
}

