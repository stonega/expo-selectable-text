import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoSelectableTextViewProps } from './ExpoSelectableText.types';

const NativeView: React.ComponentType<ExpoSelectableTextViewProps> =
  requireNativeView('ExpoSelectableText');

export default function ExpoSelectableTextView(props: ExpoSelectableTextViewProps) {
  return <NativeView {...props} />;
}
