// Static build stand-in for src/lib/base-path.ts (which reads process.env, absent in the browser).
// Vite's relative base already makes "/..." paths work from any folder.
export { assetUrl as withBasePath } from "./asset-url";
