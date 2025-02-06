// Reexport the native module. On web, it will be resolved to HsmBasetypesModule.web.ts
// and on native platforms to HsmBasetypesModule.ts
export * from './src/HsmBasetypes.types';
export { default } from './src/HsmBasetypesModule';
