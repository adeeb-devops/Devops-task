import React, { useEffect, useState, useRef, useContext } from "react";
import forwardBtn from "../assets/header/forwardBtn.svg";
import historyIcon from "../assets/header/history-icon.svg";
import statisticsIcon from "../assets/header/statistics-icon.svg";
import howToPlayIcon from "../assets/header/how-to-play-icon.svg";
import settingsIcon from "../assets/header/settings-icon.svg";
import limitsIcon from "../assets/header/limits-icon.svg";
import exitIcon from "../assets/header/exit-icon.svg";
import djikhaliProfile from "../assets/header/djikhali-profile.svg";
import { ResponsiveFontSize } from "../utils/ResponsiveFontSize";
import { Limits } from "./Limits";
import { HowToPlay } from "./HowToPlay";
import { useNavigate } from "react-router-dom";
import {
  clearSocket,
  getPlayerHistory,
  statRequest,
  disconnectSocket,
  onSounsUpdate,
  getHowToPlay
} from "../dataService";
import { Stats } from "./Stats";
import { History } from "./History";
import eventEmitter from "../eventEmitter";
import { Toggle } from "./toggle";
import { DeviceContext } from "../context/deviceContext";

export const HamburgerMenu = ({ onClose }) => {
  const navigate = useNavigate();

  const listData = [
    {
      id: 1,
      icon: historyIcon,
      text: "History",
    },
    // {
    //   id: 2,
    //   icon: statisticsIcon,
    //   text: "Statistics",
    // },
    {
      id: 3,
      icon: howToPlayIcon,
      text: "How to play",
    },
    {
      id: 4,
      icon: settingsIcon,
      text: "Settings",
    },
    {
      id: 5,
      icon: limitsIcon,
      text: "Limits",
    },
    {
      id: 6,
      icon: exitIcon,
      text: "Exit game",
    },
  ];
  const [isOpen, setIsOpen] = useState(true);

  const mainDivStyles = {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Overlay effect
    display: "flex",
    justifyContent: "flex-end",
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? "visible" : "hidden",
    transition: "opacity 0.3s ease, visibility 0.3s ease",
  };

  const { isMobile } = useContext(DeviceContext);

  const [activeIndex, setActiveIndex] = useState(2);
  const [onStatOpen, setStatOpen] = useState(false);
  const [onLimitOpen, setLimitOpen] = useState(false);
  const [statData, setStatData] = useState({});
  const [historyData, setHistoryData] = useState([]);
  const [howToPlayData, setHowToPlayData] = useState([]);
  const [onHistoryOpen, setHistoryOpen] = useState(false);
  const [onHowToPlay, setHowToPlay] = useState(false);
  const divRef = useRef(null); // Reference to the div
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [soundData,setSoundData]=useState({
    
    sound:false,
    vibration:false,
    userName:''
  })
  const [isHovered, setIsHovered] = useState('');


  let sound=useRef({
    sound:false,
    vibration:false,
    userName:''
  })

  const handleDivClick = (index) => {
    setActiveIndex(index === activeIndex ? null : index); // Toggle the div height
  };

  const onItemClick = (text) => {
   
    text!=="Settings"&&isMobile&&eventEmitter.emit('change-title',text)
    switch (text) {
      case "History":
        getPlayerHistory();
        break;
      case "Statistics":
        statRequest();
        break;
      case "How to play":
        getHowToPlay();
        setHowToPlay(true);
        break;
      case "Settings":
        // handleDivClick(3)
        break;
      case "Limits":
        setLimitOpen(true);
        break;
      case "Exit game":
        // handleExitGame();
        disconnectSocket();
        clearSocket();
        navigate("/home");
        break;
      default:
        console.warn("Unknown option:", text);
    }

    // setLimitOpen(true)
  };

  const onStatReceived = (data) => {
    setStatData(data);
    setStatOpen(true);
  };

  function convertToIST(utcString) {
    const utcDate = new Date(utcString);
    const istDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
    const day = String(istDate.getDate()).padStart(2, '0');
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const year = istDate.getFullYear();
  
    const hours = String(istDate.getHours()).padStart(2, '0');
    const minutes = String(istDate.getMinutes()).padStart(2, '0');
    const seconds = String(istDate.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  const onHistoryReceived = (data) => {
    const extractedDataArray = data.map((game) => ({
      otherData: {
        date: convertToIST(game.updated_at),
        betting_amount: game.betting_amount,
        payout_multiplier: game.payout_multiplier.toFixed(2),
        winning_amount: game.winning_amount.toFixed(2),
      },
      game_id: game.game_id,
      jackpotAmount:game.jackpot_amount

    }));

    setHistoryData(extractedDataArray);
    console.log("extracted array", extractedDataArray);
    setHistoryOpen(true);
  };
  const onHowToPlayReceived = (data) => {
    setHowToPlayData(data);
    console.log("How to play--", data);
    setHistoryOpen(true);
  };

  const onMenuClose = () => {
    setIsOpen(false);
    onClose();
  };

  const onSoundUpdated=()=>{
    const user = localStorage.getItem('user');

    if (user) {
      console.log("kjweecnbknjsc",soundData,sound);

      // Parse the string into an object
      const userObject = JSON.parse(user);
      const updatedObject={
        ...userObject,
        sound:sound.current.sound,
        vibration:sound.current.vibration
      }
      setSoundData({
        sound:sound.current.sound,
        vibration:sound.current.vibration,
        userName:soundData.userName
      })

      localStorage.setItem('user',JSON.stringify(updatedObject))
    }
  }

  useEffect(() => {
    if (divRef.current) {
      const { width, height } = divRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);
  useEffect(() => {
    eventEmitter.on("stats", onStatReceived);
    eventEmitter.on("sound-updated",onSoundUpdated);
    eventEmitter.on("playerHistory", onHistoryReceived);
    eventEmitter.on("how-to-play-data", onHowToPlayReceived);
    return(()=>{
      eventEmitter.off("stats", onStatReceived);
    eventEmitter.off("sound-updated",onSoundUpdated);
    eventEmitter.off("playerHistory", onHistoryReceived);
    eventEmitter.off("how-to-play-data", onHowToPlayReceived);
    })
  }, []);

  const updateSound=(data)=>{
  console.log('wecwnicwewfiw',)
    if(data==="sound"){
       
        onSounsUpdate(
          {
           sound:!soundData.sound,
           vibration:soundData.vibration
          }
       )

        sound.current=({
          sound:!sound.current.sound,
          vibration:sound.current.vibration,
          userName:sound.current.userName
        })
        console.log('lcnwlnlfndenwwd',sound.current)
    }else{
      sound.current=({
        sound:sound.current.sound,
        vibration:!sound.current.vibration,
        userName:sound.current.userName
      })
      onSounsUpdate(
        {
         sound:soundData.sound,
         vibration:!soundData.vibration
        }
     )
    }
      
  }

  useEffect(()=>{
    const user = localStorage.getItem('user');

    if (user) {
      // Parse the string into an object
      const userObject = JSON.parse(user);
    
      setSoundData({
       sound:userObject.sound,
       vibration:userObject.vibration,
       userName:userObject.username
      })
      sound.current={
        sound:userObject.sound,
        vibration:userObject.vibration,
        userName:userObject.username
       }
     
    
      // console.log('Sound:', sound); // true or false
      // console.log('Vibration:', vibration); // true or false
    } else {
      console.log('User object not found in local storage');
    }
  },[])

  return (
    <div style={mainDivStyles} onClick={onMenuClose}>
      <div style={{...styles[`${isMobile ? "p" : "l"}_subContainer`],    transform: isOpen ? "translateX(0)" : "translateX(100%)",
}} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            height: "18%",
            width: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              height: "67%",
              // width: "35%",
              aspectRatio:1/1,
              marginTop: "1%",
              backgroundColor: "#fff",
              borderRadius: "50%",
              marginLeft: "5%",
            }}
          >
            <img
              src={djikhaliProfile}
              style={{ height: "95%", width: "100%", objectFit: "contain" }}
            />
          </div>
          <h2
            style={{
              color: "#FFF",
              textAlign: "center",
              fontFamily: "Montserrat",
              fontSize: ResponsiveFontSize(false, 40),
              fontStyle: "normal",
              fontWeight: 700,
              marginTop: "1%",
              marginLeft: "5%",
            }}
          >
            {soundData.userName}
          </h2>
        </div>
        <div style={{ height: "82%", width: "100%", position: "absolute" }}>
          {listData.map((item, index) => {
            const topValue =
              listData
                .slice(0, index) // Get all previous items
                .reduce((acc, _, i) => acc + (activeIndex === i ? 28 : 14), 0) +
              "%";

            return (
              <div
                ref={divRef}
                onClick={() => {
                  onItemClick(item.text);
                }}
                key={index}
                onMouseEnter={() => setIsHovered(item.id)}
                onMouseLeave={() => setIsHovered("")}
                style={{
                  height: activeIndex === index ? "28%" : "14%",
                  width: "100%",
                  position: "absolute",
                  top: topValue, // Dynamic top calculation
                  // backgroundColor: "red",
                  transition: "height 0.3s ease, top 0.3s ease", // Smooth top transition
                  borderTopWidth: 2,
                  borderColor: "rgba(255, 255, 255, 0.50)",
                  display: "flex",
                  alignItems: activeIndex === index ? "flex-start" : "center",
                  background:item.id!==4&&isHovered===item.id?'#5B5E64':"",
                  opacity:item.id!==4&&isHovered===item.id?0.8:1,
                }}
              >
                <>
                  <div
                    style={{
                      height: activeIndex === index ? "35%" : "70%",
                      width: "60%",
                      marginLeft: "5%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={item.icon}
                      style={{ height: "60%", width: "20%" }}
                    />
                    <h2
                      style={{
                        color: "#FFF",
                        textAlign: "center",
                        fontFamily: "Montserrat",
                        fontSize: ResponsiveFontSize(false, 30),
                        fontStyle: "normal",
                        fontWeight: 600,
                        marginLeft: "8%",
                      }}
                    >
                      {item.text}
                    </h2>
                  </div>
                  <div
                    style={{
                      height: activeIndex === index ? "35%" : "70%",
                      width: "20%",
                      marginLeft: "12%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                   { item.id!==4&&<img
                      src={forwardBtn}
                      style={{ height: "40%", width: "70%" }}
                    />}
                  </div>
                </>
                {activeIndex === index && (
                  <div
                    style={{
                      height: "61%",
                      width: "100%",
                      position: "absolute",
                      bottom: 0,
                    }}
                  >
                    <div
                      style={{
                        height: "45%",
                        width: "100%",
                        position: "absolute",
                        // backgroundColor: "green",
                        display:'flex',
                        justifyContent:'space-between',
                        alignItems:'center'
                      }}
                    >
                      <h2
                        style={{
                          color: "#FFF",
                          // textAlign: "center",
                          fontFamily: "Montserrat",
                          fontSize: ResponsiveFontSize(false, 32),
                          fontStyle: "normal",
                          position:'absolute',
                          left:'21%',
                          fontWeight: 700,
                          // marginTop: "1%",
                          // marginLeft: "5%",
                        }}
                      >
                        Sound
                      </h2>
                      <Toggle data={soundData.sound} type={"sound"} onToggle={updateSound} />
                    </div>
                    <div 
                      style={{
                        height: "45%",
                        width: "100%",
                        position: "absolute",
                        display:'flex',
                        bottom:'0%',
                        justifyContent:'space-between',
                        alignItems:'center'
                      }}
                    >
                      <h2
                        style={{
                          color: "#FFF",
                          // textAlign: "center",
                          fontFamily: "Montserrat",
                          fontSize: ResponsiveFontSize(false, 32),
                          fontStyle: "normal",
                          position:'absolute',
                          left:'21%',
                          fontWeight: 700,
                          // marginTop: "1%",
                          // marginLeft: "5%",
                        }}
                      >
                        Vibration
                      </h2>
                      <Toggle data={soundData.vibration} type={"vibration"} onToggle={updateSound} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {onLimitOpen && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            display: "flex",
            backgroundColor:isMobile?'#1c1f32':'',
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()} // Prevent closing on click inside Stats
        >
          {" "}
          <Limits
            onClose={() => {
              // console.log('text',text)
              setStatOpen(false)
              setHistoryOpen(false)
              setHowToPlay(false)
              setLimitOpen(false);
            }}
          />
        </div>
      )}
      {onStatOpen && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            backgroundColor:isMobile?'#1c1f32':'',
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()} // Prevent closing on click inside Stats
        >
          <Stats statData={statData} onClose={() => setStatOpen(false)} />
        </div>
      )}
      {onHistoryOpen && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            backgroundColor:isMobile?'#1c1f32':'',
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()} // Prevent closing on click inside Stats
        >
          <History
            data={historyData}
            onClose={() => {
              // console.log('text',text)
              setLimitOpen(false);
              setStatOpen(false)
              setHowToPlay(false)
              setHistoryOpen(false);
            }}
          />
        </div>
      )}
      {onHowToPlay && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            backgroundColor:isMobile?'#1c1f32':'',
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()} // Prevent closing on click inside Stats
        >
          <HowToPlay
            data={howToPlayData}
            onClose={() => {
              // console.log('text',text)
              setLimitOpen(false);
              setStatOpen(false)
              setHistoryOpen(false)
              setHowToPlay(false);
            }}
          />
        </div>
      )}
    </div>
  );
};


const styles={
  p_subContainer:{
    height: "47%",
    width: "55.6%",
    borderRadius: 8,
    border: "2px solid #3C4057",
    backgroundColor: "#23263A",
    // transform: isOpen ? "translateX(0)" : "translateX(100%)",
    transition: "transform 0.3s ease",
  },
  l_subContainer:{
    height: "99%",
    width: "28.6%",
    borderRadius: 8,
    border: "2px solid #3C4057",
    backgroundColor: "#23263A",
    transition: "transform 0.3s ease",
  }
}
