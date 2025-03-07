/* eslint-disable no-bitwise */
import * as ExpoDevice from "expo-device";
import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from "react-native-ble-plx";
import { BleAdvertisementV2 } from "~modules/hsm-device-communications";
import HsmDeviceCommunicationsModule from "~modules/hsm-device-communications/src/HsmDeviceCommunicationsModule";

export const SERVICE_UUID = "af35e83e-ccc0-49aa-b2ca-337e39148225";
export const NOTIFY_CHARACTERISTIC_UUID =
  "af35e83e-ccc1-49aa-b2ca-337e39148225";
export const WRITE_CHARACTERISTIC_UUID = "af35e83e-ccc2-49aa-b2ca-337e39148225";
export const WRITE_READ_CHARACTERISTIC_UUID =
  "af35e83e-ccc3-49aa-b2ca-337e39148225";

export const encryptionKeySoap = process.env
  .EXPO_PUBLIC_ENCRYPTION_KEY_SOAP as string;
export const encryptionKeyMLE = process.env
  .EXPO_PUBLIC_ENCRYPTION_KEY_MLE as string;

// TODO: Get the encryptionKey from backend
export function getEncryptionKey(localName: string | null): string {
  if (localName === "34c5d0b42ebd5c5f") {
    return encryptionKeySoap;
  }
  return encryptionKeyMLE;
}

type Data = BleAdvertisementV2 & {
  localName: string | null;
  id: string | null;
  decryptedResources: Uint8Array | null;
};

export interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  stopScanningForPeripherals(): void;
  connectToDevice(device: Device): Promise<void>;
  disconnectFromDevice(): void;
  connectedDevice: Device | null;
  allDevices: Device[];
  data: Data | null;

  parseBleAdvertisementWithoutDecryption(
    characteristicValue: string
  ): BleAdvertisementV2 | null;

  decryptResourcesValues(
    encryptedResourceValuesHex: string,
    decryptionKey: string
  ): Uint8Array | null;

  getResourcesValuesAsInt(
    decryptedByteArray: Uint8Array,
    offset: number,
    length: number
  ): number | null;

  readFromDevice(
    peripheralId: string,
    resourceType: string,
    instance: string,
    key: string
  ): Promise<Characteristic | null>;

  writeToDevice(
    peripheralId: string,
    resourceType: string,
    instance: string,
    value: string,
    key: string
  ): Promise<Characteristic | null>;
}

export function useBLE(): BluetoothLowEnergyApi {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [data, setData] = useState<BluetoothLowEnergyApi["data"]>(null);

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    // eslint-disable-next-line lodash/prefer-some
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device && device.serviceUUIDs?.includes(SERVICE_UUID)) {
        // Once a device is discovered, you can access the advertisement data
        if (device.manufacturerData) {
          const manufacturerData = device.manufacturerData;
          console.log("Manufacturer Data:", manufacturerData);
          const results = parseBleAdvertisementWithoutDecryption(
            device.manufacturerData
          );

          if (!results) return null;

          const decryptedResources = decryptResourcesValues(
            results.encryptedResourceValuesHex,
            getEncryptionKey(device.localName)
          );

          setData({
            localName: device.localName,
            id: device.id,
            ...results,
            decryptedResources,
          });
        }

        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

  const stopScanningForPeripherals = () => {
    bleManager.stopDeviceScan();
  };

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      await bleManager.stopDeviceScan();
      startStreamingData(deviceConnection);
      // Remove the data that is not belonging to the device we are connected to
      setData((prev) => {
        if (prev?.id === device.id) {
          return prev;
        }
        return null;
      });
    } catch (e) {
      console.log("FAILED TO CONNECT", e);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setData(null);
    }
  };

  const onDataUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log("No Data was recieved");
      return -1;
    }

    // TODO: Figure out how we are supposed to get the correct data here.
    const results = parseBleAdvertisementWithoutDecryption(
      characteristic.value
    );
    if (!results) return null;

    const decryptedResources = decryptResourcesValues(
      results.encryptedResourceValuesHex,
      getEncryptionKey(data?.localName ?? null)
    );

    setData({
      localName: data?.localName ?? null,
      id: data?.id ?? null,
      ...results,
      decryptedResources,
    });
  };

  const startStreamingData = async (device: Device) => {
    console.log(`> Starting to stream data from device ${device.id}`);
    if (device) {
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        NOTIFY_CHARACTERISTIC_UUID,
        onDataUpdate
      );
    } else {
      console.log("No Device Connected");
    }
  };

  const parseBleAdvertisementWithoutDecryption = (
    characteristicValue: string
  ) => {
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
  };

  const decryptResourcesValues = (
    encryptedResourceValuesHex: string,
    decryptionKey: string
  ) => {
    try {
      const result = HsmDeviceCommunicationsModule.decryptResourcesValues(
        encryptedResourceValuesHex,
        decryptionKey
      );
      console.log("Decoded Result:", result); // Log the result to check what is returned
      return result;
    } catch (error) {
      console.error("Error while decoding:", error);
      return null;
    }
  };

  const getResourcesValuesAsInt = (
    decryptedByteArray: Uint8Array,
    offset: number,
    length: number
  ) => {
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
  };

  async function writeToDevice(
    peripheralId: string,
    resourceType: string,
    instance: string,
    value: string,
    key: string
  ) {
    try {
      const valueBase64 = Buffer.from(value).toString("base64");

      const result = HsmDeviceCommunicationsModule.writeEncrypted(
        resourceType,
        instance,
        valueBase64,
        key
      );

      const res = await bleManager.writeCharacteristicWithResponseForDevice(
        peripheralId,
        SERVICE_UUID,
        WRITE_CHARACTERISTIC_UUID,
        result.encryptedData
      );

      return res;
    } catch (error) {
      console.error("Write failed:", error);
      return null;
    }
  }

  async function readFromDevice(
    peripheralId: string,
    resourceType: string,
    instance: string,
    key: string
  ) {
    try {
      const result = HsmDeviceCommunicationsModule.readEncrypted(
        resourceType,
        instance,
        key
      );

      const res = await bleManager.readCharacteristicForDevice(
        peripheralId,
        SERVICE_UUID,
        WRITE_READ_CHARACTERISTIC_UUID,
        result.encryptedData
      );

      return res;
    } catch (error) {
      console.error("Write failed:", error);
      return null;
    }
  }

  return {
    scanForPeripherals,
    stopScanningForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    data,
    parseBleAdvertisementWithoutDecryption,
    decryptResourcesValues,
    getResourcesValuesAsInt,
    readFromDevice,
    writeToDevice,
  };
}
