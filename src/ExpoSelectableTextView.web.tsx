import * as React from 'react';

import { ExpoSelectableTextViewProps } from './ExpoSelectableText.types';

export default function ExpoSelectableTextView(props: ExpoSelectableTextViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
