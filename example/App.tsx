import { ExpoSelectableText } from "expo-selectable-text";
import { SafeAreaView, Text, View } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ExpoSelectableText
        onSelectionEnd={(event) => console.log(event.nativeEvent)}
        style={styles.containerText}
        fontSize={18}
        text="testing my text right now testing text FOI!!!"
      />
    </SafeAreaView>
  );
}

const styles = {
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  containerText: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  group: {
    flex: 1,
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },
};
