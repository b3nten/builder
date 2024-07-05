<div align="center">
<br />

![Builder](.github/banner.jpg)

<h1>Builder</h3>

#### ESBuild CLI

*Builder is a thin wrapper around ESBuild's cli that lets you define a declarative build config with dev server.*

</div>

### Builder

#### Install
```bash
pnpm i @benstack/builder
```
#### Create Config

Create an `{esbuild|build|builder}.config.{ts|js}` file in your root directory.

```ts
import { defineConfig } from "@benstack/builder"

//  typeof esbuild.BuildOptions
export default defineConfig({
  entryPoints: ["src/mod.ts"],
  outdir: "dist",
  target: "esm",
  bundle: "true"
})
```

Run `pnpm builder` for a production build or `pnpm builder --dev` for an auto-reloading dev server.
### License

Made with 💛

Published under [MIT License](./LICENSE).