import HsmDeviceCommunicationsModule, {
  BleAdvertisementV2,
} from "~modules/hsm-device-communications";

import { Characteristic } from "react-native-ble-plx";

import { addRequest, handleResponse } from "~stores/washroom/ble-store";

import { SERVICE_UUID, WRITE_CHARACTERISTIC_UUID } from "./ble-utils";
import { ReadFromDeviceProps, WriteToDeviceProps } from "./types";

export function parseBleAdvertisementWithoutDecryption(
  characteristicValue: string
) {
  try {
    const results: BleAdvertisementV2 = JSON.parse(
      HsmDeviceCommunicationsModule.parseBleAdvertisementWithoutDecryption(
        characteristicValue
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
) {
  try {
    const result = HsmDeviceCommunicationsModule.decryptResourcesValues(
      encryptedResourceValuesHex,
      decryptionKey
    );
    // console.log("Decoded Result:", result); // Log the result to check what is returned
    return result;
  } catch (error) {
    console.error("Error while decoding:", error);
    return null;
  }
}

export function getResourcesValuesAsInt(
  decryptedByteArray: string,
  offset: number,
  length: number
) {
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

export async function writeToDevice({
  bleManager,
  peripheralId,
  deviceName,
  resourceType,
  instance,
  appKey,
  value,
}: WriteToDeviceProps): Promise<Characteristic | null> {
  try {
    if (!deviceName) throw new Error("Device not connected");

    const result = HsmDeviceCommunicationsModule.buildEncryptedWriteMessage(
      resourceType,
      instance,
      appKey,
      value
    );

    console.log(`> Sending write request for TLVID: ${result.tlvId}`);
    addRequest(deviceName, result.tlvId, result.instance, result.resourceType);

    const res = await bleManager.writeCharacteristicWithResponseForDevice(
      peripheralId,
      SERVICE_UUID,
      WRITE_CHARACTERISTIC_UUID,
      result.encryptedMessage
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
}: ReadFromDeviceProps): Promise<Characteristic | null> {
  try {
    if (!deviceName) throw new Error("Device not connected");
    const result = HsmDeviceCommunicationsModule.buildEncryptedReadMessage(
      resourceType,
      instance,
      appKey
    );

    console.log(`> Sending read request for TLVID: ${result.tlvId}`, {
      resourceType,
      instance,
    });
    addRequest(deviceName, result.tlvId, result.instance, result.resourceType);

    const res = await bleManager.writeCharacteristicWithResponseForDevice(
      peripheralId,
      SERVICE_UUID,
      WRITE_CHARACTERISTIC_UUID,
      result.encryptedMessage
    );

    return res;
  } catch (error) {
    console.error("Read failed:", error);
    return null;
  }
}

export async function interpretNotifyValue(
  deviceId: string | null,
  characteristicValue: string,
  appKey: string
) {
  const response = HsmDeviceCommunicationsModule.interpretReceivedValue(
    characteristicValue,
    appKey
  );
  console.log("> READ response", response);
  if (!deviceId) return;
  handleResponse(deviceId, response);
}
