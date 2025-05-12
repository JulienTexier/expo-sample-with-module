/* eslint-disable lingui/no-unlocalized-strings */
// TODO: i18n this file once Marchfeld is ready
import { Alert } from "react-native";
import { BleManager } from "react-native-ble-plx";
import { ResourcesAPIResponse } from "~constants/types/types";

export const SERVICE_UUID = "af35e83e-ccc0-49aa-b2ca-337e39148225";
export const NOTIFY_CHARACTERISTIC_UUID =
  "af35e83e-ccc1-49aa-b2ca-337e39148225";
export const WRITE_CHARACTERISTIC_UUID = "af35e83e-ccc2-49aa-b2ca-337e39148225";

// TODO: This is only used in bluetooth.tsx for testing purposes
export const encryptionKeySoap = process.env
  .EXPO_PUBLIC_ENCRYPTION_KEY_TISSUE as string;
export const encryptionKeyMLE = process.env
  .EXPO_PUBLIC_ENCRYPTION_KEY_LEVEL as string;
export function getDecryptionKey(localName: string | null): string {
  if (localName === "34c5d00bcf43a618") {
    return encryptionKeySoap;
  } else if (localName === "34c5d0fa68ceffa5") {
    return encryptionKeyMLE;
  } else {
    return "0000000000000000";
  }
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
      // showToast({ type: 'success', title: 'Bluetooth Enabled' });
    }
  }, false);
}

export function transformResourceGroups(
  resourceGroups: ResourcesAPIResponse["resourceGroups"] | undefined
): { instance: number; resourceType: number }[] {
  if (!resourceGroups) return [];

  return resourceGroups.flatMap((group) =>
    group.resources.map((resource: any) => ({
      instance: resource.resourceInstanceNumber,
      resourceType: resource.resourceType,
    }))
  );
}
