import { NativeModule, requireNativeModule } from 'expo';

import {
  BuildEncryptedReadMessage,
  BuildEncryptedReadMessages,
  BuildEncryptedWriteMessage,
  ByteArray,
  DecryptedMessagePayload,
  EncryptedMessagePayload,
} from './LindstromHsmCommunications.types';

/** Native module interface for HSM Device Communications. */
declare class LindstromHsmCommunicationsModule extends NativeModule {
  /**
   * Parses a BLE advertisement without performing decryption.
   * @param manufacturerData - The manufacturer data in hexadecimal format.
   * @returns A JSON string representation of the parsed BLE advertisement (BleAdvertisementV2 format, parsed on the JavaScript side).
   */
  parseBleAdvertisementWithoutDecryption(manufacturerData: string): string;

  /**
   * Decrypts resource values using the provided decryption key.
   * @param encryptedResourceValuesHex - The encrypted resource values in hex format.
   * @param decryptionKey - The decryption key.
   * @returns The decrypted resource values as a byte array.
   */
  decryptResourcesValues(
    encryptedResourceValuesHex: string,
    decryptionKey: string
  ): ByteArray;

  /**
   * Extracts resource values as an integer from a decrypted byte array.
   * @param decryptedByteArray - The decrypted byte array as a string.
   * @param offset - The offset to start reading from.
   * @param length - The number of bytes to read.
   * @returns The extracted integer value.
   */
  getResourcesValuesAsInt(
    decryptedByteArray: string,
    offset: number,
    length: number
  ): number;

  /**
   * Builds an encrypted read message.
   * @param resourceType - The resource type.
   * @param instance - The instance identifier.
   * @param appKey - The application key.
   * @returns The encrypted read message payload.
   */
  buildEncryptedReadMessage(
    resourceType: BuildEncryptedReadMessage['resourceType'],
    instance: BuildEncryptedReadMessage['instance'],
    appKey: BuildEncryptedReadMessage['appKey']
  ): {
    encryptedMessage: EncryptedMessagePayload['encryptedMessage'];
    tlvId: EncryptedMessagePayload['tlvId'];
    resourceType: EncryptedMessagePayload['resourceType'];
    instance: EncryptedMessagePayload['instance'];
  };

  /**
   * Builds an encrypted read message for a list of resources.
   * @param resources - An array of resource types and instances.
   * @param appKey - The application key.
   * @returns The encrypted read message payload and the list of the TLV IDs for each resource.
   */
  buildEncryptedReadMessages(
    resources: BuildEncryptedReadMessages['resources'],
    appKey: BuildEncryptedReadMessages['appKey']
  ): {
    encryptedMessage: EncryptedMessagePayload['encryptedMessage'];
    tlvIds: EncryptedMessagePayload['tlvId'][];
  };

  /**
   * Builds an encrypted write message.
   * @param resourceType - The resource type.
   * @param instance - The instance identifier.
   * @param appKey - The decryption key.
   * @param value - The value to write.
   * @param dataType - The data type of the value.
   * @returns The encrypted write message payload.
   */
  buildEncryptedWriteMessage(
    resourceType: BuildEncryptedWriteMessage['resourceType'],
    instance: BuildEncryptedWriteMessage['instance'],
    appKey: BuildEncryptedWriteMessage['appKey'],
    value: BuildEncryptedWriteMessage['value'],
    dataType: BuildEncryptedWriteMessage['dataType']
  ): {
    encryptedMessage: EncryptedMessagePayload['encryptedMessage'];
    tlvId: EncryptedMessagePayload['tlvId'];
    resourceType: EncryptedMessagePayload['resourceType'];
    instance: EncryptedMessagePayload['instance'];
  };

  /**
   * Interprets a received value using the provided decryption key.
   * @param value - The received value as a string.
   * @param appKey - The decryption key.
   * @returns The interpreted value and its TLV ID.
   */
  interpretReceivedValue(
    value: string,
    appKey: string
  ): {
    value: DecryptedMessagePayload['value'];
    tlvId: DecryptedMessagePayload['tlvId'];
  }[];

  /**
   * Retrieves the supported data types.
   * @returns An array of supported data types as strings.
   */
  getDataTypes(): string[];
}

// Load the native module object from the JSI.
export default requireNativeModule<LindstromHsmCommunicationsModule>(
  'LindstromHsmCommunications'
);
