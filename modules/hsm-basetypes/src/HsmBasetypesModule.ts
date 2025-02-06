import { NativeModule, requireNativeModule } from 'expo';

import { HsMDeviceCodeParsingResult } from './HsmBasetypes.types';

declare class HsmBasetypesModule extends NativeModule {
  parseCode(code: string): string;
  parseCodeWithResult(code: string): HsMDeviceCodeParsingResult;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<HsmBasetypesModule>('HsmBasetypes');
