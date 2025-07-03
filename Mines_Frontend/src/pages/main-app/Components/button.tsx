type ButtonProps = {
	handleClick: () => void;
	text: string;
	isBottomSheet?: boolean;
};
const Button: React.FC<ButtonProps> = ({
	handleClick,
	text,
	isBottomSheet,
}) => {
	const isSmallDevice = window.innerHeight <= 500 && window.innerWidth <= 900;

	// Inline styles for small devices
	const smallDeviceStyles = isSmallDevice
		? {
				fontSize: "10px",
				padding: "2px 14px",
		  }
		: {};
	return (
		<button
			className={`bg-white text-black font-medium text-[11px] sm:text-[13px] rounded-full px-8 sm:px-11 py-1 sm:py-2 uppercase`}
			onClick={handleClick}
			style={smallDeviceStyles} // Apply conditional styles

		>
			{text}
		</button>
	);
};

export default Button;