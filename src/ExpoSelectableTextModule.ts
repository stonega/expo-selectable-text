import { NativeModule, requireNativeModule } from 'expo';

import { ExpoSelectableTextModuleEvents } from './ExpoSelectableText.types';

declare class ExpoSelectableTextModule extends NativeModule<ExpoSelectableTextModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoSelectableTextModule>('ExpoSelectableText');
