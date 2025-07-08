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

export type TextHighlight = {
  start: number;
  end: number;
  backgroundColor?: string;
  color?: string;
};

export type ExpoSelectableTextViewProps = {
  text?: string;
  onSelectionEnd?: (event: { nativeEvent: SelectionEndEventPayload }) => void;
  onSelecting?: (event: { nativeEvent: SelectionEndEventPayload }) => void;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  selectionColor?: string; // This might need native implementation for iOS if different from default
  lineHeight?: number;
  highlights?: TextHighlight[];
  style?: StyleProp<ViewStyle>;
};

export interface ExpoSelectableTextViewRef {
  clearSelection(): Promise<void>;
}
