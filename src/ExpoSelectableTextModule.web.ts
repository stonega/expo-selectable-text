import { registerWebModule, NativeModule } from 'expo';

import { ExpoSelectableTextModuleEvents } from './ExpoSelectableText.types';

class ExpoSelectableTextModule extends NativeModule<ExpoSelectableTextModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoSelectableTextModule);
