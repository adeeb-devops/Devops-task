import { useContext, useEffect, useState } from "react"
import { ResponsiveFontSize } from "../utils/ResponsiveFontSize"
import { DeviceContext } from "../context/deviceContext";


export const Limits=({onClose})=>{
  const { isMobile } = useContext(DeviceContext);

    const [data,setData]=useState<any>({})
    useEffect(()=>{
        const contestString = sessionStorage.getItem("contestData");
        const contests = contestString ? JSON.parse(contestString) : null;
        setData(contests)
    },[])
    return(
      <div
      style={{
        height:isMobile?"82.67%" :"69%",
        width:isMobile?"94.2%" : "32.1%",
        backgroundColor: "#23263A",
        position: "absolute",
        left: isMobile?"2.8%" :"34%",
        top:isMobile?"0%" : "15.5%",
        borderRadius: 8,
      }}
    >
       {!isMobile&&<h2
          style={{
            color: "#FFF",
            textAlign: "center",
            fontFamily: "Montserrat",
            fontSize: ResponsiveFontSize(false, 18),
            fontStyle: "normal",
            fontWeight: 700,
            marginTop: "6%",
          }}
        >
          Limits
        </h2>}
        <div
          style={{
            width:'90.6%',
            height:isMobile?"8%":'12%',
            position:'absolute',
            left:'5%',
            top:isMobile?"5%":'16%',
            borderRadius: 4,
            border: "1px solid #3C4057",
            background: "#1C1F32",
            display: "flex",
            alignItems: "center",
            justifyContent:'center',
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.15)",
          }}
        >
          <h2
          style={{
            color: "#FFF",
            textAlign: "center",
            fontFamily: "Montserrat",
            fontSize: ResponsiveFontSize(isMobile,isMobile?12: 18),
            fontStyle: "normal",
            fontWeight: 700,
          }}
        >
         {`Minimum Play: ₹${data.min_bet}`} 
        </h2>
        </div>
         <div
          style={{
            width:'90.6%',
            height:isMobile?"8%":'12%',
            position:'absolute',
            left:'5%',
            top:isMobile?"15%":'33%',
            borderRadius: 4,
            border: "1px solid #3C4057",
            background: "#1C1F32",
            display: "flex",
            alignItems: "center",
            justifyContent:'center',
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.15)",
          }}
        >
           <h2
          style={{
            color: "#FFF",
            textAlign: "center",
            fontFamily: "Montserrat",
            fontSize: ResponsiveFontSize(isMobile,isMobile?12: 18),
            fontStyle: "normal",
            fontWeight: 700,
          }}
        >
          {`Maximum Play: ₹${data.max_bet}`} 
        </h2>
        </div>
        {!isMobile&&<div
            style={{
              height: "6.2%",
              width: "23.6%",
              position: "absolute",
              bottom: "4%",
              borderRadius: "25px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "0.5px solid #FFF",
              background: "#FFF",
              left: "38.2%",
            }}
            onClick={onClose}
          >
            <h2
              style={{
                color: "#000",
                textAlign: "center",
                fontFamily: "Montserrat",
                fontSize: ResponsiveFontSize(false, 18),
                fontStyle: "normal",
                fontWeight: 700,
              }}
            >
              Close
            </h2>
          </div>}
      </div>
    )
}