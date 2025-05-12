/* eslint-disable lingui/no-unlocalized-strings */
// TODO: i18n this file once Marchfeld is ready
import { useCallback, useEffect, useMemo, useState } from "react";
import { Device as BleDevice, BleManager } from "react-native-ble-plx";

import {
  handleNotifyFromDevice,
  parseBleAdvertisementWithoutDecryption,
} from "./ble-communication";
import {
  NOTIFY_CHARACTERISTIC_UUID,
  SERVICE_UUID,
  checkBluetoothState,
  getDecryptionKey,
} from "./ble-utils";

const SCAN_TIMEOUT_MS = 10_000;
export function useBle() {
  const bleManager = useMemo(() => new BleManager(), []);
  const [connectedDevices, setConnectedDevices] = useState<BleDevice[]>([]);
  const [allDevices, setAllDevices] = useState<BleDevice[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Helper to manage timeout logic for scanning
  const withScanTimeout = (
    onTimeout: () => void,
    duration: number = SCAN_TIMEOUT_MS
  ) => {
    const timeoutId = setTimeout(onTimeout, duration);
    return () => clearTimeout(timeoutId);
  };

  useEffect(() => {
    checkBluetoothState(bleManager);
  }, [bleManager]);

  const stopScanningForPeripherals = useCallback(() => {
    console.log("> Stop Bluetooth scanning");
    bleManager.stopDeviceScan();
    setIsScanning(false);
    // advertisementQueue.endScanSession();
    // showToast({ type: 'info', title: 'Scan stopped' });
  }, [bleManager]);

  const isDuplicateDevice = (devices: BleDevice[], nextDevice: BleDevice) =>
    // eslint-disable-next-line lodash/prefer-some
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = async (): // areas: any
  Promise<Pick<ScanAndConnectResult, "advertisementSent">> => {
    console.log("> Start background scanning");
    setIsScanning(true);
    // advertisementQueue.startScanSession();

    bleManager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        console.error(`[BLE Scan Error]: ${error.message}`, error);
        return { advertisementSent: false };
      }
      if (
        device?.serviceUUIDs?.includes(SERVICE_UUID) &&
        device.manufacturerData &&
        device.localName
      ) {
        const parsed = parseBleAdvertisementWithoutDecryption(
          device.manufacturerData
        );
        console.log("parsed", parsed);
        setAllDevices((prevState: BleDevice[]) => {
          if (!isDuplicateDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
        // const deviceId =
        //   parsed && findDeviceIdByThingseeId(device.localName, areas);

        // if (deviceId) {
        //   // const result = await advertisementQueue.addAdvertisement({
        //   //   networkId: device.localName,
        //   //   manufacturerData: device.manufacturerData,
        //   //   deviceType: parsed.deviceType,
        //   //   oemType: parsed.oemType,
        //   //   deviceId,
        //   // });

        //   if (result.success) {
        //     console.log(`Advertisement data sent for ${device.localName}`);
        //     return { advertisementSent: false };
        //   } else {
        //     console.warn(
        //       `Failed to send advertisement data for ${device.localName}`
        //     );
        //     return { advertisementSent: false };
        //   }
        // }
        return { advertisementSent: true };
      }
    });
    return { advertisementSent: false };
  };

  const backgroundScan = async () => {
    const result = await scanForPeripherals();

    // Use timeout to stop scanning
    const cancelTimeout = withScanTimeout(
      () => stopScanningForPeripherals(),
      SCAN_TIMEOUT_MS
    );

    return { ...result, cancelTimeout };
  };

  const connectToDevice = useCallback(
    async (device: BleDevice) => {
      // Prevent duplicate connections
      if (connectedDevices.some((d) => d.id === device.id)) {
        console.log(`Device ${device.id} already connected`);
        return device;
      }

      try {
        setIsConnecting(true);
        const connected = await bleManager.connectToDevice(device.id, {
          requestMTU: 256,
        });
        await connected.discoverAllServicesAndCharacteristics();
        const appKey = getDecryptionKey(device?.localName ?? null);
        setConnectedDevices((prev) => [...prev, connected]);
        startStreamingData(connected, appKey);

        // showToast({ type: 'success', title: 'Connected' });
        return connected;
      } catch (error) {
        console.error(`[BLE Connection Error]: `, error);
      } finally {
        setIsConnecting(false);
        stopScanningForPeripherals();
      }
    },
    [bleManager, connectedDevices, stopScanningForPeripherals]
  );

  type ScanAndConnectResult = {
    connected: boolean;
    advertisementSent: boolean;
  };

  const scanAndConnectToDevice = async (
    device: any
  ): Promise<ScanAndConnectResult> => {
    const state = await checkBluetoothState(bleManager);
    if (state === "PoweredOff") {
      return { connected: false, advertisementSent: false };
    }

    setIsConnecting(true);
    // advertisementQueue.startScanSession();

    // showToast({
    //   type: 'info',
    //   title: 'Scanning for device',
    //   subtitle: 'This may take a few seconds',
    // });

    return new Promise((resolve) => {
      let advertisementSent = false;

      const cancelTimeout = withScanTimeout(() => {
        bleManager.stopDeviceScan();
        // advertisementQueue.endScanSession();
        setIsConnecting(false);

        // showToast({
        //   type: 'error',
        //   title: 'Connection Timeout',
        //   subtitle: 'Could not connect to device',
        // });

        resolve({ connected: false, advertisementSent });
      });

      bleManager.startDeviceScan(null, null, async (error, bleDevice) => {
        if (error) {
          console.error(`[BLE Scan Error]: ${error.message}`, error);
          cancelTimeout();
          resolve({ connected: false, advertisementSent });
          return;
        }

        if (bleDevice && bleDevice.localName === device.thingseeId) {
          if (bleDevice.manufacturerData && bleDevice.localName) {
            const parsed = parseBleAdvertisementWithoutDecryption(
              bleDevice.manufacturerData
            );
            if (parsed) {
              // const result = await advertisementQueue.addAdvertisement({
              //   networkId: bleDevice.localName,
              //   manufacturerData: bleDevice.manufacturerData,
              //   deviceType: parsed.deviceType,
              //   oemType: parsed.oemType,
              //   deviceId: device.id,
              // });
              // if (result.success) advertisementSent = true;
            }
          }

          bleManager.stopDeviceScan();
          // advertisementQueue.endScanSession();
          cancelTimeout();
          const connected = await connectToDevice(bleDevice);
          setIsConnecting(false);

          resolve({ connected: !!connected, advertisementSent });
        }
      });
    });
  };

  const disconnectFromDevice = useCallback(
    (deviceId: string) => {
      if (!connectedDevices.length) return;

      bleManager.cancelDeviceConnection(deviceId);
      setConnectedDevices((prev) => prev.filter((d) => d.id !== deviceId));
      // showToast({ type: 'info', title: 'Disconnected' });
    },
    [bleManager, connectedDevices]
  );

  const startStreamingData = (device: BleDevice, appKey: string) => {
    device.monitorCharacteristicForService(
      SERVICE_UUID,
      NOTIFY_CHARACTERISTIC_UUID,
      (error, characteristic) => {
        if (error) {
          console.warn(`[BLE Notification Error]: ${error.message}`, error);
          return;
        }

        const value = characteristic?.value;
        if (!value || !device.name) {
          console.warn("No data received or device name missing");
          return;
        }

        console.log(
          "> Notification received for device",
          device.name,
          value,
          appKey
        );
        handleNotifyFromDevice(value, device.name, appKey);
      }
    );
  };

  return {
    bleManager,
    isScanning,
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
