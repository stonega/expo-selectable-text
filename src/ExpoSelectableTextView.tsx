import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { requireNativeView } from 'expo';
import type { ExpoSelectableTextViewProps } from './ExpoSelectableText.types';

const NativeView = requireNativeView('ExpoSelectableText');

export interface ExpoSelectableTextViewRef {
  clearSelection(): Promise<void>;
}

export const ExpoSelectableTextView = forwardRef<
  ExpoSelectableTextViewRef,
  ExpoSelectableTextViewProps
>((props, ref) => {
  const nativeRef = useRef(null);

  useImperativeHandle(ref, () => ({
    clearSelection: async () => {
      return (nativeRef.current as any)?.clearSelection();
    },
  }));

  return <NativeView ref={nativeRef} {...props} />;
});
