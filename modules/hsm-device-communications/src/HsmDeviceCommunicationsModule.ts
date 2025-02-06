import { NativeModule, requireNativeModule } from 'expo';

import { ByteArray } from './HsmDeviceCommunications.types';

declare class HsmDeviceCommunicationsModule extends NativeModule {
  parseBleAdvertisementWithoutDecryption(characteristicValue: string): string; // BleAdvertisementV2, but it needs to be a string to be received on the JS side

  decryptResourcesValues(
    encryptedResourceValuesHex: string,
    decryptionKey: string
  ): ByteArray;

  getResourcesValuesAsInt(
    decryptedByteArray: ByteArray,
    offset: number,
    length: number
  ): number;

  buildEncryptedMessage(
    tlvs: any[],
    key: string
  ): { first: ByteArray; second: number[] };
}

// This call loads the native module object from the JSI.
export default requireNativeModule<HsmDeviceCommunicationsModule>(
  'HsmDeviceCommunications'
);
