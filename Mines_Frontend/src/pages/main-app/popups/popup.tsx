import { useEffect, useState } from "react";
import { DisconnectionPopup } from "./disconnection";
import { LowBalance } from "./lowBalance";
import { SessionExpiry } from "./session-expiry";
import { useNavigate } from "react-router-dom";
import { RestrictPopup } from "./maintenance";


// type PopupProps = IPopup;
interface Props {
	data: any;
	isPopupOpen: any;
	closePopup: any;
}

const Popup: React.FC<any> = (props: Props) => {
	const [isOpen, setIsOpen] = useState<boolean>(props.isPopupOpen || false);
	const navigate=useNavigate()

	function closePopup(): void {
		setIsOpen(false);
		props.closePopup();
	}

    const onSessionExpiry=()=>{
        localStorage.clear()
        sessionStorage.clear()
        navigate('/')
    }


	useEffect(() => {
		console.log('kvbcwewewfwfew',props)
		let timer: any = setTimeout(
			() => {
				props.data.autoclose == true && closePopup();
			},
			props.data.type == "lottery" ? 2000 :props.data.text==="NO MORE BETS PLEASE"?1500: 1500
		);

		return () => {
			clearTimeout(timer);
		};
	}, [props.data]);

	return (
		isOpen && (
            <>
            {
                props.data.type=="disconnect"&&<DisconnectionPopup/>
            }
            {
                props.data.type=="low-balance"&&<LowBalance onClose={closePopup}/>
            }
            {
                props.data.type=="game-unavailable"&&<SessionExpiry onSessionExpiry={onSessionExpiry}/>
            }
			{
                props.data.type=="restrict"&&<RestrictPopup type={props.data.type} onClose={closePopup}/>
            }
			{
                props.data.type=="maintenance"&&<RestrictPopup type={props.data.type} onClose={closePopup}/>
            }
            </>
            
		)
	);
};

export default Popup;
