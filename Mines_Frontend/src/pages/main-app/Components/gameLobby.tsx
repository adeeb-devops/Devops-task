import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeviceContext } from "../context/deviceContext";
import { ResponsiveFontSize } from "../utils/ResponsiveFontSize";
import { GameLobbyCard } from "./gameLobbyCard";
import ApiClient from "../api";

interface Props {
  activeTab: any;
  setLoader: any;
}

export const GameLobby = (props: Props) => {
  const { isMobile }: any = useContext(DeviceContext);
  const navigate = useNavigate();

//   const { games, getGamesByName } = useContext(GameContext);
//   const { modifyContestData } = useContext(UserContext);
const [gameData,setGameData]=useState([])

  const [gamesList, setGamesList] = useState<any>([]);
  const [showtext, setShowText] = useState(false);
  const lobbyData = [
   
    [
      {
        id: 3,
        name: "lottery",
        image: "/main/blueDiamond.png",
        jackpotImage: "/main/goldDiamond.png",
        background:
          "linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(89, 129, 222, 0.50) 45%, #3E87FA 100%)",
        jackpot:"linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(255, 199, 4, 0.50) 45%, #F36D4B 100%)"
      },
    ],
  ];
  

  useEffect(()=>{
    async function getGamesByName() {
      // Determine the correct API client based on the game name
    
      try {
        const token=localStorage.getItem('minesToken')
        console.log('token',token)
        if(token){
          const data  = await ApiClient.get("/template", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            });
            props.setLoader(false)
            if(data.data.success){
              
              setGameData(data.data.data);
            }
        }
      
        // Return the filtered games based on the game name
        
      } catch (error) {
        // handleLogout()
      } finally {
      //   setLoader(false);
      }
      }
      getGamesByName()
  },[])

  const onItemClick=(data:any)=>{
        // setIsSocketConnect(true)
        sessionStorage.setItem('contestData',JSON.stringify(data))
        navigate('/game')
       
    
  }

  return gameData.length >= 1 ? (
    gameData.map((game:any) => (
      <GameLobbyCard
        onClick={(data:any) => {onItemClick(data)}}
        item={lobbyData[0][0]}
        key={game.id}
        game={game}
      />
    ))
  ) : (
    <>
      {showtext && (
        <div
          style={{
            height: "100%",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            position: "absolute",
            left: isMobile && "0%",
            top: !isMobile && "-10%",
            padding: isMobile ? "15px" : "",
          }}
        >
          <h2
            style={{
              color: "#fff",
              fontSize: ResponsiveFontSize(isMobile, isMobile ? 24 : 40),
              fontWeight: "700",
            }}
          >
            No games available at the moment.
          </h2>
        </div>
      )}
    </>
  );
};
