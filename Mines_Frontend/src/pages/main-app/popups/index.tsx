import { useEffect, useState } from "react";
import eventEmitter from "../eventEmitter";
import Popup from "./popup";
import { popupParams } from "./popupParams";

const Popups = ({gameType}) => {
	const [show, setShow] = useState<any>({});
	const onShowPopup = (data: any) => {
		setShow({ show: false, type: "" })
		setShow(data);
	};
	useEffect(() => {
		eventEmitter.on(`${gameType}-show-popup`, onShowPopup);
       
		return () => {
			eventEmitter.off(`${gameType}-show-popup`);
		};
	}, []);
	return (
		<>
			{show.show && (
				<div
					style={{
						height: "100%",
						position: "absolute",
						width: "100%",
						backgroundColor: "rgba(0,0,0,0.5)",
						zIndex: 100000,
                        justifyContent:'center',alignItems:'center',display:'flex'
					}}
				>
					<Popup
						closePopup={() => {
							onShowPopup({ show: false, type: "" });
						}}
						isPopupOpen={true}
						data={show.data}
					/>
				</div>
			)}
		</>
	);
};

export default Popups;
