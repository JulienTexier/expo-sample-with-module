import { NativeModule, requireNativeModule } from 'expo';

import { HsMDeviceCodeParsingResult } from './LindstromHsmBasetypes.types';

/** Native module interface for HSM Basetypes. */
declare class LindstromHsmBasetypesModule extends NativeModule {
  /**
   * Parses the provided device code and returns a detailed result of the parsing process.
   *
   * @param code - The device code to be parsed.
   * @returns An object of type `HsMDeviceCodeParsingResult` containing the parsing result.
   */
  parseCodeWithResult(code: string): HsMDeviceCodeParsingResult;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<LindstromHsmBasetypesModule>(
  'LindstromHsmBasetypes'
);
