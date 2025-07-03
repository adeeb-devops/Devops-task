import { useContext } from "react";
import { DeviceContext } from "../context/deviceContext";
import { ResponsiveFontSize } from "../utils/ResponsiveFontSize";

export const History = ({ data, onClose }) => {
  const { isMobile } = useContext(DeviceContext);

  return (
    <div
      style={{
        height: isMobile ? "82.67%" : "69%",
        width: isMobile ? "94.2%" : "32.1%",
        backgroundColor: "#23263A",
        position: "absolute",
        left: isMobile ? "2.8%" : "34%",
        top: isMobile ? "0%" : "15.5%",
        borderRadius: 8,
      }}
    >
      {!isMobile && (
        <h2
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
          History
        </h2>
      )}
      <div
        style={{
          height: "4%",
          width: "90%",
          position: "absolute",
          top: isMobile ? "3%" : "12%",
          left: "5%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {["Date", "Play Amount", "Multiplier", "Payout"].map((item, index) => {
          return (
            <div
              style={{
                height: "100%",
                width: "25%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h2
                key={index}
                style={{
                  color: "#FFF",
                  textAlign: "center",
                  fontFamily: "Montserrat",
                  fontSize: ResponsiveFontSize(false, 15),
                  fontStyle: "normal",
                  fontWeight: 700,
                }}
              >
                {item}
              </h2>
            </div>
          );
        })}
      </div>
      <div
        style={{
          height: isMobile ? "84%" : "74%",
          width: "95%",
          position: "absolute",
          top: isMobile ? "9%" : "17%",
          left: "2.5%",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {data.map((item: any, index: any) => (
          <div
            key={index}
            style={{
              minHeight: isMobile ? "10.55%" : "16.2%",
              width: "100%",
              borderRadius: 4,
              boxSizing: "border-box",
              border: "1px solid #3C4057",
              boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.15)",
              marginBottom: "2%",
            }}
          >
            <div
              style={{
                height: "20%",
                width: "100%",
                display: "flex",
              }}
            >
              <h2
                style={{
                  color: "#FFF",
                  fontFamily: "Montserrat",
                  fontSize: ResponsiveFontSize(false, 15),
                  fontStyle: "normal",
                  fontWeight: 700,
                  marginLeft: "4%",
                  marginTop: "3%",
                }}
              >
                {`Game Id:${item.game_id}  `}
              </h2>
              <h2
                style={{
                  color: "#00FF04",
                  fontFamily: "Montserrat",
                  fontSize: ResponsiveFontSize(false, 15),
                  fontStyle: "normal",
                  fontWeight: 500,
                  marginLeft: "4%",
                  marginTop: "3%",
                }}
              >
                {`${item.jackpotAmount>0?item.jackpotAmount+"   Jackpot":""}`}
              </h2>
            </div>
            <div
              style={{
                height: "50%",
                width: "94%",
                display: "flex",
                justifyContent: "space-between",
                marginLeft: "3%",
                marginTop: "4%",
                alignItems: "center",
              }}
            >
              {Object.values(item.otherData).map((item: any, idx) => (
                <h2
                  key={idx}
                  style={{
                    color: "#FFF",
                    width: "25%",
                    textAlign: "center",
                    fontFamily: "Montserrat",
                    fontSize: ResponsiveFontSize(false, 15),
                    fontStyle: "normal",
                    fontWeight: 700,
                  }}
                >
                  {item}
                </h2>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!isMobile && (
        <div
          style={{
            height: "6.2%",
            width: "23.6%",
            position: "absolute",
            bottom: "1%",
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
        </div>
      )}
    </div>
  );
};
