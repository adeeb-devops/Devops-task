import { useContext } from "react";
import { DeviceContext } from "../context/deviceContext";
import { ResponsiveFontSize } from "../utils/ResponsiveFontSize"


export const StatsComponent=({data})=>{
  const { isMobile } = useContext(DeviceContext);

    const renderComp=(item,index)=>{
        return(
            <div
            key={index}
            style={{ height: "50%", width: "100%", display: "flex",
                alignItems: "center",
                flexDirection: "column",
                justifyContent: "center", }}
          >
            <h2
              style={{
                color: "#FFF",
                textAlign: "center",
                fontFamily: "Montserrat",
                fontSize: ResponsiveFontSize(isMobile,isMobile?14: 18),
                fontStyle: "normal",
                fontWeight: 700,
                // marginTop: "6%",
              }}
            >
              {item.heading}
            </h2>
            <h2
              style={{
                color: item.textColor,
                textAlign: "center",
                fontFamily: "Montserrat",
                fontSize:ResponsiveFontSize(isMobile,isMobile?14: 18),
                fontStyle: "normal",
                fontWeight: 700,
                marginTop: "6%",
              }}
            >
              {item.value}
            </h2>
          </div>
        )
    }
    console.log('duysgyudss',data)
    return(
        <div
          style={{
            height: "100%",
            width: "48%",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {
            data.map((item:any,index:any)=>{
                return(
                    renderComp(item,index)
                )
            })
          }
        </div>
    )
}