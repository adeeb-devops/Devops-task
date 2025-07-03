import "./App.css";
import AdminRoutes from "./pages/routes/AdminRoutes";
import { MyContextProvider } from "../src/pages/main-app/context/context";
import UserAppRoute from "../src/pages/routes/UserAppRoute";
import { DeviceProvider } from "./pages/main-app/context/deviceContext";
import UserApp from "../src/pages/main-app/Components/userApp"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiClient from "./pages/main-app/api";

// console.log(() => { });

declare global {
  interface Window {
    ReactNativeWebView: {
      postMessage: (message: string) => void;
    };
  }
}

function App() {
  const [_dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const navigate=useNavigate()

  const gameRatio = 16 / 9;
  const [screenDimension, setScreenDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const onLayoutChange = () => {
    const dimension = { ...screenDimension };

    // if (dimension.width > dimension.height) {
    //   StaticKey.IS_LANDSCAPE = true;
    //   if (dimension.height * gameRatio > dimension.width) {
    //     dimension.height = dimension.width / gameRatio;
    //     dimension.width = dimension.height * gameRatio;
    //   } else {
    //     dimension.width = dimension.height * gameRatio;
    //   }
    // } else {
    //   StaticKey.IS_LANDSCAPE = false;
    //   if (dimension.width * gameRatio > dimension.height) {
    //     dimension.width = dimension.height / gameRatio;
    //     dimension.height = dimension.width * gameRatio;
    //   } else {
    //     dimension.height = dimension.width * gameRatio;
    //   }
    // }

    // StaticKey.GAME_DIMENSION.x = (screenDimension.width - dimension.width) / 2;
    // StaticKey.GAME_DIMENSION.y = (screenDimension.height - dimension.height) / 2;
    // StaticKey.GAME_DIMENSION.width = dimension.width;
    // StaticKey.GAME_DIMENSION.height = dimension.height;

    // StaticKey.SCREEN_DIMENSION = dimension;
    // StaticKey.ORIENTATION_TYPE = StaticKey.IS_LANDSCAPE ? 'l' : 'p';

    setScreenDimension({
      width: dimension.width,
      height: dimension.height,
    });
  };

 
  
  useEffect(() => {
    const handleResize = () => {
      setScreenDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      onLayoutChange();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  async function updatePlayerNameIfNull(data: any, token: string) {
    if (data.data.data.player_name === null) {
      try {
        const response: any = await ApiClient.put(
          `/player/updatePlayerName/${data.data.data.id}`,
          { player_name: data.data.data.username }, // Provide the player name in the request body
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (response.status === 200) {
          console.log("Player name updated successfully:", response.data);
          return { success: true, data: response.data };
        } else {
          console.log("Failed to update player name:", response);
          return { success: false, error: "Unexpected response" };
        }
      } catch (error: any) {
        console.error("Error updating player name:", error);
        return { success: false, error: error.message || "Unknown error" };
      }
    } else {
      console.log("Player name is already set.");
      return { success: false, error: "Player name is already set" };
    }
  }

  const getVerified=async (token)=>{
    try {
         if(token){
           const data:any  = await ApiClient.get("/player/verify", {
             headers: {
               Authorization: `Bearer ${token}`,
             },
             });
             console.log('odijcijwo',data)
             if (data.data.success) {
              if(data.data.data.player_name===null){
                updatePlayerNameIfNull(data,token)
              }
              localStorage.setItem("user", JSON.stringify(data.data.data));
      
              navigate("/home");
            }
         }
                
       } catch (error) {
         // handleLogout()
       } finally {
       //   setLoader(false);
       }
       
 
   }


  useEffect(()=>{
    const queryParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = queryParams.get('token');
    if(tokenFromUrl){
      localStorage.setItem('minesToken',tokenFromUrl)
      getVerified(tokenFromUrl)
    }
  },[])
  
  return (
    <>
      <AdminRoutes />
      <DeviceProvider>
      <MyContextProvider>
        <UserApp>
          <UserAppRoute />
        </UserApp>
      </MyContextProvider>
      </DeviceProvider>
    </>
  );
}

export default App;
