
# Expo Selectable Text

ExpoSelectableText is a custom React Native component that provides text selection functionality for both Android and iOS.

# Installating the library
  
```
npm install expo-selectable-text
```
    

#### Android and iOS

<img src="https://github.com/user-attachments/assets/c81c0621-dbea-4fd5-ae06-e35d4df76830" alt="Android Screenshot" style="width: 400px; height: auto;" />
<!-- TODO: Add iOS screenshot -->

#### Examples

```tsx
import { ExpoSelectableTextView } from "expo-selectable-text";
import { Platform } from 'react-native';

<ExpoSelectableTextView
        style={{ flex:1, padding: 10, margin: 10, backgroundColor: 'white', borderRadius: 5 }} // Added some basic styling
        onSelectionEnd={(event) => {
          // The event contains { text, start, end }
          alert(`Selected: "${event.text}" from ${event.start} to ${event.end}`);
        }}
        fontSize={18}
        fontFamily={Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif'} // Example platform-specific font
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
          <ExpoSelectableTextView
            style={{ height: 400 }}
            onSelectionEnd={(event) => alert(JSON.stringify(event.nativeEvent))}
            fontSize={18}
            text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa."
          />
        )}
      />
```   

To use a custom font family, you must configure it with Expo Fonts.

```
npx expo install expo-font
```

```
{
  "expo": {
    "plugins": [
      [
        "expo-font",
        {
          "fonts": ["./assets/fonts/Inter-Black.otf"]
        }
      ]
    ]
  }
}
```

```
  <ExpoSelectableText
  ...
  fontFamily={"Inter-Black"}
  />
```



# Contributing

Contributions are very welcome! 
