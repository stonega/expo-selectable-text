import { useFonts } from "expo-font";
import { ExpoSelectableTextView } from "expo-selectable-text";
import { SafeAreaView, Text, StyleSheet, Platform, View } from "react-native";

export default function App() {
  const [loaded, error] = useFonts({
    "Jersey-Regular": require("./assets/fonts/Jersey-Regular.ttf"),
    // Example: Adding a system font alias for iOS if needed, or another custom font
    "SystemiOS": Platform.OS === 'ios' ? 'Avenir-Medium' : undefined,
  });

  if (error) {
    console.error("Font loading error:", error);
    return <Text>Error loading fonts</Text>;
  }

  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading assets...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>ExpoSelectableText</Text>
        <Text style={styles.platformText}>Running on: {Platform.OS}</Text>
        <ExpoSelectableTextView
          style={styles.selectableTextView}
          onSelectionEnd={(event) => {
            console.log("Selection Event:", event);
            alert(
              `Selected Text: "${event.text}"\nStart: ${event.start}, End: ${event.end}`
            );
          }}
          fontSize={20}
          // Use a platform-specific font or a loaded custom font
          fontFamily={Platform.OS === 'ios' ? "Avenir-Medium" : "Jersey-Regular"}
          text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh."
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f0f0", // Background for the safe area
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2c3e50",
  },
  platformText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 25,
  },
  selectableTextView: {
    width: '100%',
    height: 300, // Increased height for more text
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3, // For Android shadow
  },
});
