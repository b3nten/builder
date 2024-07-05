import { existsSync } from "fs";

/****************************************************************************************
 * Tools
 *****************************************************************************************/

export function resolveExtensions(path: string[], extensions: string[]): string | undefined {
	for(const p of path){
		for(const ext of extensions){
			const filename = `${p}.${ext}`
			if(existsSync(filename)){
				return filename
			}
		}
	}
}

export function debounce<T extends Function>(cb: T, wait = 50) {
	let h: number | NodeJS.Timeout = 0;
	let callable = (...args: any) => {
			clearTimeout(h);
			h = setTimeout(() => cb(...args), wait);
	};
	return <T>(<any>callable);
}

export function formatError(e: unknown){
	if(e instanceof Error){
		return e.message.split("\n").map((l) => l.trim()).join("\n\t")
	} else {
		return e
	}
}