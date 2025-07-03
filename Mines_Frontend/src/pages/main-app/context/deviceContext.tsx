import { createContext, useState, useEffect } from "react";

const DeviceContext = createContext({ isMobile: false, isLandscapeMode: false });

const DeviceProvider = ({ children }: any) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const isLandscape={
        rotate:false
    }
    const updateState = () => {
		console.log('lovnomoemw')
      if (isLandscape.rotate) {
        if (window.innerWidth > window.innerHeight) {
          setIsLandscapeMode(true);
          setIsMobile(false);
        } else {
          setIsLandscapeMode(false);
          setIsMobile(mediaQuery.matches);
        }
      } else {
        setIsLandscapeMode(false);
        setIsMobile(mediaQuery.matches);
      }
    };

    // Initial update
    updateState();

    const handleChange = (e: any) => {
		console.log('onfeownf')
      if (isLandscape.rotate) {
        if (window.innerWidth > window.innerHeight) {
          setIsLandscapeMode(true);
          setIsMobile(false);
        } else {
          setIsLandscapeMode(false);
          setIsMobile(e.matches);
        }
      } else {
        setIsLandscapeMode(false);
        setIsMobile(e.matches);
      }
    };

    const handleResize = () => {
      updateState();
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <DeviceContext.Provider value={{ isMobile, isLandscapeMode }}>
      {children}
    </DeviceContext.Provider>
  );
};

export { DeviceProvider, DeviceContext };
