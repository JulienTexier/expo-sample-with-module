import { BleManager, Device } from "react-native-ble-plx";

import { useBleStore } from "~stores/washroom/ble-store";

import { resources } from "~components/ResourceList";
import { readFromDevice, writeToDevice } from "./ble-communication";

export function useBleActions() {
  const activeRequests = useBleStore((s) => s.activeRequests);

  const locateDevice = async (
    bleManager: BleManager,
    connectedDevice: Device | null,
    appKey: string | null
  ) => {
    if (!appKey) {
      console.log({ type: "error", title: `App key is required` });
      return;
    }
    if (!connectedDevice) {
      console.log("Device not found!");
      return;
    }
    if (!connectedDevice.name) return;

    try {
      // ResourceType: 4104, ResourceInstanceNumber: 0, Threshold 1 in mm: e.g. 80
      // ResourceType: 4104, ResourceInstanceNumber: 1, Threshold 2 in mm: e.g. 80
      // ResourceType: 4104, ResourceInstanceNumber: 2, Maximum Distance in mm: e.g. 450
      // ResourceType: 4103, ResourceInstanceNumber: 0, Operation Mode: e.g. 4 (for fill state detection)
      // ResourceType: 4105, ResourceInstanceNumber: 0, Measurement interval setting in seconds: e.g. 10
      await writeToDevice({
        bleManager,
        peripheralId: connectedDevice.id,
        deviceName: connectedDevice.name,
        resourceType: 7,
        instance: 0,
        value: 1,
        appKey,
      });
      await readFromDevice({
        bleManager,
        peripheralId: connectedDevice.id,
        deviceName: connectedDevice.name,
        resourceType: 7,
        instance: 0,
        appKey,
      });
    } catch (error) {
      console.error("Error while sending message:", error);
    }
  };

  const readBatteryLevel = async (
    bleManager: BleManager,
    connectedDevice: Device | null,
    appKey: string | null
  ) => {
    if (!appKey) {
      console.log({ type: "error", title: `App key is required` });
      return null;
    }
    if (!connectedDevice) {
      console.log("Device not found!");
      return null;
    }

    try {
      return await readFromDevice({
        bleManager,
        peripheralId: connectedDevice.id,
        deviceName: connectedDevice.name,
        resourceType: 12288,
        instance: 0,
        appKey,
      });
    } catch (error) {
      console.error("Error while reading battery level:", error);
      return null;
    }
  };

  const readRefillState = async (
    bleManager: BleManager,
    connectedDevice: Device | null,
    appKey: string | null
  ) => {
    if (!appKey) {
      console.log({ type: "error", title: `App key is required` });
      return null;
    }
    if (!connectedDevice) {
      console.log("Device not found!");
      return null;
    }

    try {
      return await readFromDevice({
        bleManager,
        peripheralId: connectedDevice.id,
        deviceName: connectedDevice.name,
        resourceType: 12290,
        instance: 0,
        appKey,
      });
    } catch (error) {
      console.error("Error while reading refill state:", error);
      return null;
    }
  };

  const readAllResources = async (
    bleManager: BleManager,
    connectedDevice: Device | null,
    appKey: string | null
  ) => {
    if (!appKey) {
      console.log({ type: "error", title: `App key is required` });
      return null;
    }
    if (!connectedDevice) {
      console.log("Device not found!");
      return null;
    }

    try {
      resources.resourceGroups.forEach(async (resourceGroup) => {
        resourceGroup.resources.forEach(async (resource) => {
          readFromDevice({
            bleManager,
            peripheralId: connectedDevice.id,
            deviceName: connectedDevice.name,
            resourceType: resource.resourceType,
            instance: resource.resourceInstanceNumber,
            appKey,
          });
        });
      });
    } catch (error) {
      console.error("Error while reading all resources:", error);
      return null;
    }
  };

  function mapInfo() {
    return resources.resourceGroups.flatMap((resourceGroup) =>
      resourceGroup.resources.map((resource) => {
        const value = Object.values(activeRequests[0].requests).find(
          (req) =>
            req.resourceType === resource.resourceType &&
            req.instance === resource.resourceInstanceNumber
        )?.value;

        return {
          label: resource.name,
          value,
        };
      })
    );
  }

  return {
    locateDevice,
    readBatteryLevel,
    readRefillState,
    readAllResources,
    mapInfo,
  };
}
