import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ResponsiveFontSize } from "../utils/ResponsiveFontSize";
import { DeviceContext } from "../context/deviceContext";
import eventEmitter from "../eventEmitter";
import ApiClient from "../api";

interface Props {
  inGame: any;
  contestId?: any;
}

export const TopBar = (props: Props) => {
  const { isMobile,isLandscapeMode }: any = useContext(DeviceContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);
  const [_windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [userBalance,setUserBalance]=useState<any>(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [gameId,setGameId]=useState('xxxxxxxx')
  const [name,setName]=useState('')
  const handleClick = () => {
    // playSound("ButtonClick");
    setIsClicked(true);
    setTimeout(() => {
    //   props.openMenu();
      setIsClicked(false);
    }, 200);
  };

  const onBackClick=()=>{
    console.log('lsdjclocnwnclwn')
    const message = { key: "logout", data: "Your data here" }; // Your data to send

    // Send the message to the parent window
    window.parent.postMessage(message, "*"); //
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage("logout");
    } else {
      console.warn("window.ReactNativeWebView is not available.");
    }
    window;
  }

  const getBalance=async ()=>{
    const token = localStorage.getItem("minesToken");
    if (token) {
      try {
        const response = await ApiClient.get(
          "/player/getBalance",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('knknkkcascx',response)
        if (response.data.success) {
          setUserBalance(Number(response.data.data.balance))
        }
      } catch (error) {
        console.error("Error during login verification:", error);
      }
    }
  }

  useEffect(()=>{
    getBalance()
    const userData = localStorage.getItem("user");
    const userParsed = userData ? JSON.parse(userData) : null;
    if (userParsed) {
      setName(userParsed.player_name!==null?userParsed.player_name:userParsed.username)
    }
    eventEmitter.on('update-balance',(data)=>{
      console.log('vnrewkvewvevee',Number(data))
      setUserBalance(Number(data))
    })



    
  },[])

  const messageFromWallet=()=>{
    const message = { key: 'wallet', data: 'Your data here' };
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage("wallet");
    } else {
      console.warn("window.ReactNativeWebView is not available.");
    }
    window.parent.postMessage(message, '*');
  }

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const { pathname } = useLocation();
  return (
    <div style={{ ...styles[`${isMobile ? "p" : "l"}_mainContainer`] }}>
      <div
        style={{
          height: "150%",
          width: "100%",
          backgroundColor: "",
          position: "absolute",
          opacity: 1,
          background:
            "linear-gradient(to bottom, #000 30%, rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0) 100%)",
          pointerEvents: "none",
        }}
      ></div>
      {!(pathname === "/games") && (
        <div
          onClick={handleClick}
          style={{
            ...styles[`${isLandscapeMode?"L":isMobile ? "p" : "l"}_menuContainer`],
            backgroundColor: "",
          }}
        >
          {/* <img src={"/main/menu.svg"} /> */}
        </div>
      )}
      <div
        style={{
          ...styles[`${isLandscapeMode?"L":isMobile ? "p" : "l"}_pointTableContainer`],
          borderRadius: "50px",
        }}
      >
        <div
        onClick={messageFromWallet}
          style={{
            height: "90%",
            width: "20%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            left: "3%",
          }}
        >
          <img
            src={"/main/plusIcon.png"}
            style={{
              height: "83%",
              width: "100%",
              objectFit: "contain",
              position: "absolute",
              left: "0%",
              zIndex: 2,
            }}
          />
        </div>
        <div
          style={{
            height: "100%",
            width: "60%",
            backgroundColor: "",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            marginLeft: isMobile ? "10%" : "26%",
          }}
        >
          <h2
            style={{
              color: "#fff",
              fontSize: ResponsiveFontSize(isMobile, isMobile ? 12: 18),
              zIndex: 3,
              position: "relative",
              fontWeight:'700'
            }}
          >{`${
            userBalance> 0 ? userBalance.toFixed(2) : 0
          }`}</h2>
        </div>
      </div>
      
      <div onClick={onBackClick} style={styles[`${isMobile ? "p" : "l"}_backButtonContainer`]}>
        {
          <img
            src={"/main/back.png"}
           
            style={styles[`${isMobile ? "p" : "l"}_backButton`]}
          />
        }
        <h2
          style={{
            ...styles[`${isMobile ? "p" : "l"}_gameIdText`],
            fontSize: ResponsiveFontSize(isMobile, isMobile ? 12 :isLandscapeMode?24: 18),
          }}
        >
          {props.inGame
            ? `Game ID: ${props.contestId}`
            : `Hi, ${name}`}
        </h2>
      </div>
    </div>
  );
};
const styles: any = {
  p_mainContainer: {
    height: "6.573%",
    width: "100%",
    // backgroundColor: "#000000",
    position: "absolute",
    top: "0%",
    zIndex: 10,
    opacity: 1,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  l_mainContainer: {
    height: "9.573%",
    width: "100%",
    backgroundColor: "",
    position: "absolute",
    top: "0%",
    zIndex: 10,
    opacity: 1,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  p_backButtonContainer: {
    height: "100%",
    width: "29%",
    position: "absolute",
    left: "2%",
    display: "flex",
    alignItems: "center",
  },
  l_backButtonContainer: {
    height: "auto",
    width: "30%",
    position: "absolute",
    left: "2%",
    display: "flex",
    alignItems: "center",
  },
  p_gameIdText: {
    color: "#fff",
    marginLeft: "4%",
    fontWeight:'700'
  },
  l_gameIdText: {
    color: "#fff",
    marginLeft: "6%",
    fontWeight:'700'
  },
  p_backButton: {
    height: "30%",
    width: "10%",
  },
  l_backButton: {
    height: "30%",
    width: "4%",
  },
  p_joinTableContainer: {
    height: "40%",
    width: "30.6%",
    display: "flex",
    zIndex: 11,
    justifyContent: "space-between",
  },
  l_joinTableContainer: {
    height: "37%",
    width: "15%",
    display: "flex",
    justifyContent: "space-between",
    zIndex: 8,
  },
  p_joinTable: {
    height: "100%",
    width: "54.59%",
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#A19E9E",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  l_joinTable: {
    height: "100%",
    width: "54.59%",
    backgroundColor: "#000",
    borderWidth: 3,
    borderColor: "#A19E9E",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  p_pointTableContainer: {
    height: "40.1%",
    minWidth: "20.9%",
    position: "absolute",
    right: "18%",
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#A19E9E",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    paddingRight: "1%",
    paddingLeft: "1%",
  },
  l_pointTableContainer: {
    height: "43.1%",
    minWidth: "10.48%",
    position: "absolute",
    right: "7%",
    backgroundColor: "#000",
    borderWidth: 3,
    borderColor: "#A19E9E",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",

  },
  L_pointTableContainer: {
    height: "70.1%",
    minWidth: "10.48%",
    position: "absolute",
    right: "7%",
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#A19E9E",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",

  },
  p_menuContainer: {
    height: window.innerHeight * 0.0423,
    width: window.innerWidth * 0.0916,
    position: "absolute",
    right: "2%",
    top: "20%",
  },
  l_menuContainer: {
    height: window.innerHeight * 0.0692,
    width: window.innerWidth * 0.045,
    top: "10%",
    position: "absolute",
    right: "1%",
  },
  L_menuContainer: {
    height:"117%",
    width:"5.173%",
    top: "5%",
    position: "absolute",
    right: "1%",
  },
};
