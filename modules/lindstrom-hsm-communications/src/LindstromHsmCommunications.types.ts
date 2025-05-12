export type ByteArray = Uint8Array;

/**
 * Describes the current connection state of a BLE device.
 */
export enum BleDeviceConnectionState {
  NO_CONNECTION = 'NO_CONNECTION', // No active connection
  BLE_CONNECTION = 'BLE_CONNECTION', // Connected via Bluetooth Low Energy
  LORA_CONNECTION = 'LORA_CONNECTION', // Connected via LoRa
}

/**
 * BLE advertisement data along with metadata about the device.
 */
export type BleAdvertisementV2 = {
  connectionActive: boolean; // Whether the BLE connection is currently active
  deviceConnectionState: BleDeviceConnectionState; // Current state of the BLE device connection
  deviceType: number; // Numeric identifier for the device type
  oemType: number; // OEM identifier (2 = Lindström)
  encryptedResourceValuesHex: string; // Encrypted resource values as a hex string
};

/**
 * A single encrypted read message request.
 */
export type BuildEncryptedReadMessage = {
  resourceType: number; // Resource type identifier
  instance: number; // Resource instance number
  appKey: string; // Application key used for encryption
};

/**
 * Batch request to read multiple encrypted resources.
 */
export type BuildEncryptedReadMessages = {
  resources: Array<{
    resourceType: number; // Resource type identifier
    instance: number; // Resource instance number
  }>;
  appKey: string; // Application key used for encryption
};

/**
 * Encrypted write message containing the value and its data type.
 */
export type BuildEncryptedWriteMessage = BuildEncryptedReadMessage & {
  value: string; // Encrypted value to be written
  dataType: number; // Numeric identifier for the data type
};

/**
 * Payload representing an encrypted BLE message.
 */
export type EncryptedMessagePayload = {
  encryptedMessage: string; // The full encrypted message
  tlvId: number; // Unique TLV (Type-Length-Value) identifier
  resourceType: number; // Resource type identifier
  instance: number; // Resource instance number
};

/**
 * Payload representing a decrypted BLE message.
 */
export type DecryptedMessagePayload = {
  value: string; // Decrypted value as a string
  tlvId: number; // TLV (Type-Length-Value) identifier
};
