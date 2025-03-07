import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import { BleAdvertisementV2 } from "~modules/hsm-device-communications";

import {
  decryptResourcesValues,
  interpretNotifyValue,
  parseBleAdvertisementWithoutDecryption,
} from "./ble-communication";
import {
  NOTIFY_CHARACTERISTIC_UUID,
  SERVICE_UUID,
  checkBluetoothState,
  requestPermissions,
} from "./ble-utils";

type Data = BleAdvertisementV2 & {
  localName: string | null;
  id: string | null;
  decryptedResources: Uint8Array | null;
};

export function useBle(appKey?: string | null | undefined) {
  const bleManager = useMemo(() => new BleManager(), []);
  const [data, setData] = useState<Data | null>(null);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  useEffect(() => {
    const checkState = async () => {
      const currentState = await bleManager.state();
      if (currentState === "PoweredOff") {
        Alert.alert("Bluetooth", "Please enable Bluetooth", [
          { text: "Cancel" },
          { text: "OK", onPress: async () => await bleManager.enable() },
        ]);
      }
    };
    checkState();
  }, [bleManager]);

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
    // eslint-disable-next-line lodash/prefer-some
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (!isPermissionsEnabled) {
      console.log({
        type: "error",
        title: "Permissions not enabled",
        subtitle: "Please enable Bluetooth and Location permissions",
      });
    }

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) return console.error(error);
      if (device?.serviceUUIDs?.includes(SERVICE_UUID)) {
        if (!device.manufacturerData) return;

        const results = parseBleAdvertisementWithoutDecryption(
          device.manufacturerData
        );

        if (!results) return null;

        setAllDevices((prevState: Device[]) => {
          if (!isDuplicateDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });

        if (!appKey) {
          console.log({ type: "error", title: `App key is required` });
          return null;
        }

        const decryptedResources = decryptResourcesValues(
          results.encryptedResourceValuesHex,
          appKey
        );

        setData({
          localName: device.localName,
          id: device.id,
          ...results,
          decryptedResources,
        });
      }
    });
  };

  const backgroundScan = async (areas: any) => {
    const isPermissionsEnabled = await requestPermissions();
    if (!isPermissionsEnabled) {
      console.log({
        type: "error",
        title: "Permissions not enabled",
        subtitle: "Please enable Bluetooth and Location permissions",
      });
    }

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) return console.error(error);
      if (device?.serviceUUIDs?.includes(SERVICE_UUID)) {
        if (!device.manufacturerData) return;
        console.log("device.manufacturerData", device);
        const results = parseBleAdvertisementWithoutDecryption(
          device.manufacturerData
        );

        console.log("results", device.localName, results);

        if (!results || !device.localName) return null;

        // const registeredDeviceId = findDeviceIdByThingseeId(
        //   device.localName,
        //   areas
        // );
        // if (registeredDeviceId) {
        //   sendAdvertisementData({
        //     networkId: device.localName,
        //     manufacturerData: device.manufacturerData,
        //   });
        // }
      }
    });
  };

  const stopScanningForPeripherals = () => {
    bleManager.stopDeviceScan();
    setIsConnecting(false);
    console.log({ type: "info", title: `Scan stopped` });
  };

  const connectToDevice = async (device: Device) => {
    try {
      setIsConnecting(true);
      const connectedDevice = await bleManager.connectToDevice(device.id);
      await connectedDevice.discoverAllServicesAndCharacteristics();
      setConnectedDevices((prev) => [...prev, connectedDevice]);
      startStreamingData(connectedDevice);
      console.log({ type: "success", title: "Connected" });
      return connectedDevice;
    } catch (error) {
      console.error("Connection failed", error);
    } finally {
      setIsConnecting(false);
      stopScanningForPeripherals();
    }
  };

  const scanAndConnectToDevice = async (deviceId: string): Promise<boolean> => {
    const state = await checkBluetoothState(bleManager);
    if (state === "PoweredOff") {
      return false;
    }

    const isPermissionsEnabled = await requestPermissions();
    if (!isPermissionsEnabled) {
      console.log({
        type: "error",
        title: "Permissions not enabled",
        subtitle: "Please enable Bluetooth and Location permissions",
      });
    }

    setIsConnecting(true);
    console.log({
      type: "info",
      title: "Scanning for device",
      subtitle: "This may take a few seconds",
    });

    return new Promise((resolve) => {
      const scanTimeout = setTimeout(() => {
        bleManager.stopDeviceScan();
        setIsConnecting(false);
        console.log({
          type: "error",
          title: `Connection Timeout`,
          subtitle: `Could not connect to device`,
        });
        resolve(false);
      }, 10000); // 10 seconds

      bleManager.startDeviceScan(null, null, async (error, device) => {
        if (error) {
          console.log(error);
          clearTimeout(scanTimeout);
          resolve(false);
        }

        if (device && device.localName === deviceId) {
          bleManager.stopDeviceScan();
          clearTimeout(scanTimeout);
          const connectedDevice = await connectToDevice(device);
          setIsConnecting(false);

          if (connectedDevice) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
    });
  };

  const disconnectFromDevice = (deviceId: string) => {
    if (connectedDevices.length) {
      bleManager.cancelDeviceConnection(deviceId);
      setConnectedDevices((prev) => prev.filter((d) => d.id !== deviceId));
      console.log({ type: "info", title: "Disconnected" });
    }
  };

  const startStreamingData = (device: Device) => {
    device.monitorCharacteristicForService(
      SERVICE_UUID,
      NOTIFY_CHARACTERISTIC_UUID,
      (error, characteristic) => {
        if (error) {
          console.log(error);
          return -1;
        } else if (!characteristic?.value) {
          console.log("No Data was received");
          return -1;
        } else if (!appKey) {
          console.log({ type: "error", title: `App key is required` });
          return -1;
        }
        console.log("characteristic", characteristic);
        interpretNotifyValue(device.name, characteristic.value, appKey);
      }
    );
  };

  return {
    bleManager,
    data,
    isConnecting,
    allDevices,
    connectedDevices,
    backgroundScan,
    scanForPeripherals,
    stopScanningForPeripherals,
    scanAndConnectToDevice,
    connectToDevice,
    disconnectFromDevice,
  };
}
