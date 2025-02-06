// Reexport the native module. On web, it will be resolved to HsmDeviceCommunicationsModule.web.ts
// and on native platforms to HsmDeviceCommunicationsModule.ts
export * from './src/HsmDeviceCommunications.types';
export { default } from './src/HsmDeviceCommunicationsModule';
