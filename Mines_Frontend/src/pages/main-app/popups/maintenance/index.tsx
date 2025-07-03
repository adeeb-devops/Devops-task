import { useContext, useEffect } from "react"
import { ResponsiveFontSize } from "../../utils/ResponsiveFontSize"
import { DeviceContext } from "../../context/deviceContext";
import { useNavigate } from "react-router-dom";

export const RestrictPopup=({type,onClose}:any)=>{
    const { isMobile } = useContext(DeviceContext);
	const navigate=useNavigate()


    useEffect(()=>{
        console.log('lieinwlfnwnfwnfwnfwfewwfewenl',type)
      setTimeout(()=>{
        const message = { key: 'exit', data: 'Your data here' };
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage("exit");
        } else {
          console.warn("window.ReactNativeWebView is not available.");
        }
        window.parent.postMessage(message, '*');
        navigate('/')
        onClose()
      },5000)
    },[])
    return(
        <div style={{ height: '100%', width: '100%', backgroundColor: 'rgba(0,0,0,0.6)', position: 'absolute', top: 0, zIndex: 10,display: 'flex',
            justifyContent: 'center',
            alignItems: 'center', }}>
        <div style={{
            height: '35.4%',
            width: '40%',
            backgroundColor: '#000',
            border: "1.5px solid #fff",
            borderRadius: 20,
            display: 'flex',
            justifyContent: 'space-around',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'absolute',
            transform: "scale(0)", // Start with a scale of 0
            animation: "scaleIn 0.5s ease forwards",
        }}>
            <img src={type=="restrict"?'/main/blocked.png':"/main/maintanence.png"} style={{ height: '27%', width: '15%', position: 'absolute', top: '13%' }} />
            <div style={{ height: '54%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', position: 'absolute', top: '38%',backgroundColor:'' }}>
                <h2
                    style={{
                        color: "#EEC73B",
                        textAlign: "center",
                        fontSize:ResponsiveFontSize(isMobile,isMobile?15:30),
                        fontStyle: "normal",
                        fontWeight: 600,
                    }}
                >
                  {type=="restrict"?"RESTRICTED":"MAINTENANCE"}
                </h2>
                <h2
                    style={{
                        color: "#fff",
                        textAlign: "center",
                        paddingLeft: '5%',
                        paddingRight: '5%',
                        fontSize:ResponsiveFontSize(isMobile,isMobile?13:20),
                        fontStyle: "normal",
                        fontWeight: 600,
                    }}
                >
                    {type=="restrict"?"You have been restricted from the game.\n Please contact your admin.":"The game is under maintenances. Please try againlater"}
                </h2>
            </div>
            {/* <div style={{ height: '10%', width: '27%', background: '#fff', position: 'absolute', bottom: '10%', borderRadius: 20, display: 'flex', justifyContent: 'space-around', alignItems: 'center', }}>
                <h2
                    style={{
                        color: "#000",
                        textAlign: "center",
                        fontSize: '16px',
                        fontStyle: "normal",
                        fontWeight: 600,
                        position: 'absolute',
                    }}
                >
                    EXIT GAME
                </h2>
            </div> */}
        </div>

    </div>
    )
}