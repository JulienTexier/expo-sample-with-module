import { requireNativeView } from 'expo';
import * as React from 'react';

import { HsmViewProps } from './Hsm.types';

const NativeView: React.ComponentType<HsmViewProps> =
  requireNativeView('Hsm');

export default function HsmView(props: HsmViewProps) {
  return <NativeView {...props} />;
}
