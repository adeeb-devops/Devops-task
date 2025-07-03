import React, { useState, useContext, useEffect, useRef } from "react";
import BettingMenu from "./Components/BettingMenu";
import BettingMenuMobile from "./Components/BettingMenuMobile";
import { DeviceContext } from "./context/deviceContext";
import { Grid } from "./Components/Grid";
import {
  createSocket,
  placeBet,
  openTile,
  cashOut,
  onAutoClicked,
} from "./dataService";
import eventEmitter from "./eventEmitter";
import { HamburgerMenu } from "./Components/HamburgerMenu";

import { Header } from "./Components/Header";
import Popups from "./popups";
import { ErrorPopup } from "./popups/errorPopup";

const MinesGame = () => {
  const { isMobile } = useContext(DeviceContext);
  const [betAmount, setBetAmount] = useState("");
  const [gridSize, setGridSize] = useState(5);
  const [numberOfBets, setNumberOfBets] = useState(0);
  const [minesCount, setMinesCount] = useState(1);
  const [gameMode, setGameMode] = useState("");
  const [disableInputs, setDisableInputs] = useState(false);
  const [canCashOut, setCanCashOut] = useState(false);
  const [onMenuOpen, setIsMenuOpen] = useState(false);
  const [onError,setOnError]=useState(false)
  const [showBoxes,setShowBoxes]=useState(false)
  const amount = useRef<any>("");
  const grid = useRef(5);
  const mines = useRef(1);
  const profit = useRef(0);
  const loss = useRef(0);
  const bets = useRef(0);
  const [gameData, setGameData] = useState<any>({});
  let gameId = useRef("").current;
  let autoArray = useRef([]).current;
  const containerRef = useRef<any>(null); 

  useEffect(() => {
    eventEmitter.on("init-data", (data) => {
      setGameData(data);
      gameId = data.id;
    });
  }, []);

  const onBetPlace = () => {
    const contestString = sessionStorage.getItem("contestData");
    const contests = contestString ? JSON.parse(contestString) : null;
    console.log(',c s cs',mines.current,minesCount)
    if(amount.current==""||amount.current<=0){
       console.log('kvnevoenvev',betAmount)
       setOnError(true)
       return
    }
    placeBet(
      contests.id,
      minesCount,
      amount.current,
      grid.current,
      gameData.id,
      false
    );
  };

  const openTiles = (index:any) => {
    openTile(index, gameData.gameId);
  };
  const onCashout = (index:any) => {
    cashOut(gameData.gameId);
  };

  const onAuto = (data:any) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0, // Scroll to the top
        behavior: 'smooth', // Smooth animation
      });
    }
    if(amount.current==""||amount.current<=0){
      setOnError(true)
      return
   }

    const a = {
      mines:minesCount,
      tile_count: grid.current * grid.current,
      bet_amount: Number(amount.current),
      game_id: gameId,
      numberOfBets: bets.current,
      tileSelections: [...data.current],
      is_infinite: bets.current > 0 ? false : true,
      is_jackpot: false,
      profitLimit: profit.current,
      lossLimit: loss.current,
    };
    onAutoClicked(a);
  };

  const onBetAmount = (data:any) => {
    setBetAmount(data);
    amount.current = data;
  };

  const onGridSize = (data:any) => {
    setGridSize(data);
    grid.current = data;
  };

  const onMinesUpdate = (data:any) => {
    setMinesCount(data);
    mines.current = data;
  };

  const onProfitUpdate = (data:any) => {
    // setMinesCount(data)
    profit.current = data;
  };
  const onLossUpdate = (data:any) => {
    loss.current = data;
  };

  const showPopup=()=>{
    setOnError(true)
  }
  

  const onNumberUpdate = (data:any) => {
    setNumberOfBets(data);
    bets.current = data;
  };

  useEffect(() => {
    setTimeout(()=>{
      setShowBoxes(true)
    },2000)
    eventEmitter.on('closeMenu',()=>{
      setIsMenuOpen(false)
    })
    const contestString = sessionStorage.getItem("contestData");
    const userData = localStorage.getItem("user");
    const userParsed = userData ? JSON.parse(userData) : null;
    const contests = contestString ? JSON.parse(contestString) : null;
    createSocket({
      roomId: contests.id,
      player_name: userParsed.player_name!==null?userParsed.player_name:userParsed.username,
      is_jackpot: contests.is_jackpot,
    });
    
  }, []);
  const PcStyles:any={
    height:'100%',width:'100%',backgroundColor:'#1c1f32',position:'fixed',
  }
  const mobileStyles:any={
    height:'100%',width:'100%',backgroundColor:'#1c1f32',position:'absolute',overflowY:gameMode=="manual"?'hidden':'scroll'
  }

  return (
    <div ref={containerRef} style={!isMobile?PcStyles:mobileStyles}>
      <Header
        isGame={true}
        onMenuClick={() => {
          setIsMenuOpen(true);
        }}
      />
      <div style={{...styles[`${isMobile ? "p" : "l"}_mainContainer`],position:onMenuOpen?'fixed':'absolute'}}>
         {!isMobile && (
          <BettingMenu
            menuName="Auto Play"
            betAmount={betAmount}
            setBetAmount={onBetAmount}
            gridSize={gridSize}
            setGridSize={onGridSize}
            minesCount={minesCount}
            onBetClick={onBetPlace}
            setMinesCount={onMinesUpdate}
            gameMode="auto"
            numberOfBets={numberOfBets}
            setNumberOfBets={onNumberUpdate}
            onProfitUpdate={onProfitUpdate}
            showPopup={showPopup}
            onLossUpdate={onLossUpdate}
            setGameMode={setGameMode}
            disableInputs={disableInputs}
            setDisableInputs={setDisableInputs}
            canCashOut={canCashOut}
            heading={gameMode}
            onCashout={onCashout}
            setCanCashOut={setCanCashOut}
          />
        )}
        {!isMobile && (
          <BettingMenu
            menuName="Manual Play"
            betAmount={betAmount}
            setBetAmount={onBetAmount}
            gridSize={gridSize}
            setGridSize={onGridSize}
            minesCount={minesCount}
            onBetClick={onBetPlace}
            heading={gameMode}
            setMinesCount={onMinesUpdate}
            gameMode="manual"
            numberOfBets={numberOfBets}
            setNumberOfBets={onNumberUpdate}
            onProfitUpdate={onProfitUpdate}
            onLossUpdate={onLossUpdate}
            showPopup={showPopup}
            setGameMode={setGameMode}
            disableInputs={disableInputs}
            setDisableInputs={setDisableInputs}
            canCashOut={canCashOut}
            onCashout={onCashout}
            setCanCashOut={setCanCashOut}
          />
        )} 

        {isMobile && (
          <BettingMenuMobile
            menuName="Manual Bet"
            betAmount={betAmount}
            setBetAmount={onBetAmount}
            gridSize={gridSize}
            setGridSize={onGridSize}
            minesCount={minesCount}
            onBetClick={onBetPlace}
            setMinesCount={onMinesUpdate}
            gameMode={gameMode}
            setNumberOfBets={onNumberUpdate}
            showPopup={showPopup}
            onProfitUpdate={onProfitUpdate}
            onLossUpdate={onLossUpdate}
            setGameMode={setGameMode}
            disableInputs={disableInputs}
            setDisableInputs={setDisableInputs}
            canCashOut={canCashOut}
            onCashout={onCashout}
            setCanCashOut={setCanCashOut}
          />
        )}

        <Grid
          gridSize={gridSize}
          mines={mines.current}
          onIndexClick={openTiles}
          gameMode={gameMode}
          onAutoClicked={onAuto}
        />

        {onMenuOpen && (
          <div style={{ height: "100%", width: "100%", position: "absolute" }}>
            <HamburgerMenu
              onClose={() => {
                setIsMenuOpen(false);
              }}
            />
          </div>
        )}
      </div>
      {
        onError&&<ErrorPopup onClose={()=>{
          setOnError(false)
        }}/>
      }
      <Popups gameType={'mines'}/>

    </div>
  );
};

const styles = {
  p_mainContainer: {
    position: "absolute",
    height: "96%",
    width: "100%",
    top: "7%",
    
  },
  l_mainContainer: {
    position: "absolute",
    height: "90%",
    width: "100%",
    backgroundColor: "",
    top: "9%",
  },
};

export default MinesGame;
