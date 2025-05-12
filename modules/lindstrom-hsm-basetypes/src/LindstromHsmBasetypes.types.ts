export type HsMDeviceCodeParsingResult =
  | { success: true; qrCode: string }
  | { success: false; qrCode: null };
