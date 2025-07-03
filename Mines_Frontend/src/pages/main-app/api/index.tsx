import axios from "axios";

const ApiClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL_MINES_BACKEND, // This will be proxied
	headers: {
		"Content-Type": "application/json",
	},
});

export default ApiClient;
