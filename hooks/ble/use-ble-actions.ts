import { BleManager, Device } from "react-native-ble-plx";

import { useBleStore } from "~stores/washroom/ble-store";

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

export const resources = {
  resourceGroups: [
    {
      name: "Settings",
      description: "Settings",
      resources: [
        {
          defaultValue: 0,
          resourceType: 4103,
          resourceInstanceNumber: 0,
          name: "Operation mode",
          description: "Operation mode",
          accessMode: "ReadAndWrite",
          dataType: "Uint8",
          $type: "ResourceIntegerDto",
        },
        {
          defaultValue: 100,
          resourceType: 4105,
          resourceInstanceNumber: 0,
          name: "Measurement interval setting in seconds",
          description: "Device measures the distance in the set interval",
          accessMode: "ReadAndWrite",
          dataType: "Uint32",
          $type: "ResourceIntegerDto",
        },
        {
          defaultValue: 1500,
          resourceType: 4104,
          resourceInstanceNumber: 2,
          name: "Maximum distance in millimeter",
          description: "Relevant maximum distance",
          accessMode: "ReadAndWrite",
          dataType: "Uint16",
          $type: "ResourceIntegerDto",
        },
        {
          defaultValue: 80,
          resourceType: 4104,
          resourceInstanceNumber: 1,
          name: "Threshold Two in millimeter",
          description: "Threshold distant from the sensor",
          accessMode: "ReadAndWrite",
          dataType: "Uint16",
          $type: "ResourceIntegerDto",
        },
        {
          defaultValue: 80,
          resourceType: 4104,
          resourceInstanceNumber: 0,
          name: "Threshold One in millimeter",
          description: "Threshold close to the sensor",
          accessMode: "ReadAndWrite",
          dataType: "Uint16",
          $type: "ResourceIntegerDto",
        },
      ],
    },
    {
      name: "Metrics",
      description: "Metrics",
      resources: [
        {
          resourceType: 3,
          resourceInstanceNumber: 0,
          name: "Firmware",
          description: "No translation available",
          accessMode: "Read",
          dataType: "String",
          $type: "ResourceStringDto",
        },
        {
          resourceType: 12290,
          resourceInstanceNumber: 0,
          name: "Refill status",
          description: "Refill status of the device",
          accessMode: "Read",
          dataType: "Uint8",
          $type: "ResourceIntegerDto",
        },
        {
          resourceType: 12288,
          resourceInstanceNumber: 0,
          name: "Energy supply status",
          description: "Energy supply status of the device",
          accessMode: "Read",
          dataType: "Uint8",
          $type: "ResourceIntegerDto",
        },
        {
          resourceType: 28677,
          resourceInstanceNumber: 0,
          name: "Distance in mm",
          description: "Distance in mm",
          accessMode: "Read",
          dataType: "Uint16",
          $type: "ResourceIntegerDto",
        },
        {
          defaultValue: 0,
          resourceType: 12293,
          resourceInstanceNumber: 0,
          name: "Fill status",
          description: "Fill status of the device",
          accessMode: "Read",
          dataType: "Uint8",
          $type: "ResourceIntegerDto",
        },
      ],
    },
    {
      name: "Not displayed metrics",
      description: "Not displayed metrics",
      resources: [
        {
          defaultValue: 2,
          resourceType: 23,
          resourceInstanceNumber: 0,
          name: "Oem Type Setting",
          description: "Oem Type Setting",
          accessMode: "ReadAndWrite",
          dataType: "Uint8",
          $type: "ResourceIntegerDto",
        },
        {
          defaultValue: 1,
          resourceType: 4098,
          resourceInstanceNumber: 0,
          name: "LED flashing",
          description:
            "If deactivated, the dispenser LED will only flash when there is a need to refill or to change the energy supply and in error cases",
          accessMode: "ReadAndWrite",
          dataType: "Uint8",
          $type: "ResourceIntegerDto",
        },
        {
          resourceType: 7,
          resourceInstanceNumber: 0,
          name: "Locate dispenser",
          description:
            "Activate blue flashing lights of the dispenser to locate it",
          accessMode: "ReadAndWrite",
          dataType: "Bool",
          $type: "ResourceBooleanDto",
        },
      ],
    },
  ],
};
