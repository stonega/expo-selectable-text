import type { StyleProp, ViewStyle } from "react-native";

export type SelectionEndEventPayload = {
  text: string;
  start: number;
  end: number;
  length: number;
  cleared: boolean;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type ExpoSelectableTextViewProps = {
  text?: string;
  onSelectionEnd?: (event: { nativeEvent: SelectionEndEventPayload }) => void;
  fontSize?: number;
  fontFamily?: string;
  // Keeping existing style-related props, assuming they might be used or added later for iOS consistency
  color?: string;
  selectionColor?: string; // This might need native implementation for iOS if different from default
  lineHeight?: number;
  style?: StyleProp<ViewStyle>;
};

export interface ExpoSelectableTextViewRef {
  clearSelection(): Promise<void>;
}
