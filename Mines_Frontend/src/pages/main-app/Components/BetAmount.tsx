import { Height } from "@mui/icons-material";
import { DeviceContext } from "../context/deviceContext";

import { ResponsiveFontSize } from "../utils/ResponsiveFontSize";
import { useContext } from "react";

export const BetAmountComp = ({
  heading,
  top,
  height,
  betAmount,
  handleBetAmountChange,
  onHalfClick,
  onDoubleClick,
  isBetPlaced,
  isAutoBetActive
}) => {
  const { isMobile } = useContext(DeviceContext);

  return (
    <div
      style={{
        height: height ?? "9.702%",
        width: "91.62%",
        position: "absolute",
        top: top,
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
      }}
    >
      <h2
        style={{
          color: "#fff",
          fontSize: ResponsiveFontSize(isMobile, isMobile ? 12 : 16),
          fontWeight: "700",
        }}
      >
        Bet Amount
      </h2>
      <div
        style={{
          height: isMobile ? "63.65%" : "51.65%",
          width: "100%",
          borderRadius: "4px",

          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <input
          value={betAmount}
          onChange={handleBetAmountChange}
          type="number"
          disabled={isAutoBetActive||isBetPlaced}
          style={{
            height: "100%",
            width: "73.8%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius:4,
            border: "1px solid #3C4057",
            background: "#1C1F32",
            color: "#fff",
            paddingLeft: "3%",
            fontWeight: "700",
            fontSize: ResponsiveFontSize(isMobile, isMobile ? 14 : 16),
          }}
        ></input>

        <div
          style={{
            height: "100%",
            width: "12%",
            backgroundColor: "green",
            border: "1px solid #3C4057",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius:4,
            background: "#1C1F32",
          }}
          onClick={onHalfClick}
        >
          <h2
            style={{
              color: "#fff",
              fontSize: ResponsiveFontSize(isMobile, isMobile ? 14 : 16),
              fontWeight: "700",
            }}
          >
            1/2
          </h2>
        </div>

        <div
          style={{
            height: "100%",
            width: "12%",
            backgroundColor: "green",
            border: "1px solid #3C4057",
            display: "flex",
            justifyContent: "center",
            borderRadius:4,
            alignItems: "center",
            background: "#1C1F32",
          }}
          onClick={onDoubleClick}
        >
          <h2
            style={{
              color: "#fff",
              fontSize: ResponsiveFontSize(isMobile, isMobile ? 14 : 16),
              fontWeight: "700",
            }}
          >
            2x
          </h2>
        </div>
      </div>
    </div>
  );
};
