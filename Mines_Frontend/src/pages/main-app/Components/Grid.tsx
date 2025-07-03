import React, { useState, useEffect, useRef, useContext } from "react";
import "./grid.css";
import eventEmitter from "../eventEmitter";
import bomb from "../game/assets/images/bomb_glow.png";
import { ResponsiveFontSize } from "../utils/ResponsiveFontSize";
import { onAutoClicked } from "../dataService";
import { DeviceContext } from "../context/deviceContext";
import { payoutData } from "../utils/payouts";
import { playSound } from "./AudioPlayer";
import { JackpotPopup } from "./jackpotPopup";

export const Grid = ({
  gridSize,
  onIndexClick,
  gameMode,
  onAutoClicked,
  mines,
}) => {
  const [currentGridSize, setCurrentGridSize] = useState(gridSize);
  const [animate, setAnimate] = useState(false);
  const [clickedIndex, setClickedIndex] = useState(null);
  const [minesCount, setMinesCount] = useState(mines);
  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const [startManual, setStartManual] = useState(false);
  const [minesData, setMinesData] = useState([]);
  const [manualBoxes, setManualBoxes] = useState([]);
  const [diamonds, setDiamonds] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [showJackpot,setShowJackpot]=useState({
    alreadyShown:false,
    show:false
  })
  const [showPopup, setShowPopup] = useState(false);
  const [multipler, setMultiplier] = useState<any>({});
  const [lowBalance, setLowBalance] = useState(false);
  const [jackpotBoxes, setJackpotBoxes] = useState([]);
  const [error, setError] = useState("");
  const [showMulti, setShowMulti] = useState(false);
  const [gameType, setGameType] = useState(gameMode);
  const [stopClicking,setStopClicking]=useState(false)
  let autoBoxes = useRef([]);
  const { isMobile } = useContext(DeviceContext);
  const currentIndex = useRef<any>(0);

  const [reset, setReset] = useState(true);
  const [autoBetProgress, setAutoBetProgress] = useState(false);
  const items = useRef<any>([]);
  const [currentItems, setCurrentItems] = useState([]);
  const boxSize = {
    5: "20%",
    7: "14.2857142857%",
    9: "11.1111111111%",
  };
  const gridSizes = {
    5: {
      height: "87.5%",
      width: "88.25%",
    },
    7: {
      height: "87.5%",
      width: "88.25%",
    },
    9: {
      height: "80%",
      width: "80.7%",
    },
  };

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // Skip the effect on the first render
    }
    setShowMulti(false);
    setSelectedBoxes([]);
    setManualBoxes([]);

    setAnimate(true);
    setReset(true);
    setShowMulti(false);
    setManualBoxes([]);
    autoBoxes.current = [];
    setAutoBetProgress(false);
    setMinesData([]);
    setDiamonds([]);
    setShowPopup(false);
    setMultiplier({});
    setGameOver(false);
    setJackpotBoxes([]);
    setSelectedBoxes([]);
    const timeout = setTimeout(() => {
      setAnimate(false);
      setCurrentGridSize(gridSize);
    }, 600); // Set animation time to 1 second

    return () => clearTimeout(timeout);
  }, [gridSize]);
  const handleClick = (index: any) => {
    setHoveredIndex(null);
    if(stopClicking){
      return
    }
    if (gameOver || autoBetProgress) {
      return;
    }

    if (!startManual && gameMode === "manual" && isMobile) {
      setClickedIndex(index);
      setTimeout(() => setClickedIndex(null), 500);
      return;
    }
    if (gameType === "") {
      setClickedIndex(index);
      setTimeout(() => setClickedIndex(null), 500);
      return;
    }
    if (manualBoxes.includes(index)) {
      return;
    }
    if (gameType === "manual") {
      setClickedIndex(index);
      onIndexClick(index);
      setStopClicking(true)
      setManualBoxes((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
      setTimeout(() => setClickedIndex(null), 500);
    } else {
      setClickedIndex(index);
      if (
        selectedBoxes.length < gridSize * gridSize - minesCount ||
        selectedBoxes.includes(index)
      ) {
        setSelectedBoxes((prev) => {
          const updatedBoxes = prev.includes(index)
            ? prev.filter((i) => i !== index)
            : [...prev, index];
          autoBoxes.current = updatedBoxes;
          eventEmitter.emit("card-selected", updatedBoxes); // Store the updated value in the ref
          return updatedBoxes; // Return the updated state
        });
      }
    }
  };

  useEffect(() => {
    if (mines !== minesCount) {
      setSelectedBoxes([]);
      autoBoxes.current = [];
    }
    setMinesCount(mines);
  }, [mines]);

  useEffect(() => {
    setGameType(gameMode);
    setSelectedBoxes([]);
    autoBoxes.current = [];
    // setManualBoxes([])
    setManualBoxes([]);
    setMinesData([]);
    setShowMulti(false);
    setDiamonds([]);
    setJackpotBoxes([]);
    setShowPopup(false);
    setMultiplier({});
    setGameOver(false);
  }, [gameMode]);

  const onTileOpened = (data: any) => {
    playSound("diamond");
    const user = localStorage.getItem('user');

    if (user) {
      // Parse the string into an object
      const userObject = JSON.parse(user);
      if(navigator&&userObject.vibration){
        navigator.vibrate([500])
  
      }
    }
    console.log('efnwnesnfknfew',data)
   
    setMinesData(data.data.gameState.state.mines);
    const rounds = data.data.gameState.state.rounds;
    const fieldValues = rounds.map((round: any) => round.field);
    setManualBoxes(fieldValues);
    fieldValues.length >=0 && nextItems();
    setDiamonds(fieldValues);
    setStopClicking(false)
    setJackpotBoxes(data.data.gameState.state.jackpot);
    if(data.data.gameState.state.jackpot.length>0&&showJackpot.alreadyShown==false){
      setShowJackpot({
       alreadyShown:false,
       show:true
      })
   }

  };

  const setMultiplierItems = (data:any) => {
    console.log('mines count andi',data,gridSize)
    items.current=Object?.values(payoutData.data[gridSize * gridSize][data]);
        console.log('mines count andi',items.current)
  };

  const nextItems = () => {
    const totalItems = items.current.length; // Get total count
    //  currentIndex.current = Math.min(currentIndex.current, totalItems - 5);
    const visibleItems = items.current.slice(currentIndex.current, currentIndex.current + 5);
    setCurrentItems(visibleItems);
    currentIndex.current=currentIndex.current+1
    setShowMulti(true);
  };

  useEffect(() => {
    if (mines !== minesCount) {
      // setMultiplierItems();
    }
    setCurrentItems([])
    setShowMulti(false);
  }, [mines]);

  const onGameOver = (data: any) => {
    setShowMulti(false)
    if (data.message === "Last Diamond Opened") {
      playSound("diamond");
      setStopClicking(false)
      currentIndex.current=0
      setGameType("");
      setStartManual(false);
      items.current=[]
      setGameOver(true);
      setMinesData(data.gameState.state.mines);
      setJackpotBoxes(data.gameState.state.jackpot);
      setMultiplier({
        multiplier: data.gameState.payout,
        winAmount: data.gameState.amount * Number(data.gameState.payout),
      });
      setCurrentItems([])
      if (data.winAmount !== 0) {
        setShowPopup(true);
      }
      setShowJackpot({
        alreadyShown:false,
        show:false
      })
    } else {
      playSound("mine");
      setGameType("");
      setStopClicking(false)
      currentIndex.current=0
      setStartManual(false);
      items.current=[]
      setGameOver(true);
      setMinesData(data.gameState.state.mines);
      setJackpotBoxes(data.gameState.state.jackpot);
    }
  };

  const onCashoutReceived = (data: any) => {
    setGameType("");
    setStartManual(false);
    setStopClicking(false)
    currentIndex.current=0
    setMultiplier({
      multiplier: data.gameState.payout,
      winAmount: data.gameState.amount*Number(data.gameState.payout),
    });
    setShowJackpot({
      alreadyShown:false,
      show:false
    })
    items.current=[]
    setCurrentItems([])
    if (data.winAmount !== 0) {
      setShowPopup(true);
    }
  };

  const autoClick = (data:any) => {
    setMultiplierItems(data)
    console.log("onevoevrvevevre",data)

    onAutoClicked(autoBoxes);
  };

  const onAutoBetReceived = (data: any) => {
    
    setCurrentItems([
      items.current[
        data.state.selectedTiles.length-1
      ],
    ]);

    setShowMulti(true);
    setReset(true);
    setAutoBetProgress(true);
    setManualBoxes(data.state.selectedTiles);
    autoBoxes.current = data.state.selectedTiles;
    setMinesData(data.state.mines);
    setJackpotBoxes(data.state.jackpot);
    data.payout !== 0 && playSound("diamond");
    const hasJackpotTile = data.state.selectedTiles.some(tile => data.state.jackpot.includes(tile));

    if(data.state.jackpot.length>0&&hasJackpotTile&&showJackpot.alreadyShown==false){
      setShowJackpot({
       alreadyShown:false,
       show:true
      })
   }else if (data.payout !== 0) {
    setMultiplier({
      multiplier: data.payout,
      winAmount: Number(data.payout) * Number(data.amount),
    });
   
    setShowPopup(true);
  }
  
    
    setGameOver(true);

    setTimeout(() => {
      setReset(false);
      setMinesData([]);
      setDiamonds([]);
      setShowPopup(false);
      setJackpotBoxes([]);
      setMultiplier({});
      autoBoxes.current = [];
      setGameOver(false);
      // setSelectedBoxes([])
        setShowJackpot({
         alreadyShown:true,
         show:false
        })
    }, 800);
  };

  const onAutoComplete = () => {
    setReset(true);
    setShowMulti(false);
    setManualBoxes([]);
    autoBoxes.current = [];
    setAutoBetProgress(false);
    setMinesData([]);
    setDiamonds([]);
    setShowPopup(false);
    setMultiplier({});
    setGameOver(false);
    setJackpotBoxes([]);
    setSelectedBoxes([]);
    setShowJackpot({
      alreadyShown:false,
      show:false
     })
  };

  const onLowBalance = (data: any) => {
    setError(data);
    setLowBalance(true);
    setTimeout(() => {
      setLowBalance(false);
    }, 2000);
  };
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleMouseEnter = (index) => {
    if (gameOver || autoBetProgress) {
      return;
    }

    if (manualBoxes.includes(index)) {
      return;
    }
    setHoveredIndex(index + 1);
  };
  const handleMouseLeave = () => setHoveredIndex(null);

  const leftValues = [0, 21.36, 42.72, 64.08, 85.44];

  useEffect(() => {
    eventEmitter.on("tile-opened", onTileOpened);
    eventEmitter.on("game-over", onGameOver);
    eventEmitter.on("cashout-balance", onCashoutReceived);
    eventEmitter.on("auto-bet-progress", onAutoBetReceived);
    eventEmitter.on("auto-bet-complete", onAutoComplete);
    eventEmitter.on("auto-bet-stopped", onAutoComplete);
    eventEmitter.on("select-auto", autoClick);
    eventEmitter.on("start-select", (data) => {
      setMultiplierItems(data)
      setStartManual(true);
      setShowJackpot({
        alreadyShown:false,
        show:false
      })
    });
    eventEmitter.on("game-changes", (data) => {
      setMultiplierItems(data)
      console.log("hellooooooo");
      setGameType(gameMode);
      setShowMulti(false);
      setManualBoxes([]);
      setStopClicking(false)
      setMinesData([]);
      setDiamonds([]);
      setShowPopup(false);
      setMultiplier({});
      setGameOver(false);
      setJackpotBoxes([]);
      setShowJackpot({
        alreadyShown:false,
        show:false
      })
    });
    eventEmitter.on("low-balance", onLowBalance);

    return () => {
      eventEmitter.off("tile-opened", onTileOpened);
      eventEmitter.off("game-over", onGameOver);
      eventEmitter.off("cashout-balance", onCashoutReceived);
      eventEmitter.off("select-auto", autoClick);
      eventEmitter.off("start-select", autoClick);
      eventEmitter.off("game-changes", autoClick);
      eventEmitter.off("low-balance", onLowBalance);


    };
  }, [selectedBoxes]);

  return (
    <div style={styles[`${isMobile ? "p" : "l"}_mainContainer`]}>
      <div style={styles[`${isMobile ? "p" : "l"}_subContainer`]}>
        {Array.from({ length: currentGridSize * currentGridSize }).map(
          (_, index) => (
            <div
              key={index}
              className={`${animate ? "box-shrink" : ""}`}
              style={{
                height: boxSize[currentGridSize],
                width: boxSize[currentGridSize],
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                style={{
                  height: gridSizes[currentGridSize]["height"],
                  width: gridSizes[currentGridSize]["width"],
                  borderRadius: gridSize === 5 ? "12px" : 6,
                  borderColor: autoBetProgress
                    ? minesData.includes(index + 1) &&
                      manualBoxes.includes(index + 1)
                      ? "red"
                      : manualBoxes.includes(index + 1)
                      ? "#00A9CF"
                      : ""
                    : gameOver
                    ? manualBoxes.includes(index + 1)
                      ? minesData.includes(index + 1)
                        ? "red"
                        : "#00A9CF"
                      : "green"
                    : selectedBoxes.includes(index + 1)
                    ? "#00A9CF"
                    : "",
                  borderWidth:
                    autoBetProgress && manualBoxes.includes(index + 1)
                      ? 4
                      : gameOver && manualBoxes.includes(index + 1)
                      ? 4
                      : selectedBoxes.includes(index + 1)
                      ? 4
                      : 0,
                  background:
                    !gameOver && hoveredIndex === index + 1
                      ? "#56586B"
                      : autoBetProgress
                      ? "#1C1F32"
                      : gameOver ||
                        minesData.includes(index + 1) ||
                        diamonds.includes(index + 1)
                      ? "#1C1F32"
                      : autoBoxes.current.includes(index + 1)
                      ? "#1C1F32"
                      : "#31354C",
                  boxShadow:
                    gameOver ||
                    manualBoxes.includes(index + 1) ||
                    selectedBoxes.includes(index + 1)
                      ? ""
                      : `0px 4px 4px 0px rgba(0, 0, 0, 0.25), 0px ${
                          isMobile ? -4 : -9
                        }px 0px 0px rgba(71, 74, 97, 0.50) inset`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                }}
                className={`${
                  clickedIndex === index + 1 || hoveredIndex === index + 1
                    ? "box-click"
                    : ""
                }`}
                onClick={() => handleClick(index + 1)}
              >
                {!gameOver && diamonds.includes(index + 1) && (
                  <img
                    className="scale-animation"
                    src={
                      jackpotBoxes.includes(index + 1)
                        ? "/game/jackpot_glow.png"
                        : isMobile
                        ? "/game/mobileDiamond.png"
                        : "/game/dimond_glow.png"
                    }
                    style={{ height: "100%", width: "100%" }}
                  />
                )}
                {gameOver &&
                  (minesData.includes(index + 1) ? (
                    <img
                      src={
                        manualBoxes.includes(index + 1)
                          ? "/game/bomb_glow.png"
                          : "/game/bomb_fade.png"
                      }
                      className={"scale-animation"}
                      style={{
                        height: manualBoxes.includes(index + 1) ? "85%" : "65%",
                        width: manualBoxes.includes(index + 1) ? "85%" : "65%",
                      }}
                    />
                  ) : manualBoxes.includes(index + 1) ? (
                    <img
                      src={
                        jackpotBoxes.includes(index + 1)
                          ? "/game/jackpot_glow.png"
                          : isMobile
                          ? "/game/mobileDiamond.png"
                          : "/game/dimond_glow.png"
                      }
                      className="scale-animation"
                      style={{ height: "85%", width: "85%" }}
                    />
                  ) : (
                    <img
                      src={
                        jackpotBoxes.includes(index + 1)
                          ? "/game/jackpot_fade.png"
                          : "/game/dimond_fade.png"
                      }
                      className="scale-animation"
                      style={{ height: "65%", width: "65%" }}
                    />
                  ))}
                {reset === false && gameType === "auto" && autoBetProgress && (
                  <div
                    className="bg-scale"
                    style={{
                      height: "100%",
                      width: "100%",
                      backgroundColor: "#31354C",
                      position: "relative",
                    }}
                  ></div>
                )}
              </div>
            </div>
          )
        )}
        {showJackpot.show&&showJackpot.alreadyShown==false&&<JackpotPopup onClose={()=>{
          console.log('dl sldlvlvsl ')
           setShowJackpot({
            alreadyShown:true,
            show:false
           })
        }}/>}

        {showPopup && (
          <div
            style={{
              height: "26%",
              minWidth: "33%",
              backgroundColor: "#1C1F32",
              position: "absolute",
              border: "6px solid #585858",
              borderRadius: 8,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              paddingRight: "3%",
              paddingLeft: "3%",
              transform: "scale(0)", // Start with a scale of 0
              animation: "scaleIn 0.5s ease forwards",
            }}
          >
            <h2
              style={{
                color: "#00FF2F",
                textAlign: "center",
                fontFamily: "Montserrat",
                fontSize: ResponsiveFontSize(false, 44),
                fontStyle: "normal",
                fontWeight: 700,
                lineHeight: "normal",
              }}
            >{`${Number(multipler.multiplier).toFixed(2)}x`}</h2>
            <h2
              style={{
                color: "#FFF",
                textAlign: "center",
                fontFamily: "Montserrat",
                fontSize: ResponsiveFontSize(false, 26),
                fontStyle: "normal",
                fontWeight: 700,
                lineHeight: "normal",
                marginTop: "8%",
              }}
            >{`You win - ${multipler.winAmount.toFixed(2)}`}</h2>
          </div>
        )}
        {lowBalance && (
          <div
            style={{
              height: "26%",
              width: "60%",
              backgroundColor: "#1C1F32",
              position: "absolute",
              border: "6px solid #585858",
              borderRadius: 8,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              transform: "scale(0)", // Start with a scale of 0
              animation: "scaleIn 0.5s ease forwards",
            }}
          >
            <h2
              style={{
                color: "#FF0008",
                textAlign: "center",
                fontFamily: "Montserrat",
                fontSize: ResponsiveFontSize(false, 44),
                fontStyle: "normal",
                fontWeight: 700,
                lineHeight: "normal",
              }}
            >
              {error}
            </h2>
          </div>
        )}
      </div>
      {showMulti && (
        <div style={styles[`${isMobile ? "p" : "l"}_multiStyles`]}>
          {currentItems.map((item, index) => {
            return (
              <div
                key={index}
                style={{
                  ...styles[
                    `${isMobile ? "p" : "l"}_${
                      index == 0 ? "" : "non"
                    }selectedIndex`
                  ],
                  height: "76%",
                  width: "15.4%",
                  bottom: 0,
                  position: "absolute",
                  left: `${leftValues[index]}%`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <h2
                  style={{
                    color: "#FFF",
                    textAlign: "center",
                    fontFamily: "Montserrat",
                    fontSize: ResponsiveFontSize(false, 18),
                    fontStyle: "normal",
                    fontWeight: 700,
                    lineHeight: "normal",
                    // marginTop: "8%",
                  }}
                >
                  {`${Math.floor(Number(item) * 100) / 100}x`}
                </h2>
                {index == 0 && (
                  <div
                    style={{
                      height: "156%",
                      width: isMobile ? "68%" : "50%",
                      position: "absolute",
                      top: "-38%",
                      right: isMobile ? "-47%" : "-30%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={"/game/bomb_glow.png"}
                      style={{ height: "100%", width: "100%" }}
                    />
                    <h2
                      style={{
                        color: "#FFF",
                        textAlign: "center",
                        fontFamily: "Montserrat",
                        fontSize: ResponsiveFontSize(false, 16),
                        fontStyle: "normal",
                        fontWeight: 700,
                        position: "absolute",
                        top: "46%",
                        marginLeft: String(mines).length == 1 ? "28%" : "20%",
                        lineHeight: "normal",
                        // marginTop: "8%",
                      }}
                    >
                      {mines}
                    </h2>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles: any = {
  p_mainContainer: {
    height: "51.1%",
    width: "95.2%",
    position: "absolute",
    left: "2.4%",
    flexWrap: "wrap",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 4,
  },
  l_mainContainer: {
    height: "99.3%",
    width: "46.3%",
    position: "absolute",
    left: "27%",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },
  p_subContainer: {
    height: "90.4%",
    width: "100%",
    top: 0,
    backgroundColor: "#23263A",
    position: "absolute",
    borderRadius: 8,
    // left: "27%",
    flexWrap: "wrap",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },
  l_subContainer: {
    height: "92.9%",
    width: "100%",
    top: 0,
    backgroundColor: "#23263A",
    position: "absolute",
    // left: "27%",
    borderRadius: 8,
    flexWrap: "wrap",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },
  p_selectedIndex: {
    borderRadius: "4px",
    border: "3px solid #00A9CF",
    background: "#1C1F32",
    boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
  },
  l_selectedIndex: {
    borderRadius: "4px",
    border: "6px solid #00A9CF",
    background: "#1C1F32",
    boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
  },
  p_nonselectedIndex: {
    borderRadius: "4px",
    border: "3px solid #585858",
    background: "#31354C",
    boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
  },
  l_nonselectedIndex: {
    borderRadius: "4px",
    border: "6px solid #585858",
    background: "#31354C",
    boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
  },
  p_multiStyles: {
    height: "8.9%",
    width: "98%",
    position: "absolute",
    bottom: "0%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  l_multiStyles: {
    height: "6.9%",
    width: "99.2%",
    position: "absolute",
    bottom: "0%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
};
