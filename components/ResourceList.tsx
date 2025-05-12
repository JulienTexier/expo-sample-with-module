/* eslint-disable lingui/no-unlocalized-strings */
// TODO: i18n this file once Marchfeld is ready
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Device as BleDevice, BleManager } from "react-native-ble-plx";
import {
  ResourceConfiguration,
  ResourcesAPIResponse,
} from "~constants/types/types";
import {
  getDataTypeInt,
  readFromDevice,
  writeToDevice,
} from "~hooks/ble/ble-communication";
import { useBleDevices } from "~stores/washroom/ble-store";
import { ResourceItem } from "./ResourceItem";

const ResourceList = ({
  bleManager,
  device,
  connectedDevice,
  resourceGroups,
}: {
  bleManager: BleManager;
  device: any;
  connectedDevice: BleDevice;
  resourceGroups: ResourcesAPIResponse["resourceGroups"] | undefined;
}) => {
  console.log("connectedDevice", connectedDevice);
  const devicesResourceValues = useBleDevices();
  const resourceValues = devicesResourceValues.find(
    (d) => d.thingseeId === device.thingseeId
  )?.resources;

  const handleUpdate = async (
    resource: ResourceConfiguration,
    newValue: string
  ) => {
    console.log("> Updating resource", resource.name, "with value", newValue);

    // Convert the input value based on the resource's dataType:
    const dataType = getDataTypeInt(resource.dataType);

    await writeToDevice({
      bleManager,
      peripheralId: connectedDevice.id,
      deviceName: device.thingseeId,
      resourceType: resource.resourceType,
      instance: resource.resourceInstanceNumber,
      value: newValue,
      dataType,
      appKey: device.appKey,
    });

    await readFromDevice({
      bleManager,
      peripheralId: connectedDevice.id,
      deviceName: device.thingseeId,
      resourceType: resource.resourceType,
      instance: resource.resourceInstanceNumber,
      appKey: device.appKey,
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.stack}>
        <Text>Bluetooth</Text>

        {resourceGroups &&
          resourceGroups.map((group, index) => (
            <View style={styles.stack} key={index}>
              <Text style={styles.title}>{group.name}</Text>
              <View style={styles.stack}>
                {group.resources.map((res, resIndex) => {
                  const value = resourceValues?.find(
                    (r) =>
                      r.resourceType === res.resourceType &&
                      r.instance === res.resourceInstanceNumber
                  )?.value;
                  return (
                    <ResourceItem
                      key={resIndex}
                      resource={res as ResourceConfiguration}
                      onUpdate={handleUpdate}
                      value={value}
                    />
                  );
                })}
              </View>
            </View>
          ))}
      </View>
    </View>
  );
};

export default ResourceList;

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  accordion: {
    fontSize: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  stack: {
    flexDirection: "column",
    gap: 10,
  },
});
