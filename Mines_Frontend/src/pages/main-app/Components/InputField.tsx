
const InputField: React.FC<any> = ({
	register,
	label,
	id,
	error,
}) => {
	return (
		<div>
			<label
				htmlFor={id}
				className="block text-white text-sm font-medium mb-2"
			>
				{label}
			</label>
			<input
				id={id}
				type="text"
				{...register(id)}
				className={`shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-800 ${
					error ? " border-rose-600" : "border-transparent"
				}`}
			/>
			{/* {error && <span className="text-sm text-red-600">{error}</span>} */}
		</div>
	);
};

export default InputField;
