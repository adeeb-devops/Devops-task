import React, { useEffect, useState, useContext, useRef } from "react";
import { MyContext } from "../context/context";
import "./button.css";
import eventEmitter from "../eventEmitter";
import { ResponsiveFontSize } from "../utils/ResponsiveFontSize";
import { DeviceContext } from "../context/deviceContext";
import { PlusMinus } from "../../main-app/Components/plusMinus";
import { PlusMinusMines } from "../../main-app/Components/plusMinusMines";

import { BetAmountComp } from "../../main-app/Components/BetAmount";
import { ProfitLossComp } from "../../main-app/Components/ProfitLoss";
import { stopAutoBet } from "../dataService";
import { el } from "date-fns/locale";

const BettingMenuMobile = ({
  menuName,
  betAmount,
  setBetAmount,
  gridSize,
  setGridSize,
  minesCount,
  setMinesCount,
  onProfitUpdate,
  onLossUpdate,
  numberOfBets,
  gameMode,
  setNumberOfBets,
  stopOnProfit,
  stopOnLoss,
  setGameMode,
  disableInputs,
  onCashout,
  canCashOut,
  setCanCashOut,
  setDisableInputs,
  onBetClick,
  showPopup
}) => {
  const { isMobile } = useContext(DeviceContext);
  const containerRef = useRef(null); // Reference for your container

  const [winAmount, setWinAmount] = useState(0);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [isAutoBetEnabled, setIsAutoBetEnabled] = useState(false);
  const [isAutoBetActive, setIsAutoBetActive] = useState(false);
  const [isBetPlaced, setIsBetPlaced] = useState(false);
  const [isTileOpened, setTileOpened] = useState(false);
  const [clickedButton, setClickedButton] = useState(null);
  const [sizes,setSizes]=useState([])
  const [gameType, setGameType] = useState("manual");
  const handleBetAmountChange = (e) => {
    if (!disableInputs) if (!/^\d*$/.test(e.target.value)) return;
    setBetAmount(e.target.value);
  };

  const handleHalf = () => {
    if (isBetPlaced || isAutoBetActive) {
      return;
    }
    console.log("isAkjdnbs", isAutoBetActive, isBetPlaced);
    setBetAmount(betAmount / 2);
  };

  const handleDouble = () => {
    if (isBetPlaced || isAutoBetActive) {
      return;
    }
    setBetAmount(betAmount * 2);
  };

  const handleGridSizeChange = (increment) => {
    const gridSizes = sizes
    if (disableInputs) return;
    if (selectedTiles.length > 0 || isBetPlaced) {
      return;
    }
    if (!isAutoBetActive) {
      const currentIndex = gridSizes.indexOf(gridSize);
      let newIndex = currentIndex + increment;
      if (newIndex < 0) newIndex = 0;
      if (newIndex >= gridSizes.length) newIndex = gridSizes.length - 1;
      setGridSize(gridSizes[newIndex]);
      setMinesCount(1);
    }
  };

  const handleBetClick = (buttonId) => {

    eventEmitter.emit("game-changes",minesCount);
    if (selectedTiles.length > 0) {
      return;
    }
    eventEmitter.emit("start-select", minesCount);
    setClickedButton(1);
    setTimeout(() => {
      setClickedButton(null);
    }, 400);
    setGameMode("manual");
    setSelectedTiles([]);
    setIsAutoBetActive(false);
    onBetClick();
  };

  const handleCashOut = () => {
    setClickedButton(1);
    onCashout();
    setIsBetPlaced(false);
    // setShowPopup(true);
    setDisableInputs(false);
    setCanCashOut(false);
  };

  const onTileOpened = (data) => {
    setTileOpened(true);
    setWinAmount(
      Number(data.data.gameState.amount) * Number(data.data.gameState.payout)
    );
  };

  const onGameOver = (data) => {
    setWinAmount(0);
    setIsBetPlaced(false);
    setTileOpened(false);
  };

  const handleAutoBet = () => {
    if (containerRef.current) {
      // Scroll the container to the top
      containerRef.current.scrollTop = 0;
    }
    if(betAmount===""||betAmount<=0){
        showPopup()
        // setGameType('')
        // stopAutoBet()
        setIsAutoBetActive(false);
        setDisableInputs(false);
        setSelectedTiles([]);
        setIsAutoBetEnabled(false);        return
    }
    eventEmitter.emit("select-auto",minesCount);
  };

  const handleStopAutoBet = () => {
    stopAutoBet();
    setIsAutoBetActive(false);
    setDisableInputs(false);
    setSelectedTiles([]);
    setIsAutoBetEnabled(false);
  };

  useEffect(() => {
    let maxMines = 24;
    if (gridSize === 7) maxMines = 48;
    if (gridSize === 9) maxMines = 80;

    // setMinesCount();
  }, [gridSize, setMinesCount]);

  const handleSelectCardClick = () => {
    setClickedButton(2);
    setTimeout(() => {
      setClickedButton(null);
    }, 400);
    if (isBetPlaced) {
      return;
    }
    setGameMode("auto");
  };

  const onCardSelected = (data) => {
    setSelectedTiles(data);
  };

  const onAutoBetReceived = () => {
    setIsAutoBetActive(true);
  };

  const onAutoComplete = () => {
    setClickedButton(2);
    setTimeout(() => {
      setClickedButton(null);
    }, 400);
    setIsAutoBetActive(false);
    setSelectedTiles([]);
    setDisableInputs(false);
    setSelectedTiles([]);
    setIsAutoBetEnabled(false);
  };

  const onProfit = (data) => {
    onProfitUpdate(data);
  };

  const onLoss = (data) => {
    onLossUpdate(data);
  };

  const onNumberUpdate = (data) => {
    const parsedValue = parseInt(data);

    if (!isNaN(parsedValue)) {
      setNumberOfBets(Math.max(0, parsedValue));
    } else {
      setNumberOfBets("");
    }
  };

  const onLowBalance = () => {
    setIsBetPlaced(false);
  };

  useEffect(() => {
    const storedData = sessionStorage.getItem("contestData");

    if (storedData) {
        try {
            const contestData = JSON.parse(storedData);
            if (contestData.grid_options && Array.isArray(contestData.grid_options)) {
                const firstChars = contestData.grid_options.map(item => {
                    const firstChar = item.grid_type?.charAt(0) || "";
                    return isNaN(firstChar) ? firstChar : Number(firstChar);
                });
    
                setSizes(firstChars);
            } else {
                console.log("grid_options is missing or not an array.");
            }
        } catch (error) {
            console.error("Error parsing contestData:", error);
        }
    } else {
        console.log("No contestData found in sessionStorage.");
    }
    eventEmitter.on("card-selected", onCardSelected);
    eventEmitter.on("auto-bet-progress", onAutoBetReceived);
    eventEmitter.on("auto-bet-complete", onAutoComplete);
    eventEmitter.on("auto-bet-stopped", onAutoComplete);
    eventEmitter.on("tile-opened", onTileOpened);
    eventEmitter.on("game-over", onGameOver);
    eventEmitter.on("low-balance", onLowBalance);
    eventEmitter.on("cashout-balance", () => {
      setWinAmount(0);
      setIsBetPlaced(false);
      setTileOpened(false);
    });

    eventEmitter.on("bet-placed", () => {
      setIsBetPlaced(true);
    });
    return () => {
      eventEmitter.off("tile-opened");
      eventEmitter.off("game-over");
      eventEmitter.off("card-selected");
      eventEmitter.off("auto-bet-progress");
      eventEmitter.off("auto-bet-complete");
    };
  }, []);

  useEffect(() => {
    if (gameType === "manual") {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = "auto"; // Enable scrolling
    }

    // Cleanup to reset scrolling when the component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [gameType]);

  const autoStyles = {
    backgroundColor: "#31354C",
    width: "95%",
    height: "71.2%",
    position: "absolute",
    left: "2.5%",
    borderRadius: 4,
    display: "flex",
    justifyContent: "center",
    top: "52%",
  };

  const manualStyles = {
    backgroundColor: "#31354C",
    width: "95%",
    height: "44.4%",
    position: "absolute",
    left: "2.5%",
    borderRadius: 4,
    display: "flex",
    justifyContent: "center",
    top: "52%",
    overFlow: "hidden",
  };

  const [selected, setSelected] = useState(true);

  const toggleSelection = () => {
    if (isBetPlaced || isAutoBetActive || selectedTiles.length > 0) {
      return;
    }
    setSelected((prev) => !prev);
    console.log("gameMode", gameMode);
    setGameMode(gameMode === "auto" ? "manual" : "auto");
    // eventEmitter.emit('game-changes',gameType==="auto"?"manual":'auto')
    setGameType(gameType === "auto" ? "manual" : "auto");
  };

  const minesUpdateManual = (e) => {
    console.log("mines Manual", e);
    if (selectedTiles.length > 0 || isBetPlaced) {
      return;
    }
    if (isAutoBetActive) {
      return;
    }
    setMinesCount(e);
  };
  console.log("gamerMode----->", gameMode);
  return (
    <div
      ref={containerRef}
      style={gameType === "manual" ? manualStyles : autoStyles}
    >
      <div
        style={{
          height: gameType === "manual" ? "12.7%" : "7.91%",
          width: "92.7%",
          backgroundColor: "#1C1F32",
          position: "absolute",
          top: gameType === "auto" ? "3%" : "4.9%",
          borderRadius: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            height: "77%",
            width: "48%",
            backgroundColor: "#31354C",
            position: "absolute",
            borderRadius: 4,
            left: selected ? "2%" : "50%",
            transition: "left 0.5s ease",
          }}
        ></div>

        <div
          onClick={() => !selected && toggleSelection()}
          style={{
            height: "100%",
            width: "50%",
            zIndex: 1,
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: !selected ? "pointer" : "default",
          }}
        >
          <h2
            style={{
              color: "#fff",
              fontSize: ResponsiveFontSize(isMobile, isMobile ? 14 : 16),
              fontWeight: "700",
            }}
          >
            Manual
          </h2>
        </div>
        <div
          onClick={() => selected && toggleSelection()}
          style={{
            height: "100%",
            width: "50%",
            zIndex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: selected ? "pointer" : "default",
          }}
        >
          <h2
            style={{
              color: "#fff",
              fontSize: ResponsiveFontSize(isMobile, isMobile ? 14 : 16),
              fontWeight: "700",
            }}
          >
            Auto
          </h2>
        </div>
      </div>
      {gameType === "auto" ? (
        <>
          <PlusMinus
            heading={"Select Grid Size"}
            height={"9.9%"}
            top={"14.5%"}
            left={"4%"}
            value={`${gridSize}x${gridSize}`}
            onPlusClick={() => {
              handleGridSizeChange(1);
            }}
            onMinusClick={() => {
              handleGridSizeChange(-1);
            }}
          />
          <PlusMinusMines
            selectedTiles={selectedTiles}
            isBetPlaced={isBetPlaced}
            isAutoBetActive={isAutoBetActive}
            heading={"Mines"}
            top={"14.5%"}
            height={"9.9%"}
            value={minesCount}
            left={"55%"}
            gridSize={gridSize}
            onMinusClick={(e) => {
              minesUpdateManual(e);
            }}
            onPlusClick={(e) => {
              minesUpdateManual(e);
            }}
            onValueChanged={(e) => {
              minesUpdateManual(e);
            }}
          />
          <BetAmountComp
            heading={"Mines"}
            isBetPlaced={isBetPlaced}
            isAutoBetActive={isAutoBetActive}
            onHalfClick={handleHalf}
            onDoubleClick={handleDouble}
            top={"28%"}
            height={"9.9%"}
            betAmount={betAmount}
            handleBetAmountChange={handleBetAmountChange}
          />
        </>
      ) : (
        <>
          <PlusMinus
            heading={"Select Grid Size"}
            top={"23.2%"}
            left={"4%"}
            height={"15.95%"}
            value={`${gridSize}x${gridSize}`}
            onPlusClick={() => {
              handleGridSizeChange(1);
            }}
            onMinusClick={() => {
              handleGridSizeChange(-1);
            }}
          />
          <PlusMinusMines
            top={"23.2%"}
            height={"15.95%"}
            left={"55%"}
            selectedTiles={selectedTiles}
            isBetPlaced={isBetPlaced}
            isAutoBetActive={isAutoBetActive}
            heading={"Mines"}
            value={minesCount}
            gridSize={gridSize}
            onMinusClick={(e) => {
              minesUpdateManual(e);
            }}
            onPlusClick={(e) => {
              minesUpdateManual(e);
            }}
            onValueChanged={(e) => {
              minesUpdateManual(e);
            }}
          />
          <BetAmountComp
            top={"45%"}
            height={"15.95%"}
            heading={"Mines"}
            isBetPlaced={isBetPlaced}
            isAutoBetActive={isAutoBetActive}
            onHalfClick={handleHalf}
            onDoubleClick={handleDouble}
            betAmount={betAmount}
            handleBetAmountChange={handleBetAmountChange}
          />
        </>
      )}

      {gameType == "auto" ? (
        <>
          <ProfitLossComp
            isAutoBetActive={isAutoBetActive}
            isBetPlaced={isBetPlaced}
            heading={"Stop on Profit"}
            top={"40%"}
            height={"9.9%"}
            isInfinity={false}
            isProfit={true}
            value={stopOnProfit}
            onChange={(e) => {
              onProfit(parseFloat(e.target.value));
            }}
          />
          <ProfitLossComp
            isAutoBetActive={isAutoBetActive}
            isBetPlaced={isBetPlaced}
            heading={"Stop on Loss"}
            height={"9.9%"}
            top={"53%"}
            isInfinity={false}
            isProfit={true}
            value={stopOnLoss}
            onChange={(e) => {
              onLoss(parseFloat(e.target.value));
            }}
          />
          <ProfitLossComp
            isAutoBetActive={isAutoBetActive}
            isBetPlaced={isBetPlaced}
            heading={"Number of Bets"}
            height={"9.9%"}
            top={"66%"}
            isInfinity={true}
            isProfit={false}
            value={numberOfBets}
            onChange={(e) => {
              onNumberUpdate(Math.max(0, parseInt(e.target.value)));
            }}
          />
          {!isAutoBetActive ? (
            <div
              style={{
                height: "13.7%",
                width: "21.3%",
                borderRadius: "50%",
                border: "2px solid #8594FA",
                background:
                  "linear-gradient(140deg, #0B4CF2 22.68%, #2458DE 77.1%)",
                boxShadow: "0px 3.052px 6.485px 0px #000",
                position: "absolute",
                bottom: "5%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => {
                if (
                  selectedTiles.length === 0 ||
                  selectedTiles.length === null
                ) {
                  handleSelectCardClick();
                } else {
                  handleAutoBet();
                }
              }}
            >
              <h2
                style={{
                  color: "#fff",
                  fontSize: ResponsiveFontSize(isMobile, isMobile ? 12 : 16),
                  fontWeight: "700",
                  textAlign: "center",
                  padding: "5%",
                }}
              >
                {selectedTiles.length === 0 || selectedTiles.length === null
                  ? "Select Card"
                  : "Start Autoplay"}
              </h2>
            </div>
          ) : (
            <div
              style={{
                height: "13.7%",
                width: "21.3%",
                borderRadius: "50%",
                border: "2px solid #750909",
                background: "#DD090D",
                boxShadow: "0px 3.052px 6.485px 0px #000",
                position: "absolute",
                bottom: "4%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={handleStopAutoBet}
            >
              <h2
                style={{
                  color: "#fff",
                  fontSize: ResponsiveFontSize(isMobile, isMobile ? 12 : 16),
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                {"Stop Autoplay"}
              </h2>
            </div>
          )}
        </>
      ) : (
        <>
          <div
            style={{
              height: "22.2%",
              width: "21.3%",
              borderRadius: "50%",
              border: isBetPlaced ? "2px solid #1BC139" : "2px solid #8594FA",
              background: isBetPlaced
                ? "#00A019"
                : "linear-gradient(140deg, #0B4CF2 22.68%, #2458DE 77.1%)",
              boxShadow: "0px 3.052px 6.485px 0px #000",
              position: "absolute",
              bottom: "7%",
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              opacity: isBetPlaced && !isTileOpened ? 0.6 : 1,
            }}
            onClick={
              isBetPlaced && !isTileOpened
                ? () => {}
                : isBetPlaced
                ? handleCashOut
                : handleBetClick
            }
          >
            <h2
              style={{
                color: "#fff",
                fontSize: ResponsiveFontSize(isMobile, isMobile ? 12 : 16),
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              {isBetPlaced
                ? canCashOut
                  ? `Cashout\n${winAmount.toFixed(2)}`
                  : `Cashout\n${winAmount.toFixed(2)}`
                : "Play"}
            </h2>
          </div>
        </>
      )}
    </div>
  );
};

export default BettingMenuMobile;
