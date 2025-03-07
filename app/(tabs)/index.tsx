import React, { useState } from "react";
import { Alert, Button, Text, View } from "react-native";
import DeviceModal from "~components/DeviceConnectionModal";
import { useBle } from "~hooks/ble/ble-manager";
import { getDecryptionKey, requestPermissions } from "~hooks/ble/ble-utils";
import { useBleActions } from "~hooks/ble/use-ble-actions";

export default function Bluetooth() {
  const {
    bleManager,
    data,
    scanForPeripherals,
    stopScanningForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevices,
    disconnectFromDevice,
  } = useBle("0000000000000000");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  const dataInfo = [
    {
      label: "Device ID",
      value: data?.id,
    },
    {
      label: "Device Local Name",
      value: data?.localName,
    },
    {
      label: "Connection Active",
      value: data?.connectionActive ? "Yes" : "No",
    },
    {
      label: "Device Connection State",
      value: data?.deviceConnectionState,
    },
    {
      label: "Device Type",
      value: data?.deviceType,
    },
    {
      label: "OEM Type",
      value: data?.oemType,
    },
    {
      label: "Encrypted Resource Values Hex",
      value: data?.encryptedResourceValuesHex,
    },
    {
      label: "Decrypted Array",
      value: (data?.decryptedResources ?? "-").toString(),
    },
  ];

  const decryptionKey = getDecryptionKey(data?.localName ?? null);

  const { locateDevice, mapInfo, readAllResources } = useBleActions();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flex: 1, gap: 10 }}>
        <Text>Latest data:</Text>

        {data ? (
          dataInfo.map(({ label, value }) => {
            return (
              <View key={label}>
                <Text>{label}:</Text>
                <Text>{value}</Text>
              </View>
            );
          })
        ) : (
          <Text>No data</Text>
        )}
        <Button
          disabled={!connectedDevices[0]}
          title="Send message to device"
          onPress={() =>
            locateDevice(bleManager, connectedDevices[0], decryptionKey)
          }
        ></Button>
        <Button
          disabled={!connectedDevices[0]}
          onPress={async () => {
            await readAllResources(
              bleManager,
              connectedDevices[0],
              decryptionKey
            );
            const res = mapInfo();
            Alert.alert(
              "Here are the values",
              // Show label: value for each
              res.map((r) => `${r.label}: ${r.value}`).join("\n")
            );
          }}
          title="Read All Resources"
        ></Button>
        <Button
          onPress={() =>
            connectedDevices[0]
              ? disconnectFromDevice(connectedDevices[0].id)
              : openModal()
          }
          title={connectedDevices[0] ? "Disconnect" : "Connect"}
        ></Button>
      </View>
      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
        stopScanningForPeripherals={stopScanningForPeripherals}
      />
    </View>
  );
}
