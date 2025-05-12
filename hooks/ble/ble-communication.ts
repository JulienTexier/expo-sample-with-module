import { Characteristic } from "react-native-ble-plx";

import HsmDeviceCommunicationsModule, {
  BleAdvertisementV2,
} from "~modules/lindstrom-hsm-communications";
import { bleStore } from "~stores/washroom/ble-store";
import { SERVICE_UUID, WRITE_CHARACTERISTIC_UUID } from "./ble-utils";
import {
  ReadAllFromDeviceProps,
  ReadFromDeviceProps,
  WriteToDeviceProps,
} from "./types";

export function parseBleAdvertisementWithoutDecryption(
  manufacturerData: string
): BleAdvertisementV2 | null {
  try {
    const results: BleAdvertisementV2 = JSON.parse(
      HsmDeviceCommunicationsModule.parseBleAdvertisementWithoutDecryption(
        manufacturerData
      )
    );
    return results;
  } catch (error) {
    console.error("Error while decoding:", error);
    return null;
  }
}

export function decryptResourcesValues(
  encryptedResourceValuesHex: string,
  decryptionKey: string
): Uint8Array | null {
  try {
    const result = HsmDeviceCommunicationsModule.decryptResourcesValues(
      encryptedResourceValuesHex,
      decryptionKey
    );
    console.log("Decoded Result:", result);
    return result;
  } catch (error) {
    console.error("Error while decrypting resource values:", error);
    return null;
  }
}

export function getResourcesValuesAsInt(
  decryptedByteArray: string,
  offset: number,
  length: number
): number | null {
  try {
    return HsmDeviceCommunicationsModule.getResourcesValuesAsInt(
      decryptedByteArray,
      offset,
      length
    );
  } catch (error) {
    console.error("Error while extracting resource values:", error);
    return null;
  }
}

export function getDataTypeInt(resourceDataType: string) {
  const dataTypes = HsmDeviceCommunicationsModule.getDataTypes();
  const dataTypeArray = Object.entries(dataTypes).map(([key, value]) => ({
    key: Number(key),
    value,
  }));

  const dataType = dataTypeArray.find(
    (r) => r.value === resourceDataType.toUpperCase()
  );
  if (!dataType) throw new Error("Data type not found");

  return dataType.key;
}

export async function writeToDevice({
  bleManager,
  peripheralId,
  deviceName,
  resourceType,
  instance,
  appKey,
  value,
  dataType,
}: WriteToDeviceProps): Promise<Characteristic | null> {
  try {
    if (!deviceName) throw new Error("Device not connected");

    const result = HsmDeviceCommunicationsModule.buildEncryptedWriteMessage(
      resourceType,
      instance,
      appKey,
      value,
      dataType
    );

    const { tlvId, encryptedMessage } = result;

    console.log(`> Sending write request for TLVID: ${tlvId}`, {
      resourceType,
      instance,
    });

    bleStore.getState().actions.addPendingRequest(deviceName, {
      tlvId,
      resourceType,
      instance,
      tms: Date.now(),
    });

    const res = await bleManager.writeCharacteristicWithResponseForDevice(
      peripheralId,
      SERVICE_UUID,
      WRITE_CHARACTERISTIC_UUID,
      encryptedMessage
    );

    return res;
  } catch (error) {
    console.error("Write failed:", error);
    return null;
  }
}

export async function readFromDevice({
  bleManager,
  peripheralId,
  deviceName,
  resourceType,
  instance,
  appKey,
}: ReadFromDeviceProps) {
  try {
    if (!deviceName) throw new Error("Device not connected");

    const result = HsmDeviceCommunicationsModule.buildEncryptedReadMessage(
      resourceType,
      instance,
      appKey
    );

    const { tlvId, encryptedMessage } = result;

    console.log(`> Sending read request for TLVID: ${tlvId}`, {
      resourceType,
      instance,
    });

    bleStore.getState().actions.addPendingRequest(deviceName, {
      tlvId,
      resourceType,
      instance,
      tms: Date.now(),
    });

    const char = await bleManager.writeCharacteristicWithResponseForDevice(
      peripheralId,
      SERVICE_UUID,
      WRITE_CHARACTERISTIC_UUID,
      encryptedMessage
    );

    console.log("Write characteristic response:", char);
    return char;
  } catch (error) {
    console.error("Read failed:", error);
    return null;
  }
}

export async function readAllFromDevice({
  bleManager,
  peripheralId,
  deviceName,
  resources,
  appKey,
}: ReadAllFromDeviceProps) {
  try {
    if (!deviceName) throw new Error("Device not connected");

    const BATCH_SIZE = 15; // Based on estimated 256 MTU -> ~16 TLVs
    const batches = [];

    for (let i = 0; i < resources.length; i += BATCH_SIZE) {
      batches.push(resources.slice(i, i + BATCH_SIZE));
    }

    for (const batch of batches) {
      const result = HsmDeviceCommunicationsModule.buildEncryptedReadMessages(
        batch,
        appKey
      );

      batch.forEach((res, index) => {
        const tlvId = result.tlvIds[index];
        bleStore.getState().actions.addPendingRequest(deviceName, {
          tlvId,
          resourceType: res.resourceType,
          instance: res.instance,
          tms: Date.now(),
        });
      });

      await bleManager.writeCharacteristicWithResponseForDevice(
        peripheralId,
        SERVICE_UUID,
        WRITE_CHARACTERISTIC_UUID,
        result.encryptedMessage
      );
    }
    console.log("> Read all completed successfully");
    return true;
  } catch (error) {
    console.error("Read all failed:", error);
    return null;
  }
}

export async function handleNotifyFromDevice(
  base64EncryptedNotifyValue: string,
  deviceName: string,
  appKey: string
) {
  try {
    const decrypted =
      await HsmDeviceCommunicationsModule.interpretReceivedValue(
        base64EncryptedNotifyValue,
        appKey
      );

    decrypted.forEach(({ tlvId, value }) => {
      console.log("tlvId", tlvId, value);
      bleStore
        .getState()
        .actions.resolvePendingRequest(deviceName, tlvId, value);
    });
  } catch (error) {
    console.error("Notification handling failed:", error);
  }
}
