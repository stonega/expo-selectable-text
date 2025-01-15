import { requireNativeViewManager } from "expo-modules-core";
import * as React from "react";

import { ExpoSelectableTextViewProps } from "./ExpoSelectableText.types";

const NativeView: React.ComponentType<ExpoSelectableTextViewProps> =
  requireNativeViewManager("ExpoSelectableText");

export default function ExpoSelectableTextView(
  props: ExpoSelectableTextViewProps
) {
  return <NativeView {...props} />;
}
