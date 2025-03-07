import type { BleManager, Device } from "react-native-ble-plx";
import type {
  BuildEncryptedReadMessage,
  BuildEncryptedWriteMessage,
} from "~modules/hsm-device-communications";

export type ReadFromDeviceProps = {
  bleManager: BleManager;
  peripheralId: Device["id"];
  deviceName: Device["name"];
} & BuildEncryptedReadMessage;

export type WriteToDeviceProps = {
  bleManager: BleManager;
  peripheralId: Device["id"];
  deviceName: Device["name"];
} & BuildEncryptedWriteMessage;
