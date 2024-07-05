import "tsx"
import { createLogger, Logger } from "@benstack/logger";
import { debounce, formatError, resolveExtensions } from "./tools.js";
import { BuildOptions } from "esbuild";
import { join } from "path";
import { watchFile, watch } from "fs"
import { Config } from "./mod.js";
import { pathToFileURL } from "url";

const CONFIG_PATHS = [
	"esbuild.config",
	"build.config",
	"builder.config",
]

async function development(c: Config, l: Logger){

	l.info("starting development server...")

	const esbuild = await import("esbuild")

	const esbuildConfig: BuildOptions = {
		...c,
		write: c.dev?.write ?? true,
		metafile: true,
		color: false,
		logLevel: "silent"
	}

	const context = await esbuild.context(esbuildConfig)

	const distpath = join(process.cwd(), esbuildConfig.outdir ?? "dist")

	const build = async () => {
		try {
			const t = performance.now()
			await context.rebuild()
			l.success(`built in ${(performance.now() - t).toFixed(0)}ms`)
		} catch(e){
			l.error(formatError(e))
		}
	}

	const watcher = watch(process.cwd(), {
		recursive: true,
	})

	const reload = debounce((_: unknown, p: string) => {
		if(join(process.cwd(), p).startsWith(distpath)) return
		if(CONFIG_PATHS.some(c => p.includes(c))) return
		build()
	}, 50)

	watcher.on("change", reload)

	await build()

	return () => {
		watcher.close()
		context.dispose()
	}
}

async function build(c: Config, l: Logger){

	const esbuild = await import("esbuild")

	const esbuildConfig: BuildOptions = {
		...c,
		write: true,
	}

	const t = performance.now()

	try {
		l.info(`building application to ${esbuildConfig.outdir}`)
		await esbuild.build(esbuildConfig)
		l.success(`built in ${(performance.now() - t).toFixed(0)}ms`)
	} catch(e){
		l.error(formatError(e))
		process.exit(1)
	}
}

async function main(){

	const paths = CONFIG_PATHS.map(c => join(process.cwd(), c))

	const configFile = resolveExtensions(paths, ["ts", "js"])

	const Log = createLogger({
		name: "BUILD",
		level: Logger.LogLevels.DEBUG,
	})

	const loadConfig = async (): Promise<Config | Error> => {
		try {
			return (await import(pathToFileURL(configFile).toString() + "?t=" + performance.now()))?.default
		} catch(e){
			return e instanceof Error ? e : new Error(e)
		}
	}

	let config: Config | Error | undefined = undefined

	config = await loadConfig()

	if(!process.argv.includes("--dev")){
		if(!config || config instanceof Error){
			Log.error("could not load config file:", config)
			process.exit(1)
		}
		await build(config, Log)
		return
	}

	let dispose = () => {}

	const devHandler = async () => {
		try {
			dispose()
			config = await loadConfig()
			if(config instanceof Error){
				Log.error("could not load config file:", config.message)
				return
			} else {
				dispose = await development(config, Log)
			}
		} catch(e){
			Log.error("failed to run development server:", formatError(e))
		}
	}

	await devHandler()

	watchFile(configFile, { interval: 50 }, () => {
		Log.info("reloading config...")
		devHandler()
	},)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})