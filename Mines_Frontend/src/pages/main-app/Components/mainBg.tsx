import { useContext } from "react";
import { DeviceContext } from "../context/deviceContext";

const MainBackground = ({onLoadStart}) => {
  const { isMobile }: any = useContext(DeviceContext);

  return (
    <img
      src={isMobile ? "/main/mobileBg.png" : "/main/minBg.png"}
      onLoadStart={onLoadStart}
      alt="main"
      style={{
        height: "100%",
        width: "100%",
        position: "absolute",
        objectFit: "cover",
      }}
    ></img>
  );
};

export default MainBackground;
