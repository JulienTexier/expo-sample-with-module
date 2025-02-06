export type IQrCode = string;

type Success = {
  success: true;
  qrCode: IQrCode;
};

type Failure = {
  success: false;
  qrCode: null;
};

export type HsMDeviceCodeParsingResult = Success | Failure;
