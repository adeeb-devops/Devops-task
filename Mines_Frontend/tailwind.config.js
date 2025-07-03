/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{js,ts,jsx,tsx}", "./public/index.html"],
	theme: {
		screens: {
			sm: "640px", // Small screens and up
			md: "768px", // Medium screens and up
			lg: "1024px", // Large screens and up
			xl: "1280px", // Extra large screens and up
			"2xl": "1536px", // 2x large screens and up
		},
		fontFamily: {
			inter: ["Inter", "sans-serif"],
		},
		extend: {
			keyframes: {
				"fade-in": {
					"0%": { opacity: "0", scale: "0" },
					"100%": { opacity: "1", scale: "1" },
				},
			},
			animation: {
				"fade-in": "fade-in 0.5s ease-in-out",
			},
		},
	},
	plugins: [],
};
