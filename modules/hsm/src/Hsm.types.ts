import type { StyleProp, ViewStyle } from 'react-native';

export type OnLoadEventPayload = {
  url: string;
};

export type HsmModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export type HsmViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};

export type IQrCode = any;

type Success = {
  success: true;
  qrCode: IQrCode;
};

type Failure = {
  success: false;
};

export type HsMDeviceCodeParsingResult = Success | Failure;
