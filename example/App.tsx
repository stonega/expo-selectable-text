import { ExpoSelectableTextView } from "expo-selectable-text";
import { SafeAreaView } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Using with flatlist */}
      {/* <FlatList
        data={[1, 2, 3, 4, 6]}
        // You need to use this prop to avoid clipping the text
        removeClippedSubviews={false}
        renderItem={() => (
          <ExpoSelectableText
            style={{ height: 400 }}
            onSelectionEnd={(event) => console.log(event.nativeEvent)}
            fontSize={18}
            text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa."
          />
        )}
      /> */}

      <ExpoSelectableTextView
        style={{ flex: 1 }}
        onSelectionEnd={(event) => alert(JSON.stringify(event.nativeEvent))}
        fontSize={18}
        text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa."
      />
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },
};
