import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { useNavigate } from "react-router-dom";

type UserContextType = {
	token: string;
	handleSetToken: (token: string) => void;
	user: object;
	handleSetUser: (user: object) => void;
	handleLogout: () => void;
	handleComingFrom:()=>void;
	contestData: object;
	soundData:object
	modifyContestData: (data: object) => void;
	updateBalance:(number:number)=>void
};
export const UserContext = createContext<UserContextType | undefined | any>(
	undefined
);

const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [token, setToken] = useState("");
	const [user, setUser] = useState({});
	const [comingFrom,setComingFrom]=useState(false)
	const [contestData, setContestData] = useState({
		
	});

    const [soundData,setSoundData]=useState({
		sound:false,
		vibration:false,
		userName:''
	  })
	const navigate = useNavigate();


	function handleSetToken(token: string) {
		setToken(token);
		localStorage.setItem("token", token);
	}
	function handleSetUser(user: object) {
		setUser(user);
		localStorage.setItem("user", JSON.stringify(user));
	}

	function handleComingFrom() {
		setComingFrom(true);
		// storeEncryptedData("user", user);
	}

	function updateBalance(number:number,_type:any){
		setUser((prevValue) => ({
			...prevValue,
			balance:number
		  }));
	}

	function modifyContestData(data: object, type: string) {
		const newContestData = { [type]: data }; 
	  
		setContestData((prevState) => ({
		  ...prevState,
		  ...newContestData,
		}));
	  
		sessionStorage.setItem("contestData", JSON.stringify({
		  ...JSON.parse(sessionStorage.getItem("contestData") || '{}'),
		  ...newContestData,
		}));
	  }

     const sendMessageToParent=()=>{
	const message = { key: 'logout', data: 'Your data here' };
	  
	window.parent.postMessage(message, '*'); 
     }
	  

	function handleLogout() {
		
		setToken("");
		setUser({});
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		sessionStorage.clear();
		navigate("/");
		
		
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
		
		  // console.log('Sound:', sound); // true or false
		  // console.log('Vibration:', vibration); // true or false
		} else {
		  console.log('User object not found in local storage');
		}
	  },[])
	useEffect(() => {
		
		const user = localStorage.getItem("user");
		setUser(user ? (user) : {});
	}, []);

	return (
		<UserContext.Provider
			value={{
				token,
				handleSetToken,
				user,
				handleSetUser,
				handleLogout,
				contestData,
				modifyContestData,
				updateBalance,
				handleComingFrom
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

const useUserContext = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useGameContext must be used within a GameProvider");
	}
	return context;
};

export { UserProvider, useUserContext };
