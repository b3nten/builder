import { BuildOptions } from "esbuild";

/****************************************************************************************
 * defineConfig
 *****************************************************************************************/

export type Config = {
	dev?: {
		write?: boolean;
		port?: number;
		logLevel?: "info" | "debug" | "warn" | "error";
	}
} & Omit<BuildOptions, "write">

export function defineConfig(config: Config): Config{
	return config;
}