import * as React from 'react';

import { HsmViewProps } from './Hsm.types';

export default function HsmView(props: HsmViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
