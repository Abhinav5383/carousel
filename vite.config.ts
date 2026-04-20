import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	base: process.env.BASE_PATH,
	
	server: {
		port: 3000,
	},
	plugins: [solid()],
});
