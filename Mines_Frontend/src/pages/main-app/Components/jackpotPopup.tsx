import { useContext, useEffect ,useState} from "react";
import { DeviceContext } from "../context/deviceContext";
import { ResponsiveFontSize } from "../utils/ResponsiveFontSize"

export const JackpotPopup=({onClose})=>{
    const { isMobile } = useContext(DeviceContext);
    const [amount,setAmount]=useState(0)
     useEffect(()=>{
        const contestString = sessionStorage.getItem("contestData");
        const userData = localStorage.getItem("user");
        const userParsed = userData ? JSON.parse(userData) : null;
        const contests = contestString ? JSON.parse(contestString) : null;
        setAmount(contests.jackpot_bonus)
        setTimeout(()=>{
           onClose()
        },2000)
     },[])
    return(
        <div style={{height:'100%',width:'100%',position:'absolute',display:'flex',justifyContent:'center',alignItems:'center'}}>

            <div
              style={{
                height: "30%",
                width: "45%",
                backgroundColor: "#1C1F32",
                position: "absolute",
                border: isMobile?"4px solid #00F2F":"4px solid #00FF2F",
                borderRadius: 8,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
               paddingRight:'1%',
               paddingLeft:'1%',
                transform: "scale(0)", // Start with a scale of 0
                animation: "scaleIn 0.5s ease forwards",
              }}
            >
                <div style={{height:'30%',width:'27.6%',display:'flex',justifyContent:'center',alignItems:'center'}}>
                    <img src={"/game/gold_mine.png"}/>
                </div>
                <div style={{height:'100%',width:'52%',display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column'}}>
                     <h2
                style={{
                  color: "#00FF2F",
                  textAlign: "center",
                  fontFamily: "Montserrat",
                  fontSize: ResponsiveFontSize(isMobile,isMobile?16: 40),
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: "normal",
                }}
              >Jackpot</h2>
               <h2
                style={{
                  color: "#00FF2F",
                  textAlign: "center",
                  fontFamily: "Montserrat",
                  fontSize: ResponsiveFontSize(isMobile,isMobile?16: 40),
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: "normal",
                }}
              >{amount}</h2>
                </div>

                <div style={{height:'30%',width:'27.6%',display:'flex',justifyContent:'center',alignItems:'center'}}>
                    <img src={"/game/gold_mine.png"}/>
                </div>
             
            </div>
            </div>

        
    )
}