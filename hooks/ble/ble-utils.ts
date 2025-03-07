import * as ExpoDevice from "expo-device";
import { Alert, PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

export const SERVICE_UUID = "af35e83e-ccc0-49aa-b2ca-337e39148225";
export const NOTIFY_CHARACTERISTIC_UUID =
  "af35e83e-ccc1-49aa-b2ca-337e39148225";
export const WRITE_CHARACTERISTIC_UUID = "af35e83e-ccc2-49aa-b2ca-337e39148225";

// TODO: This is only used in bluetooth.tsx for testing purposes
export const encryptionKeySoap = process.env
  .EXPO_PUBLIC_ENCRYPTION_KEY_SOAP as string;
export const encryptionKeyMLE = process.env
  .EXPO_PUBLIC_ENCRYPTION_KEY_MLE as string;
export function getDecryptionKey(localName: string | null): string {
  if (localName === "34c5d0b42ebd5c5f") {
    return encryptionKeySoap;
  }
  return encryptionKeyMLE;
}

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === "android") {
    if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "Bluetooth Low Energy requires location permission.",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const scanPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
      );
      const connectPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      );
      return scanPermission === "granted" && connectPermission === "granted";
    }
  }
  return true;
}

export async function checkBluetoothState(bleManager: BleManager) {
  try {
    const state = await bleManager.state();
    if (state === "PoweredOff") {
      Alert.alert("Bluetooth", "Please enable Bluetooth", [
        { text: "Cancel" },
        { text: "OK", onPress: async () => await bleManager.enable() },
      ]);
    }

    return state;
  } catch (error) {
    console.error("Error checking Bluetooth state:", error);
  }

  return bleManager.onStateChange((state) => {
    if (state === "PoweredOn") {
      console.log({ type: "success", title: "Bluetooth Enabled" });
    }
  }, false);
}

export function isDuplicateDevice(
  devices: Device[],
  nextDevice: Device
): boolean {
  return devices.some((device) => device.id === nextDevice.id);
}
