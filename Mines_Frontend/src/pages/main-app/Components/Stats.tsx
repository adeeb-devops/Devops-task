import { useContext } from "react";
import { DeviceContext } from "../context/deviceContext";
import { ResponsiveFontSize } from "../utils/ResponsiveFontSize";
import { StatsComponent } from "./StatsComponent";
export const Stats = ({ statData,onClose,onClick }) => {
  const { isMobile } = useContext(DeviceContext);

  const data = [
    [
      {
        id: 0,
        heading: "Profit",
        value: statData.statData.total_winning_amount.toFixed(2),
        textColor: "#2CE532",
      },
      {
        id: 1,
        heading: "Wagered",
        value: statData.statData.total_bet_amount,
        textColor: "#fff",
      },
    ],
    [
      {
        id: 3,
        heading: "Wins",
        value: statData.statData.total_win,
        textColor: "#2CE532",
      },
      {
        id: 4,
        heading: "Losses",
        value: statData.statData.total_loss,
        textColor: "#DA4B6F",
      },
    ],
  ];
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
          onClick={onClick}
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
            Statistics
          </h2>}
          <div
            style={{
              width:isMobile?"99.6%": "80.6%",
              height: isMobile?"29%":"38%",
              position: "absolute",
              left:isMobile?"0%": "10%",
              top:isMobile?"2%": "16%",
              borderRadius: 4,
              border: "1px solid #3C4057",
              background: "#1C1F32",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.15)",
            }}
          >
            <StatsComponent data={data[0]} />
            <div
              style={{ height: "90%", width: "1%", backgroundColor: "#31354C" }}
            ></div>
            <StatsComponent data={data[1]} />
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
