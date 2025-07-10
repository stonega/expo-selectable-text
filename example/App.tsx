import { useFonts } from "expo-font";
import { ExpoSelectableTextView, type ExpoSelectableTextViewRef } from "expo-selectable-text";
import { SafeAreaView, Text, StyleSheet, Platform, View, TouchableOpacity, Dimensions } from "react-native";
import { useState, useRef } from "react";

const LOREM_IPSUM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh.";

type Highlight = {
  id: string;
  start: number;
  end: number;
  backgroundColor: string;
  color: string;
};

export default function App() {
  const [selectedText, setSelectedText] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([
    {
      id: "1",
      start: 0,
      end: 10,
      backgroundColor: "#FE7743",
      color: "#ffffff",
    },
  ]);
  const [popupPosition, setPopupPosition] = useState({ x: 50, y: 50 });
  const [clickedHighlight, setClickedHighlight] = useState<Highlight | null>(null);
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
  const positionPopup = (rect: any) => {
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

  const handleSelectionEnd = (event: any) => {
    const { rect, text, cleared } = event.nativeEvent;
    console.log(Date.now(), "onSelectionEnd fired");
    if(text.trim().length === 0 || cleared) {
      setShowPopup(false);
      setClickedHighlight(null);
      return;
    }
    if (text && text.trim().length > 0) {
      // Check if selected text is within any existing highlight
      const startIndex = LOREM_IPSUM.indexOf(text);
      const endIndex = startIndex + text.length;
      const existingHighlight = highlights.find(h => 
        startIndex >= h.start && endIndex <= h.end
      );
      
      if (existingHighlight) {
        setClickedHighlight(existingHighlight);
      } else {
        setClickedHighlight(null);
      }
      
      setSelectedText(text);
      setShowPopup(true);
      positionPopup(rect);
    }
  };

  const handleHighlight = async () => {
    if (selectedText) {
      const startIndex = LOREM_IPSUM.indexOf(selectedText);
      if (startIndex !== -1) {
        const endIndex = startIndex + selectedText.length;
        const newHighlight: Highlight = {
          id: Math.random().toString(36).substring(2, 15),
          start: startIndex,
          end: endIndex,
          backgroundColor: "#F9F362",
          color: "#000000",
        };
        // Avoid adding duplicate highlights for the same range
        if (!highlights.some(h => h.start === newHighlight.start && h.end === newHighlight.end)) {
          setHighlights(prev => [...prev, newHighlight]);
        }
      }
    }
    await textViewRef.current?.clearSelection();
    setShowPopup(false);
    setClickedHighlight(null);
  };

  const handleClearHighlight = () => {
    if (clickedHighlight) {
      setHighlights(highlights.filter((h) => h.id !== clickedHighlight.id));
    }
    textViewRef.current?.clearSelection();
    setShowPopup(false);
    setClickedHighlight(null);
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
            color="#000000"
            selectionColor="#a0a0a0"
            onSelectionEnd={handleSelectionEnd}
            backgroundColor="#D2C1B6"
            onSelecting={() => {
              console.log(Date.now(), "Selecting fired");
              setShowPopup(false);
              setClickedHighlight(null);
            }}
            highlights={highlights}
            fontSize={20}
            lineHeight={30}
            text={LOREM_IPSUM}
          />
        </View>
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
          {clickedHighlight ? (
            <TouchableOpacity style={styles.menuItem} onPress={handleClearHighlight}>
              <Text style={styles.menuItemText}>Clear Highlight</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.menuItem} onPress={handleHighlight}>
              <Text style={styles.menuItemText}>🔆 Highlight</Text>
            </TouchableOpacity>
          )}
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
    height: 500,
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
  textContainer: {
    marginTop: 20,
    width: '100%',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#34495e',
  },
  selectableText: {
    height: 100,
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 8,
  },
});
