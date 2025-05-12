import type {
  BuildEncryptedReadMessage,
  BuildEncryptedReadMessages,
  BuildEncryptedWriteMessage,
} from 'modules/hsm-device-communications';
import type { BleManager, Device } from 'react-native-ble-plx';

type BleProps = {
  bleManager: BleManager;
  peripheralId: Device['id'];
  deviceName: Device['name'];
};

export type ReadAllFromDeviceProps = BleProps & BuildEncryptedReadMessages;

export type ReadFromDeviceProps = BleProps & BuildEncryptedReadMessage;

export type WriteToDeviceProps = BleProps & BuildEncryptedWriteMessage;
