import { NativeModule, requireNativeModule } from "expo";

import {
  BuildEncryptedReadMessage,
  BuildEncryptedWriteMessage,
  ByteArray,
  DecryptedMessagePayload,
  EncryptedMessagePayload,
} from "./HsmDeviceCommunications.types";

declare class HsmDeviceCommunicationsModule extends NativeModule {
  parseBleAdvertisementWithoutDecryption(characteristicValue: string): string; // BleAdvertisementV2, but it needs to be a string to be received on the JS side

  decryptResourcesValues(
    encryptedResourceValuesHex: string,
    decryptionKey: string
  ): ByteArray;

  getResourcesValuesAsInt(
    decryptedByteArray: string,
    offset: number,
    length: number
  ): number;

  buildEncryptedReadMessage(
    resourceType: BuildEncryptedReadMessage["resourceType"],
    instance: BuildEncryptedReadMessage["instance"],
    appKey: BuildEncryptedReadMessage["appKey"]
  ): {
    encryptedMessage: EncryptedMessagePayload["encryptedMessage"];
    tlvId: EncryptedMessagePayload["tlvId"];
    resourceType: EncryptedMessagePayload["resourceType"];
    instance: EncryptedMessagePayload["instance"];
  };

  buildEncryptedWriteMessage(
    resourceType: BuildEncryptedWriteMessage["resourceType"],
    instance: BuildEncryptedWriteMessage["instance"],
    appKey: BuildEncryptedWriteMessage["appKey"],
    value: BuildEncryptedWriteMessage["value"]
  ): {
    encryptedMessage: EncryptedMessagePayload["encryptedMessage"];
    tlvId: EncryptedMessagePayload["tlvId"];
    resourceType: EncryptedMessagePayload["resourceType"];
    instance: EncryptedMessagePayload["instance"];
  };

  interpretReceivedValue(
    value: string,
    appKey: string
  ): {
    value: DecryptedMessagePayload["value"];
    tlvId: DecryptedMessagePayload["tlvId"];
  };
}

// This call loads the native module object from the JSI.
export default requireNativeModule<HsmDeviceCommunicationsModule>(
  "HsmDeviceCommunications"
);
