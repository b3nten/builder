import { defineConfig } from "./src/mod.js";
import dts from "esbuild-plugin-d.ts"

export default defineConfig({
	entryPoints: ["src/mod.ts", "src/cli.ts"],
	outdir: "dist",
	bundle: true,
	external: ["esbuild", "tsx"],
	format: "esm",
	target: "es2022",
	platform: "node",
	plugins: [dts()],
})
