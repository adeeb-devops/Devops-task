import {
	useEffect,
	useState,
	createContext,
	ReactNode,
	useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "./userContext";
import ApiClient from "../api";

type GameContextType = {
	getAllGames: () => void;
	getGamesByName:any;
};

export const GameContext = createContext<GameContextType | any | undefined>(
	undefined
);

const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [games, setGames] = useState<any>([]);
	const { token, handleSetUser,handleLogout } = useUserContext();
	const navigate = useNavigate();
	useEffect(() => {
		if (token) {
			// getAllGames('ROULETTE');
		}
	}, [token]);
	
	async function getGamesByName(gameName: string) {
		// Determine the correct API client based on the game name
		let apiClient;
		try {
		  const token=localStorage.getItem('minesToken')
			if(token){
				const { data } = await ApiClient.get("/lobby/template", {
					headers: {
					  Authorization: `Bearer ${token}`,
					},
				  });
				  setGames(data.data);
                  console.log('hello---->',data)
				  return data.data.filter(
					(game: any) => game.game.toLowerCase() === gameName.toLowerCase()
				  ); 

			}
	  
		  // Return the filtered games based on the game name
		  
		} catch (error) {
		  handleLogout()
		} finally {
		//   setLoader(false);
		}
	  }
	return (
		<GameContext.Provider
			value={{ games, getGamesByName }}
		>
			{children}
		</GameContext.Provider>
	);
};

const useGameContext = () => {
	const context = useContext(GameContext);
	if (context === undefined) {
		throw new Error("useGameContext must be used within a GameProvider");
	}
	return context;
};

export { GameProvider, useGameContext };
