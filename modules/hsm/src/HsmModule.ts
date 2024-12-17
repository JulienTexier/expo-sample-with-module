import { NativeModule, requireNativeModule } from 'expo';

import { HsmModuleEvents } from './Hsm.types';

declare class HsmModule extends NativeModule<HsmModuleEvents> {
  PI: number;
  hello(): string;
  parseCode(code: string): string;
  parseCodeWithResult(code: string): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<HsmModule>('Hsm');
