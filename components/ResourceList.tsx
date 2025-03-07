import React, { useState } from "react";
import { Button, ScrollView, Text, TextInput, View } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import { readFromDevice, writeToDevice } from "~hooks/ble/ble-communication";
import { getDecryptionKey } from "~hooks/ble/ble-utils";

type Resource = {
  defaultValue?: number;
  resourceType: number;
  resourceInstanceNumber: number;
  name: string;
  description: string;
  accessMode: "Read" | "ReadAndWrite";
  dataType: string;
  $type: string;
};

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

const ResourceItem = ({
  resource,
  onUpdate,
}: {
  resource: Resource;
  onUpdate: (resource: Resource, newValue: string) => void;
}) => {
  const [value, setValue] = useState(resource.defaultValue?.toString() || "");
  const isEditable = resource.accessMode === "ReadAndWrite";

  return (
    <View style={{ padding: 10, borderBottomWidth: 1, borderColor: "#ddd" }}>
      <Text style={{ fontWeight: "bold" }}>{resource.name}</Text>
      <Text>{resource.description}</Text>
      <Text>Type: {resource.dataType}</Text>
      {isEditable ? (
        <TextInput
          style={{ borderWidth: 1, padding: 5, marginVertical: 5 }}
          value={value}
          onChangeText={setValue}
          keyboardType="numeric"
        />
      ) : (
        <Text>Value: {value}</Text>
      )}
      {isEditable && (
        <Button title="Send" onPress={() => onUpdate(resource, value)} />
      )}
    </View>
  );
};

const ResourceList = ({
  bleManager,
  connectedDevice,
}: {
  bleManager: BleManager;
  connectedDevice: Device | null;
}) => {
  const handleUpdate = async (resource: Resource, newValue: string) => {
    if (!connectedDevice) {
      console.log("Device not connected");
      return;
    }
    const appKey = getDecryptionKey(connectedDevice.name);

    console.log("Updating resource", resource.name, "with value", newValue);

    await writeToDevice({
      bleManager,
      peripheralId: connectedDevice.id,
      deviceName: connectedDevice.name,
      resourceType: resource.resourceType,
      instance: resource.resourceInstanceNumber,
      value: Number(newValue),
      appKey,
    });
    await readFromDevice({
      bleManager,
      peripheralId: connectedDevice.id,
      deviceName: connectedDevice.name,
      resourceType: resource.resourceType,
      instance: resource.resourceInstanceNumber,
      appKey,
    });
  };

  return (
    <ScrollView>
      {resources.resourceGroups.map((group, index) => (
        <View key={index} style={{ marginBottom: 20 }}>
          <Text
            style={{ fontSize: 18, fontWeight: "bold", marginVertical: 10 }}
          >
            {group.name}
          </Text>
          {group.resources.map((res, resIndex) => (
            <ResourceItem
              key={resIndex}
              resource={res as Resource}
              onUpdate={handleUpdate}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

export default ResourceList;
