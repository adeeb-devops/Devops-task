import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd());
    return {
        plugins: [react()],
        server: {
        // proxy: {
        // 	"/api/qg": {
        // 		target: env.VITE_API_URL_QG_BACKEND, // Your backend server
        // 		changeOrigin: true,
        // 		// secure: false,
        // 		rewrite: (path) => path.replace(/^\/api\/qg/, ""),
        // 	},
        // 	"/api/roulette": {
        // 		target: env.VITE_API_URL_ROULETTE_BACKEND, // Your backend server
        // 		changeOrigin: true,
        // 		// secure: false,
        // 		rewrite: (path) => path.replace(/^\/api\/roulette/, ""),
        // 	},
        // },
        },
    };
});
