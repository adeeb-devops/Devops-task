import { useContext, useEffect, useState } from "react";
import "./lobby.css";
import { useLocation } from "react-router-dom";
import { DeviceContext } from "../context/deviceContext";
import MainBackground from "./mainBg";
import CircularLoader from "./circularLoader";
import Marquee from "react-fast-marquee";
import { TopBar } from "./topBar";
import { GameLobby } from "./gameLobby";
import assetList from "../../../assetList.json";
import ApiClient from "../api";
import { ResponsiveFontSize } from "../utils/ResponsiveFontSize";
import eventEmitter from "../eventEmitter";
import { DisconnectionPopup } from "../popups/disconnection";

declare global {
  interface Window {
    ReactNativeWebView: {
      postMessage: (message: string) => void;
    };
  }
}
const Lobby = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { isMobile }: any = useContext(DeviceContext);
  const [loading, setLoading] = useState(false);
  const [assetLoading, setAssetLoading] = useState(false);
  const [messageData, setMessageData] = useState<any>([]);

  const location = useLocation();

  const onLoaderSet = (data: boolean) => {
    setLoading(data);
  };

  useEffect(() => {
    setLoading(true);
    const message = { key: "loader", data: "Your data here" };
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage("loader");
    } else {
      console.warn("window.ReactNativeWebView is not available.");
    }
    window.parent.postMessage(message, "*");
  }, []);

  const preloadImage = (url: any) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;

      img.onload = () => {
        console.log(`Image loaded: ${url}`); // Log successful loads
        resolve(true);
      };

      img.onerror = (error) => {
        console.error(`Failed to load image: ${url}`, error); // Log the URL of the failed image
        reject(error);
      };
    });
  };

  const preloadJSON = async (url: string) => {
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load JSON: ${url}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(`JSON loaded: ${url}`);
        return data;
      })
      .catch((error) => {
        throw error;
      });
  };

  const preloadAssets = async () => {
    const validImageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg"];

    const imagePromises = assetList
      .filter((url: string) =>
        validImageExtensions.some((ext) => url.endsWith(ext))
      )
      .map(preloadImage);

    const jsonPromises = assetList
      .filter((url: string) => url.endsWith(".json"))
      .map(preloadJSON);

    try {
      await Promise.all([...imagePromises, ...jsonPromises]);
      console.log("All assets preloaded successfully");
      setAssetLoading(false);
    } catch (error) {
      console.error("Error loading some assets", error);
    }
  };
  const getMessages = async () => {
    const token = localStorage.getItem("minesToken");
    console.log("token", token);
    if (token) {
      try {
        const response = await ApiClient.get(
          "/cms/player/message/?game_name=mines",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('knknkkcascx',response.data)
        if (response.data.success) {
          const extractedMessages: any = response.data.data.map(
            ({ message_name, message_body }: any) => ({
              name: message_name,
              body: message_body,
            })
          );
          setMessageData(extractedMessages);
        }
      } catch (error) {
        console.error("Error during login verification:", error);
      }
    }
  };

  
  useEffect(() => {
	getMessages()
    const loadAssets = async () => {
      // Check if assets have been loaded before
      const hasLoaded = localStorage.getItem("assetsLoaded");

      if (!hasLoaded) {
        setAssetLoading(true); // Start loading state
        const success: any = await preloadAssets();

        if (success) {
          localStorage.setItem("assetsLoaded", "true"); // Mark assets as loaded
          console.log("hellodododooddodo---->");
          // setIsLoading(false); // End loading state

          // Post messages to WebView
          const message = { key: "loader", data: "Your data here" };
          if (
            window.ReactNativeWebView &&
            window.ReactNativeWebView.postMessage
          ) {
            window.ReactNativeWebView.postMessage("loader");
          } else {
            console.warn("window.ReactNativeWebView is not available.");
          }
          window.parent.postMessage(message, "*");
        }

        // onComplete(); // Call onComplete only if assets loaded successfully
      } else {
        // Assets have been loaded before

        console.log("Assets have already been loaded. Skipping preload.");
        //   setIsLoading(false); // End loading state

        // onComplete(); // Call onComplete immediately
      }
    };

    if (location.pathname !== "/master-office") {
      loadAssets();
    }
  }, []);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        position: "fixed",
      }}
    >
      <div style={styles[`${isMobile ? "p" : "l"}_mainContainer`]}>
        {<TopBar inGame={false} />}
        {messageData.length > 0 && (
          <div
            style={{
              height: "3%",
              width: "100%",
              background:
                "linear-gradient(to right, rgba(0, 0, 0, 0.5) 20%, transparent 20%, transparent 80%, rgba(0, 0, 0, 0.5) 100%)",
              position: "absolute",
              top: "9.5%",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Marquee>
              {messageData.map((item: any, index: any) => {
                return (
                  <h2
                    key={index}
                    style={{
                      color: "#fff",
                      fontSize: ResponsiveFontSize(
                        isMobile,
                        isMobile ? 12 : 18
                      ),
                      marginLeft: "0%",
                      marginRight: "0%",
                      backgroundColor:'pink'
                    }}
                  >{`${item.name}:${item.body}`}</h2>
                );
              })}
            </Marquee>
          </div>
        )}

        <div
          className={`details-div active`}
          style={
            styles[
              `${isMobile ? "p" : "l"}_main${
                activeTab == 0 ? "Card" : "Game"
              }Container`
            ]
          }
        >
          {<GameLobby activeTab={activeTab - 1} setLoader={onLoaderSet} />}
        </div>
      </div>
      <MainBackground
        onLoadStart={() => {
          setLoading(true);
        }}
      />
      {(loading || assetLoading) && <CircularLoader />}
      {(loading || assetLoading) &&
      <div style={{opacity:0}}>
      
      <DisconnectionPopup
       />
       </div>}
    </div>
  );
};

const styles: any = {
  p_mainContainer: {
    height: "100%",
    width: "100%",
    backgroundColor: "",
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "scroll",
  },
  l_mainContainer: {
    height: "100%",
    width: "100%",
    position: "absolute",
    display: "flex",
    alignItems: "center",
    overflow: "scroll",
  },
  p_mainCardContainer: {
    height: "50.18%",
    backgroundColor: "",
    width: "84.15%",
    display: "flex",
    top: "-10%",
    position: "relative",
    justifyContent: "space-between",
    flexWrap: "wrap",
    zIndex: 3,
  },
  l_mainCardContainer: {
    height: "80.027%",
    width: "80.25%",
    position: "absolute",
    right: "10%",
    top: "20%",
    display: "flex",
    flexWrap: "wrap",
    zIndex: 3,
  },
  p_mainGameContainer: {
    height: "50.18%",
    backgroundColor: "",
    width: "84.15%",
    display: "flex",
    flexWrap: "wrap",
    gap: "1% 5%",
    zIndex: 3,
  },
  l_mainGameContainer: {
    height: "58.027%",
    backgroundColor: "",
    width: "49.66%",
    position: "absolute",
    right: "23%",
    top: "28%",
    display: "flex",
    zIndex: 10,
    gap: "1% 5%",
    flexWrap: "wrap",
  },
};
export default Lobby;
