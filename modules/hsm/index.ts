// Reexport the native module. On web, it will be resolved to HsmModule.web.ts
// and on native platforms to HsmModule.ts
export * from "./src/Hsm.types";
export { default } from "./src/HsmModule";
