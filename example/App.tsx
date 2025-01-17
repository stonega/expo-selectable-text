import { useFonts, loadAsync } from "expo-font";
import { ExpoSelectableTextView } from "expo-selectable-text";
import { useEffect } from "react";
import { SafeAreaView, Text } from "react-native";

export default function App() {
  const [loaded, error] = useFonts({
    "Jersey-Regular": require("./assets/fonts/Jersey-Regular.ttf"),
  });

  if (!loaded) {
    return <Text>Loading</Text>;
  }

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
        fontSize={30}
        fontFamily="Jersey-Regular"
        text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa."
      />

      <Text style={{ fontSize: 60, fontFamily: "Jersey-Regular", flex: 1 }}>
        Test font family
      </Text>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },
};
