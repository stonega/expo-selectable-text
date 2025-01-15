
# Expo Selectable Text

A Text component that supports text selection on Android.

Currently, it only works on Android, as similar functionality can be achieved on iOS by using a TextInput with onSelectionChange and onTouchEnd.

Creating an iOS implementation using SwiftUI is part of my future plans.  
  

#### Android

<img src="https://github.com/user-attachments/assets/c81c0621-dbea-4fd5-ae06-e35d4df76830" alt="Android Screenshot" style="width: 400px; height: auto;" />


#### Examples

```tsx
import { ExpoSelectableText } from "expo-selectable-text";

<ExpoSelectableText
        style={{ flex:1 }}
        onSelectionEnd={(event) => alert(JSON.stringify(event.nativeEvent))}
        fontSize={18}
        text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa."
/>
```

Using FlatList:

```tsx
<FlatList
        data={[1, 2, 3, 4, 6]}
        // You need to use this prop to avoid clipping the text
        removeClippedSubviews={false}
        renderItem={() => (
          <ExpoSelectableText
            style={{ height: 400 }}
            onSelectionEnd={(event) => alert(JSON.stringify(event.nativeEvent))}
            fontSize={18}
            text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa."
          />
        )}
      />
```   


# Installating the library
  
```

npm install expo-selectable-text

```
  

# Contributing

Contributions are very welcome! 
