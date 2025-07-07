import ExpoModulesCore
import UIKit

// Custom UITextView that disables system menu
class CustomTextView: UITextView {
  weak var parentView: ExpoSelectableTextView?
  private var touchDownLocation: CGPoint?
  
  override func canPerformAction(_ action: Selector, withSender sender: Any?) -> Bool {
    // Disable all system menu actions
    return false
  }
  
  override func target(forAction action: Selector, withSender sender: Any?) -> Any? {
    // Don't return any target for system actions
    return nil
  }
  
  override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
    super.touchesBegan(touches, with: event)
    if let touch = touches.first {
      touchDownLocation = touch.location(in: self)
    }
  }
  
  override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
    super.touchesEnded(touches, with: event)
    
    // Check if this was a tap (not a drag/selection gesture)
    if let touch = touches.first,
       let downLocation = touchDownLocation {
      let endLocation = touch.location(in: self)
      let distance = sqrt(pow(endLocation.x - downLocation.x, 2) + pow(endLocation.y - downLocation.y, 2))
      
      // If it's a tap (small movement) and we have a selection, clear it
      if distance < 10 && selectedRange.length > 0 {
        // Use a longer delay to ensure system selection gestures complete
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
          guard let self = self else { return }
          // Double-check we still have a selection and it wasn't just created
          if self.selectedRange.length > 0 {
            self.parentView?.clearSelection()
          }
        }
      }
    }
    
    touchDownLocation = nil
  }
}

class ExpoSelectableTextView: ExpoView, UITextViewDelegate {
  let textView = CustomTextView()
  let onSelectionEnd = EventDispatcher()
  let onSelecting = EventDispatcher()

  var selectedText: String = ""
  private var selectionTimer: Timer?
  var pendingLineHeight: CGFloat?

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    textView.isEditable = false
    textView.isSelectable = true
    textView.delegate = self
    textView.parentView = self  // Set parent reference
    addSubview(textView)
  }

  override func layoutSubviews() {
    textView.frame = bounds
  }

  func textViewDidChangeSelection(_ textView: UITextView) {
    // Cancel any existing timer
    selectionTimer?.invalidate()
    selectionTimer = nil
    
    let selectedRange = textView.selectedRange
    
    if selectedRange.length == 0 {
      // Selection was cleared
      if !selectedText.isEmpty {
        selectedText = ""
        // Notify that selection was cleared
        onSelectionEnd([
          "text": "",
          "start": 0,
          "end": 0,
          "length": 0,
          "cleared": true,
          "rect": [
            "x": 0,
            "y": 0,
            "width": 0,
            "height": 0
          ]
        ])
      }
      return
    }
    
    let newSelectedText = (textView.text as NSString).substring(with: selectedRange)
    self.selectedText = newSelectedText
    
    // Fire onSelecting event for real-time updates
    var selectionRect = CGRect.zero
    if let startPosition = textView.position(from: textView.beginningOfDocument, offset: selectedRange.location),
       let endPosition = textView.position(from: textView.beginningOfDocument, offset: selectedRange.location + selectedRange.length),
       let textRange = textView.textRange(from: startPosition, to: endPosition) {
      selectionRect = textView.firstRect(for: textRange)
    }
    onSelecting([
      "text": newSelectedText,
      "start": selectedRange.location,
      "end": selectedRange.location + selectedRange.length,
      "length": selectedRange.length,
      "rect": [
        "x": selectionRect.origin.x,
        "y": selectionRect.origin.y,
        "width": selectionRect.size.width,
        "height": selectionRect.size.height
      ]
    ])
    
    // Start a timer to detect when selection has stopped
    // Use a longer delay to ensure selection is stable
    selectionTimer = Timer.scheduledTimer(withTimeInterval: 0.7, repeats: false) { [weak self] _ in
      self?.handleSelectionEnd()
    }
  }

  private func handleSelectionEnd() {
    let selectedRange = textView.selectedRange
    
    if selectedRange.length == 0 {
      return
    }
    
    let selectedText = (textView.text as NSString).substring(with: selectedRange)

    if !selectedText.isEmpty {
      // Get the rect of the selected text for position information
      var selectionRect = CGRect.zero
      if let startPosition = textView.position(from: textView.beginningOfDocument, offset: selectedRange.location),
         let endPosition = textView.position(from: textView.beginningOfDocument, offset: selectedRange.location + selectedRange.length),
         let textRange = textView.textRange(from: startPosition, to: endPosition) {
        selectionRect = textView.firstRect(for: textRange)
      }
      
      onSelectionEnd([
        "text": selectedText,
        "start": selectedRange.location,
        "end": selectedRange.location + selectedRange.length,
        "length": selectedRange.length,
        "rect": [
          "x": selectionRect.origin.x,
          "y": selectionRect.origin.y,
          "width": selectionRect.size.width,
          "height": selectionRect.size.height
        ]
      ])
    }
  }

  // Helper method to parse color from string
  func parseColor(_ colorString: String) -> UIColor {
    var hexString = colorString.trimmingCharacters(in: .whitespacesAndNewlines)
    
    // Remove # if present
    if hexString.hasPrefix("#") {
      hexString.removeFirst()
    }
    
    // Convert to UInt64
    var rgbValue: UInt64 = 0
    Scanner(string: hexString).scanHexInt64(&rgbValue)
    
    let red = CGFloat((rgbValue & 0xFF0000) >> 16) / 255.0
    let green = CGFloat((rgbValue & 0x00FF00) >> 8) / 255.0
    let blue = CGFloat(rgbValue & 0x0000FF) / 255.0
    
    return UIColor(red: red, green: green, blue: blue, alpha: 1.0)
  }

  // Override text setter to apply line height if pending
  func setText(_ text: String?) {
    guard let text = text else { 
      textView.text = nil
      return 
    }
    
    if let pendingLineHeight = pendingLineHeight {
      // Apply line height to new text
      let currentFont = textView.font ?? UIFont.systemFont(ofSize: 14.0)
      let paragraphStyle = NSMutableParagraphStyle()
      paragraphStyle.minimumLineHeight = pendingLineHeight
      paragraphStyle.maximumLineHeight = pendingLineHeight
      
      let attributedText = NSMutableAttributedString(string: text)
      attributedText.addAttribute(.font, value: currentFont, range: NSRange(location: 0, length: text.count))
      attributedText.addAttribute(.paragraphStyle, value: paragraphStyle, range: NSRange(location: 0, length: text.count))
      textView.attributedText = attributedText
    } else {
      textView.text = text
    }
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      // Clear all menu items
      UIMenuController.shared.menuItems = []
    } else {
      // Clean up timer when view is removed
      selectionTimer?.invalidate()
      selectionTimer = nil
    }
  }
  
  deinit {
    selectionTimer?.invalidate()
  }

  func clearSelection() {
    // Get current selection info before clearing
    let selectedRange = textView.selectedRange
    let wasSelected = selectedRange.length > 0
    
    // Cancel any pending selection timer
    selectionTimer?.invalidate()
    
    // Clear the selection
    textView.selectedRange = NSRange(location: 0, length: 0)
    selectedText = ""
    
    // Fire onSelectionEnd event to notify that selection was cleared
    if wasSelected {
      onSelectionEnd([
        "text": "",
        "start": 0,
        "end": 0,
        "length": 0,
        "cleared": true,
        "rect": [
          "x": 0,
          "y": 0,
          "width": 0,
          "height": 0
        ]
      ])
    }
  }
}
