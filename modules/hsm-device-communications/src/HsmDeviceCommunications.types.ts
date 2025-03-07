export type ByteArray = Uint8Array;

/**
 * Represents a Bluetooth Low Energy advertisement with associated information.
 */
export type BleAdvertisementV2 = {
  connectionActive: boolean;
  deviceConnectionState: BleDeviceConnectionState;
  deviceType: number; // UByte in Kotlin is equivalent to number in TypeScript
  oemType: number; // UByte in Kotlin is equivalent to number in TypeScript
  encryptedResourceValuesHex: string;
};

/**
 * Enum representing the different connection states of a BLE device.
 */
export enum BleDeviceConnectionState {
  NO_CONNECTION = "NO_CONNECTION",
  BLE_CONNECTION = "BLE_CONNECTION",
  LORA_CONNECTION = "LORA_CONNECTION",
}

export type BuildEncryptedReadMessage = {
  resourceType: number;
  instance: number;
  appKey: string;
};

export type BuildEncryptedWriteMessage = BuildEncryptedReadMessage & {
  value: number;
};

export type EncryptedMessagePayload = {
  encryptedMessage: string;
  tlvId: number;
  resourceType: number;
  instance: number;
};

export type DecryptedMessagePayload = {
  value: string;
  tlvId: number;
};
