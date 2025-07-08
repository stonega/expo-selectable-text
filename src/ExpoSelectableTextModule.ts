import { requireNativeModule } from "expo";

// This call loads the native module object from the JSI.
const ExpoSelectableTextModule = requireNativeModule("ExpoSelectableText");

export default ExpoSelectableTextModule;

// Export the clearSelection function
export const clearSelection = (viewTag: number): Promise<void> => {
  return ExpoSelectableTextModule.clearSelection(viewTag);
};
