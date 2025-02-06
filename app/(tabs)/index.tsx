import DeviceModal from "@/components/DeviceConnectionModal";
import useBLE from "@/hooks/use-ble";
import React, { useState } from "react";
import { Button, Text, View } from "react-native";

function createTLVFromHex(hexString: string) {
  // Remove "0x" prefix if present
  const cleanHex = hexString.replace(/^0x/, "");

  // Convert hex string to a byte array (2 bytes for "0007")
  const value = new Uint8Array([
    parseInt(cleanHex.substring(0, 2), 16), // 0x00
    parseInt(cleanHex.substring(2, 4), 16), // 0x07
  ]);

  // Example Tag (0x01) – Change this as needed
  const tag = 0x01;

  return { tag, value };
}

export default function Bluetooth() {
  const {
    requestPermissions,
    scanForPeripherals,
    stopScanningForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    data,
    buildEncryptedMessage,
    disconnectFromDevice,
  } = useBLE();
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

  // Encrypt and send a message
  const sendMessage = async () => {
    // if (!connectedDevice) {
    //   console.log("Device not found!");
    //   return;
    // }
    // // Prepare your TLV object and key
    // const tlvs = [
    //   { tag: 1, value: "YourValue1" }, // Example TLV structure
    //   { tag: 2, value: "YourValue2" },
    // ];
    // const key = "yourEncryptionKey";
    // try {
    //   // Call the Expo module to build the encrypted message
    //   const encryptedMessageJson = await buildEncryptedMessage(tlvs, key);
    //   const encryptedMessage = JSON.parse(encryptedMessageJson);
    //   const encryptedData = encryptedMessage.first; // Base64 encoded data
    //   const tlvIds = encryptedMessage.tlvIds;
    //   console.log("Encrypted Message:", encryptedData);
    //   console.log("TLV IDs:", tlvIds);
    //   // Send encrypted message to the Bluetooth device
    //   await connectedDevice.writeCharacteristicWithResponseForService(
    //     "yourServiceUUID", // Replace with the actual service UUID
    //     "yourCharacteristicUUID", // Replace with the actual characteristic UUID
    //     encryptedData
    //   );
    //   console.log("Encrypted message sent to device!");
    // } catch (error) {
    //   console.error("Error while sending message:", error);
    // }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flex: 1 }}>
        {connectedDevice ? (
          <>
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
            <Button onPress={sendMessage} title="Send Message" />
          </>
        ) : (
          <Text>Please Connect to a device</Text>
        )}
      </View>
      <Button
        onPress={connectedDevice ? disconnectFromDevice : openModal}
        title={connectedDevice ? "Disconnect" : "Connect"}
      />

      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        stopScanningForPeripherals={stopScanningForPeripherals}
        devices={allDevices}
      />
    </View>
  );
}
