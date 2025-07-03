import { useContext } from "react";
import './gameLobbyCard.css'
import { DeviceContext } from "../context/deviceContext";
import { ResponsiveFontSize } from "../utils/ResponsiveFontSize";

interface Props {
	item: any;
	onClick: any;
	game: any;
}

type Details = {
	image: any;
	heading: String;
	detail: any;
};

export const GameLobbyCard = (props: Props) => {
	const { isMobile,isLandscapeMode }: any = useContext(DeviceContext);

	const { game } = props;
	const gameDetail: Details[] = [
		{
			image: "/main/coin.svg",
			heading: "MIN.PLAY",
			detail: game.min_bet,
		},
		{
			image: "/main/coin.svg",
			heading: "MAX.PLAY",
			detail: game.max_bet,
		},
		{
			image: "main/timer.svg",
			heading: "GRID",
			detail: game.grid_options,
		},
		{
			image: "/main/profile.svg",
			heading: "PLAYERS",
			detail: game.online_players??0 ,
		},
	];


	return (
		<div className="scale-effect"
			style={{
				...styles[`${isLandscapeMode?"L":isMobile ? "p" : "l"}_mainContainer`],				zIndex: 4,
			}}
		>
			<div
				style={{
					height: "100%",
					width: "100%",
					borderRadius: 22,
					overflow: "",
					backgroundColor: "#000",
					border: "3px solid #515050",
					position: "absolute",
					zIndex: 0,
				}}
			/>
			<div
				style={{
					height:props.game.is_jackpot?"50%": "69%",
					width: "100%",
					position: "absolute",
					top:props.game.is_jackpot?"4%": "-7%",
					zIndex: 0,
					objectFit: "contain",
					justifyContent: "center",
					display: "flex",
				}}
			>
				<img
					src={props.game.is_jackpot?props.item.jackpotImage:props.item.image}
					style={{
						objectFit: "contain",
						height: "100%",
						width: "100%",
					}}
				/>
			</div>
			<div
				onClick={() => {
					props.onClick(game);
				}}
				style={{
					background:props.game.is_jackpot?props.item.jackpot: props.item.background,
					height: "100%",
					width: "100%",
					zIndex: 3,
					borderRadius: 22,
				}}
			>
				<div
					style={{
						height: "45%",
						width: "100%",
						backgroundColor: "",
						position: "absolute",
						bottom: "0%",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<div
						style={{
							height: "30%",
							position: "absolute",
							top: "-5%",
						}}
					>
						<div
							style={{
								height: "00%",
								width: "100%",
								backgroundColor: "",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<h2
								style={{
									color: "#fff",
									fontSize: ResponsiveFontSize(
										isMobile,
										isMobile ? 10 : 16
									),
									fontWeight: "900",
									// position: "relative",
									// bottom: "-1%",
								}}
							>
								PLAY
							</h2>
						</div>
						<h2
							style={{
								color: "#fff",
								fontSize: ResponsiveFontSize(
									isMobile,
									isMobile ? 15 : 25
								),
								fontWeight: "900",
							}}
						>
							{game.game_name}
						</h2>
					</div>
					<div
						style={{
							height: "70%",
							width: "100%",
							backgroundColor: "",
							position: "absolute",
							bottom: "3%",
							display: "flex",
							flexWrap: "wrap",
							justifyContent: "space-between",
						}}
					>
						{gameDetail.map((item: Details, index: any) => {
							return (
								<div
									key={index}
									style={{
										height: "45%",
										width: "50%",
										backgroundColor: "",
										display: "flex",
										flexDirection: "column",
										justifyContent: "space-between",
									}}
								>
									<div
										style={{
											height: "50%",
											width: "80%",
											display: "flex",
											alignItems: "center",
											marginLeft: "12%",
										}}
									>
										<img
											src={item.image}
											style={{ height: "80%",width:'20%' }}
										/>
										<h2
											style={{
												color: "#fff",
												fontWeight: "700",
												fontSize: ResponsiveFontSize(
													isMobile,
													isMobile ? 8 : 9
												),
											}}
										>
											{item.heading}
										</h2>
									</div>
									<div
										style={{
											height: "50%",
											width: "72%",
											display: "flex",
											alignItems: "center",
											alignSelf: "flex-end",
											// marginLeft: "3%",

										}}
									>
										{item.heading === "PLAYERS" && (
											<div
												style={{
													width: "10%",
													height: "60%",
													marginRight: "3%",
													display:'flex',
													alignItems:'center',
												}}
											>
												<img
													src={"/main/dot.svg"}
													style={{ color: "green" }}
												/>
												
											</div>
										)}

										{item.heading!=="GRID"&&<h2
											style={{
												color: "#fff",
												fontWeight: "300",
												fontSize: ResponsiveFontSize(
													isMobile,
													isMobile ? 8 : 9
												),
											
											}}
										>
											{item.detail !== null
												? item.detail
												: 0}
											{item.heading === "TIMER" &&
												" seconds"}
										</h2>}
                                        {item.heading==="GRID"&&
                                         item.detail.map((data,index)=>{
                                          return(
                                            <h2
                                            key={index}
											style={{
												color: "#fff",
												fontWeight: "300",
												fontSize: ResponsiveFontSize(
													isMobile,
													isMobile ? 8 :9
												),
											
											}}
										>
											{`${data.grid_type}${index!==item.detail.length-1?',':''}`}
										</h2>
                                          )
                                         })
                                        }
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

const styles: any = {
	p_mainContainer: {
		height: "44.89%",
		width: "45.5%",
		position: "relative",
		zIndex: 2,
		borderRadius: 22,
		display: "flex",
		justifyContent: "center",
		marginBottom: "10%",
	},
	l_mainContainer: {
		height: "37.1%",
		width: "16%",
		position: "relative",
		zIndex: 2,
		borderRadius: 22,
		display: "flex",
		justifyContent: "center",
		marginBottom: "4%",
		marginRight:'3%',
		minWidth: "160px",
	},
	L_mainContainer: {
		height: "53.33%",
		width: "21.943%",
		position: "relative",
		zIndex: 2,
		borderRadius: 22,
		display: "flex",
		justifyContent: "center",
		marginBottom: "4%",
		marginRight:'3%',
		minWidth: "130px",
	},
};
