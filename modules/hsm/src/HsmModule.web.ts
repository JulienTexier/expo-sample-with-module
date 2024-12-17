import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './Hsm.types';

type HsmModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class HsmModule extends NativeModule<HsmModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(HsmModule);
