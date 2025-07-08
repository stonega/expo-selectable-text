import { useFonts } from "expo-font";
import { ExpoSelectableTextView, type ExpoSelectableTextViewRef } from "expo-selectable-text";
import { SafeAreaView, Text, StyleSheet, Platform, View, TouchableOpacity, Dimensions } from "react-native";
import { useState, useRef } from "react";

export default function App() {
  const [selectedText, setSelectedText] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectionRect, setSelectionRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [highlightedTexts, setHighlightedTexts] = useState<string[]>([]);
  const [popupPosition, setPopupPosition] = useState({ x: 50, y: 50 });
  const textViewRef = useRef<ExpoSelectableTextViewRef>(null);
  const containerRef = useRef<View>(null);
  
  const [loaded, error] = useFonts({
    "Jersey-Regular": require("./assets/fonts/Jersey-Regular.ttf"),
    // "SystemiOS": Platform.OS === 'ios' ? 'Avenir-Medium' : undefined,
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

  const handleSelectionEnd = (event: any) => {
    const { rect, text, cleared } = event.nativeEvent;
    console.log(Date.now(), "onSelectionEnd fired");
    if(text.trim().length === 0 || cleared) {
      setShowPopup(false);
      return;
    }
    if (text && text.trim().length > 0) {
      setSelectedText(text);
      setSelectionRect(rect);
      setShowPopup(true);
      // Calculate position immediately
      if (containerRef.current) {
        containerRef.current.measureInWindow((x, y, width, height) => {
          const screenWidth = Dimensions.get('window').width;
          const popupWidth = 150;
          const popupHeight = 50;
          let popupX = x + rect.x + 5;
          let popupY = y + rect.y - popupHeight - 5;
          // Adjust if popup goes off screen
          if (popupX + popupWidth > screenWidth) {
            popupX = screenWidth - popupWidth - 10;
          }
          if (popupX < 10) {
            popupX = 10;
          }
          if (popupY < 50) {
            popupY = y + rect.y + rect.height + 15 + 5;
          }
          setPopupPosition({ x: popupX, y: popupY });
        });
      }
    }
  };

  const handleHighlight = async () => {
    if (selectedText && !highlightedTexts.includes(selectedText)) {
      setHighlightedTexts([...highlightedTexts, selectedText]);
    }
    await textViewRef.current?.clearSelection();
    setShowPopup(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>ExpoSelectableText</Text>
        <Text style={styles.platformText}>Running on: {Platform.OS}</Text>
        <View ref={containerRef} style={{ width: '100%', marginTop: 20, backgroundColor: "#000" }}>
          <ExpoSelectableTextView
            ref={textViewRef}
            style={styles.selectableTextView}
            onSelectionEnd={handleSelectionEnd}
            backgroundColor="#D2C1B6"
            onSelecting={() => {
              console.log(Date.now(), "Selecting fired");
              setShowPopup(false);
            }}
            highlights={[{
              start: 0,
              end: 10,
              backgroundColor: "#FE7743",
              color: "#ffffff"
            }]}
            fontSize={20}
            lineHeight={30}
            fontFamily={"Jersey-Regular"}
            text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh."
          />
        </View>
        {highlightedTexts.length > 0 && (
          <View style={styles.highlightedContainer}>
            <Text style={styles.highlightedTitle}>Highlighted Texts:</Text>
            {highlightedTexts.map((text, index) => (
              <Text key={index} style={styles.highlightedText}>
                • {text}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Popup Menu - Absolute positioned */}
      {showPopup && (
        <View 
          style={[
            styles.popupMenu, 
            {
              position: 'absolute',
              top: popupPosition.y,
              left: popupPosition.x,
              zIndex: 1000,
            }
          ]}
        >
          <TouchableOpacity style={styles.menuItem} onPress={handleHighlight}>
            <Text style={styles.menuItemText}>🔆 Highlight</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  selectedText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 25,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f0f0",
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
    height: 300,
  },
  highlightedContainer: {
    width: '100%',
    maxHeight: 150,
    backgroundColor: '#fff3cd',
    padding: 20,
  },
  highlightedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  highlightedText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 5,
  },
  popupMenu: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 150,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0,
    borderRadius: 100,
  },
  menuItemText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
});
