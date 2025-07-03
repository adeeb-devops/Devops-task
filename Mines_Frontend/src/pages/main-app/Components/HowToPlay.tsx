import { useContext } from "react";
import { DeviceContext } from "../context/deviceContext";
import { ResponsiveFontSize } from "../utils/ResponsiveFontSize";

export const HowToPlay = ({ data, onClose }) => {
  const { isMobile } = useContext(DeviceContext);

    return (
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
        How to Play
      </h2>}
      <div
        style={{
          height:isMobile?"88%": "69%",
          width: "95.7%",
          top:isMobile?"6%": "12%",
          left: "2.15%",
          position: "absolute",
          borderRadius: 4,
          border: "1px solid #3C4057",
          background: "#1C1F32",
          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.15)",
        }}
      >
        {data.map((item, index) => {
          return (
            <div
              key={index}
              style={{ width: "100%", marginTop: "1%" }}
            >
              <h2
                style={{
                  color: "#FFF",
                  textAlign: "center",
                  fontFamily: "Montserrat",
                  fontSize: ResponsiveFontSize(isMobile,isMobile?16: 18),
                  fontStyle: "normal",
                  fontWeight: 700,
                }}
              >
                {item.question}
              </h2>
              <h2
                style={{
                  color: "#FFF",
                  //   textAlign: "center",
                  fontFamily: "Montserrat",
                  fontSize: ResponsiveFontSize(isMobile,isMobile?10: 14),
                  fontStyle: "normal",
                  fontWeight: 700,
                  paddingLeft: "5%",
                  paddingRight: "5%",
                  marginTop: "2%",
                }}
              >
                {item.answer}
              </h2>
            </div>
          );
        })}
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
  );
};
