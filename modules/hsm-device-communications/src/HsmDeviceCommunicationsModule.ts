import { NativeModule, requireNativeModule } from 'expo';

import { HsmDeviceCommunicationsModuleEvents } from './HsmDeviceCommunications.types';

declare class HsmDeviceCommunicationsModule extends NativeModule<HsmDeviceCommunicationsModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<HsmDeviceCommunicationsModule>('HsmDeviceCommunications');
