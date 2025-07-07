import { requireNativeViewManager } from "expo-modules-core";
import * as React from "react";

import { ExpoSelectableTextViewProps, SelectionEndEventPayload } from "./ExpoSelectableText.types";

const NativeView: React.ComponentType<ExpoSelectableTextViewProps> =
  requireNativeViewManager("ExpoSelectableText");

export default function ExpoSelectableTextView(
  props: ExpoSelectableTextViewProps
) {
  const { onSelectionEnd, ...otherProps } = props;

  const _onSelectionEnd = (event: { nativeEvent: SelectionEndEventPayload }) => {
    if (onSelectionEnd) {
      onSelectionEnd(event.nativeEvent);
    }
  };

  return <NativeView {...otherProps} onSelectionEnd={_onSelectionEnd} />;
}
