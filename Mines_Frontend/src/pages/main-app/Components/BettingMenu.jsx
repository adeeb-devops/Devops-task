import React, { useEffect, useState, useContext } from 'react';
import { MyContext } from '../context/context';
import './button.css'
import eventEmitter from "../eventEmitter";
import { ResponsiveFontSize } from "../utils/ResponsiveFontSize";
import { DeviceContext } from "../context/deviceContext";
import { PlusMinus } from '../../main-app/Components/plusMinus'
import { PlusMinusMines } from '../../main-app/Components/plusMinusMines'

import { BetAmountComp } from '../../main-app/Components/BetAmount'
import { ProfitLossComp } from '../../main-app/Components/ProfitLoss'
import { stopAutoBet } from '../dataService';
import { el } from 'date-fns/locale';

const BettingMenu = ({
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
    heading,
    onCashout,
    canCashOut, setCanCashOut,
    setDisableInputs,
    onBetClick,
    showPopup
}) => {
    const { isMobile } = useContext(DeviceContext);
    const [winAmount, setWinAmount] = useState(0);
    const [selectedTiles, setSelectedTiles] = useState([]);
    const [isAutoBetEnabled, setIsAutoBetEnabled] = useState(false);
    const [isAutoBetActive, setIsAutoBetActive] = useState(false);
    const [isBetPlaced, setIsBetPlaced] = useState(false);
    const [isTileOpened,setTileOpened]=useState(false)
    const [clickedButton, setClickedButton] = useState(null);
    const [gameType,setGameType]=useState("")
    const [sizes,setSizes]=useState([])

    const handleBetAmountChange = (e) => {
        if (!disableInputs)

    
        // Allow only numeric input
        if (!/^\d*$/.test(e.target.value)) return;
            setBetAmount(e.target.value);
    };

    const handleHalf = () => {
         if(isBetPlaced||isAutoBetActive){
            return
         }
         setBetAmount(betAmount / 2)
    };

    const handleDouble = () => {

        if(isBetPlaced||isAutoBetActive){
            return
         }
        setBetAmount(betAmount * 2)

    };

    const handleGridSizeChange = (increment) => {
        const gridSizes=sizes

        if (disableInputs) return;
        if (selectedTiles.length > 0||isBetPlaced) {
            return
        }
        if (!isAutoBetActive) {
            const currentIndex = gridSizes.indexOf(gridSize);
            let newIndex = currentIndex + increment;
            if (newIndex < 0) newIndex = 0;
            if (newIndex >= gridSizes.length) newIndex = gridSizes.length - 1;
            setGridSize(gridSizes[newIndex]);
            setMinesCount(1)

        }

  };

    const handleBetClick = () => {
        eventEmitter.emit('game-changes',minesCount)
        if (selectedTiles.length > 0) {
            return
        }
        setGameType('manual')
        setClickedButton(1)
        setTimeout(() => {
          setClickedButton(null); 
        }, 400); 
        setGameMode("manual");
        setSelectedTiles([]);
        setIsAutoBetActive(false);
        onBetClick()
    };

    const handleCashOut = () => {
        setGameType('')
        setClickedButton(1)
        onCashout()
        setIsBetPlaced(false);
        setDisableInputs(false);
        setCanCashOut(false);
      };

    const onTileOpened = (data) => {
        setTileOpened(true)
        setWinAmount(Number(data.data.gameState.amount) * (Number(data.data.gameState.payout)))
    };

    const onGameOver = (data) => {
        setWinAmount(0)
        setIsBetPlaced(false)
        setTileOpened(false)
    }

    const handleAutoBet = () => {
        if(betAmount===""||betAmount<=0){
            showPopup()
            // setGameType('')
            // stopAutoBet()
            setIsAutoBetActive(false);
            setDisableInputs(false);
            setSelectedTiles([]);
            setIsAutoBetEnabled(false);
            return
        }
        eventEmitter.emit('select-auto',minesCount)
    };

    const handleStopAutoBet = () => {
        setGameType('')
        stopAutoBet()
        setIsAutoBetActive(false);
        setDisableInputs(false);
        setSelectedTiles([]);
        setIsAutoBetEnabled(false);
    };

  useEffect(() => {
    let maxMines = 24;
    if (gridSize === 7) maxMines = 48;
    if (gridSize === 9) maxMines = 80;

    setMinesCount((prevCount) => Math.min(prevCount, maxMines));
  }, [gridSize, setMinesCount]);

    const handleSelectCardClick = () => {
        if(isBetPlaced){
            return
        }
        setClickedButton(2)
        setGameType('auto')
        setTimeout(() => {
          setClickedButton(null); 
        }, 400); 
       
        setGameMode("auto")
    };

    const onCardSelected = (data) => {
        setSelectedTiles(data)
    }

    const onAutoBetReceived = () => {
        setIsAutoBetActive(true)
    }

    const onAutoComplete = () => {
        setGameType('')
        setClickedButton(2)
        setTimeout(() => {
          setClickedButton(null); 
        }, 400); 
        setIsAutoBetActive(false)
        setSelectedTiles([])
        setDisableInputs(false);
        setSelectedTiles([]);
        setIsAutoBetEnabled(false);
    }

    const onProfit = (data) => {
        onProfitUpdate(data)
    }

    const onLoss = (data) => {
        onLossUpdate(data)
    }

    const onNumberUpdate = (data) => {
        const parsedValue = parseInt(data);
        if (!isNaN(parsedValue)) {
            setNumberOfBets(Math.max(0, parsedValue));
        } else {
            setNumberOfBets("");
        }
    };

    const onLowBalance = () => {
        setIsBetPlaced(false)
    }

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

        eventEmitter.on('card-selected', onCardSelected)
        eventEmitter.on('auto-bet-progress', onAutoBetReceived);
        eventEmitter.on('auto-bet-complete', onAutoComplete);
        eventEmitter.on('auto-bet-stopped', onAutoComplete);
        eventEmitter.on("tile-opened", onTileOpened);
        eventEmitter.on("game-over", onGameOver);
        eventEmitter.on("low-balance", onLowBalance);
        eventEmitter.on("cashout-balance", ()=>{
            setWinAmount(0)
            setIsBetPlaced(false)
            setTileOpened(false)
        });

        eventEmitter.on("bet-placed", () => {
            setIsBetPlaced(true)
        });
        return (() => {
            eventEmitter.off("tile-opened");
            eventEmitter.off("game-over");
            eventEmitter.off('card-selected');
            eventEmitter.off('auto-bet-progress');
            eventEmitter.off('auto-bet-complete');
        })
    }, [])

    const autoStyles = {
        backgroundColor: '#31354C', width: '24.9%', height: '98.7%', position: 'absolute', left: '1%', borderRadius: 4, display: 'flex', justifyContent: 'center'
    }

    const manualStyles = {
        backgroundColor: '#31354C', width: '24.9%', height: '65.58%', position: 'absolute', right: '1%', borderRadius: 4, display: 'flex', justifyContent: 'center'
    }

    const minesUpdateManual = (e) => {
        console.log('mines Manual',e)
        if (selectedTiles.length > 0||isBetPlaced) {
            return
        }
        if (isAutoBetActive) {
            return
        }
            setMinesCount(e)
    }
    
    return (
        <div style={gameMode === "manual" ? manualStyles : autoStyles}>
            <div style={{ height: gameMode === "manual" ? "7.395%" : '5%', width: '42%', backgroundColor: '#1C1F32', position: 'absolute', top: '5%', borderRadius: 4, display: 'flex', justifyContent: 'center', alignItems: 'center',border:heading!==""&&heading===gameType&&"3px solid #00A9CF"}}>
                <h2 style={{
                    color: '#fff',
                    fontSize: ResponsiveFontSize(isMobile, isMobile ? 16 : 16),
                    fontWeight: '700',
                }}>
                    {menuName}
                </h2>
            </div>
            {gameMode === "auto" ? <>
                <PlusMinus heading={"Select Grid Size"} top={"13%"} value={`${gridSize}x${gridSize}`} onPlusClick={() => { handleGridSizeChange(1) }} onMinusClick={() => { handleGridSizeChange(-1) }}  />
                <PlusMinusMines selectedTiles={selectedTiles} isBetPlaced={isBetPlaced} isAutoBetActive={isAutoBetActive} heading={"Mines"} top={"25%"} gridSize={gridSize} value={minesCount} onMinusClick={(e) => { minesUpdateManual(e) }} onPlusClick={(e)=>{minesUpdateManual(e)}} onValueChanged={(e)=>{minesUpdateManual(e)}} />
                <BetAmountComp  heading={"Mines"} isBetPlaced={isBetPlaced} isAutoBetActive={isAutoBetActive}  onHalfClick={handleHalf} onDoubleClick={handleDouble} top={"37%"} betAmount={betAmount} handleBetAmountChange={handleBetAmountChange}
                />
            </> : <>
                <PlusMinus heading={"Select Grid Size"} top={"18%"} height={"14.62%"} value={`${gridSize}x${gridSize}`} onPlusClick={() => { handleGridSizeChange(1) }} onMinusClick={() => { handleGridSizeChange(-1) }} />
                <PlusMinusMines selectedTiles={selectedTiles} isBetPlaced={isBetPlaced} isAutoBetActive={isAutoBetActive} heading={"Mines"} top={"38%"} height={"14.62%"} gridSize={gridSize} value={minesCount} onMinusClick={(e) => { minesUpdateManual(e) }} onPlusClick={(e)=>{minesUpdateManual(e)}} onValueChanged={(e)=>{minesUpdateManual(e)}} />
                <BetAmountComp isBetPlaced={isBetPlaced} isAutoBetActive={isAutoBetActive}  heading={"Mines"} top={"58%"} height={"14.62%"} onHalfClick={handleHalf} onDoubleClick={handleDouble} betAmount={betAmount} handleBetAmountChange={handleBetAmountChange} />
            </>}

            {gameMode == "auto" ? <>
                <ProfitLossComp isAutoBetActive={isAutoBetActive} isBetPlaced={isBetPlaced}  heading={"Stop on Profit"} top={"49%"} isInfinity={false} isProfit={true} value={stopOnProfit} onChange={(e) => { onProfit(parseFloat(e.target.value)) }} />
                <ProfitLossComp  isAutoBetActive={isAutoBetActive} isBetPlaced={isBetPlaced} heading={"Stop on Loss"} top={"61%"} isInfinity={false} isProfit={true} value={stopOnLoss} onChange={(e) => { onLoss(parseFloat(e.target.value)) }} />
                <ProfitLossComp isAutoBetActive={isAutoBetActive}isBetPlaced={isBetPlaced}  heading={"Number of Bets"} top={"73%"} isInfinity={true} isProfit={false} value={numberOfBets} onChange={(e) => { onNumberUpdate(e.target.value) }} />
                {!isAutoBetActive ? <div className={`zoom-button ${clickedButton === 2 ? "clicked" : ""}`} style={{
                    height: '11.2%', width: '22%', borderRadius: '50%',
                    border: '2px solid #8594FA',
                    background: 'linear-gradient(140deg, #0B4CF2 22.68%, #2458DE 77.1%)',
                    boxShadow: '0px 2.052px 5.485px 0px #000', position: 'absolute', bottom: '3%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => {
                    if (selectedTiles.length === 0 || selectedTiles.length === null) {
                        handleSelectCardClick();
                    } else {
                        handleAutoBet()
                    }
                }}>
                    <h2 style={{
                        color: '#fff',
                        fontSize: ResponsiveFontSize(isMobile, isMobile ? 16 : 16),
                        fontWeight: '700',
                        textAlign: 'center',
                        padding: '5%'

                    }}>
                        {selectedTiles.length === 0 || selectedTiles.length === null ? "Select Card" : "Start Autoplay"}
                    </h2>
                </div> : <div className={`zoom-button ${clickedButton === 2 ? "clicked" : ""}`} style={{
                    height: '11.2%', width: '22%', borderRadius: '50%',
                    border: '2px solid #750909',
                    background: '#DD090D',
                    boxShadow: '0px 2.052px 5.485px 0px #000', position: 'absolute', bottom: '3%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={handleStopAutoBet}
                >
                    <h2 style={{
                        color: '#fff',
                        fontSize: ResponsiveFontSize(isMobile, isMobile ? 16 : 16),
                        fontWeight: '700',
                        textAlign: 'center'
                    }}>
                        {"Stop Autoplay"}
                    </h2>
                </div>}
            </> :
                <>
                    <div  className={`zoom-button ${clickedButton === 1 ? "clicked" : ""}`}
                    style={{
                        height: '17%', width: '22%', borderRadius: '50%',
                        border:isBetPlaced ? "2px solid #1BC139" : '2px solid #8594FA',
                        background: isBetPlaced ? "#00A019" : 'linear-gradient(140deg, #0B4CF2 22.68%, #2458DE 77.1%)',
                        boxShadow: '0px 2.052px 5.485px 0px #000', position: 'absolute', bottom: '5%', justifyContent: 'center', alignItems: 'center', display: 'flex',opacity:isBetPlaced&&!isTileOpened?0.6:1
                    
                    }}
                        onClick={(isBetPlaced&&!isTileOpened)?()=>{}:isBetPlaced ? handleCashOut : handleBetClick}
                    >
                        <h2 style={{
                            color: '#fff',
                            fontSize: ResponsiveFontSize(isMobile, isMobile ? 16 : 16),
                            fontWeight: '700',
                            textAlign: 'center'
                        }}>
                            {isBetPlaced ?
                                (canCashOut ? `Cashout\n${winAmount.toFixed(2)}` : `Cashout\n${winAmount.toFixed(2)}`)
                                : "Play"
                            }
                        </h2>
                    </div>
                </>}

        </div>
    );
};

export default BettingMenu;
