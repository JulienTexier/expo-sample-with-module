import React, { useState } from "react";
import { Button, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DeviceModal from "~components/DeviceConnectionModal";
import ResourceList from "~components/ResourceList";
import { useBle } from "~hooks/ble/ble-manager";
import { getDecryptionKey } from "~hooks/ble/ble-utils";
import { resources } from "~hooks/resources";

export default function Bluetooth() {
  const {
    bleManager,
    scanForPeripherals,
    stopScanningForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevices,
    disconnectFromDevice,
  } = useBle();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const scanForDevices = async () => {
    scanForPeripherals();
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ margin: 8 }}>
        <View style={{ flex: 1, gap: 10 }}>
          {connectedDevices[0] && (
            <ResourceList
              bleManager={bleManager}
              connectedDevice={connectedDevices[0]}
              device={{
                ...connectedDevices[0],
                appKey: getDecryptionKey(connectedDevices[0].name),
                thingseeId: connectedDevices[0].name,
              }}
              resourceGroups={resources.resourceGroups}
            />
          )}
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
      </ScrollView>
    </SafeAreaView>
  );
}
