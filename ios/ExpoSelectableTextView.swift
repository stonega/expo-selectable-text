import ExpoModulesCore
import UIKit

// Custom UITextView that disables system menu
class CustomTextView: UITextView {
  override func canPerformAction(_ action: Selector, withSender sender: Any?) -> Bool {
    // Disable all system menu actions
    return false
  }
  
  override func target(forAction action: Selector, withSender sender: Any?) -> Any? {
    // Don't return any target for system actions
    return nil
  }
}

class ExpoSelectableTextView: ExpoView, UITextViewDelegate {
  let textView = CustomTextView()
  let onSelectionEnd = EventDispatcher()
  let onSelecting = EventDispatcher()

  var selectedText: String = ""
  private var selectionEndTimer: Timer?
  private var selectionMonitorTimer: Timer?
  var pendingLineHeight: CGFloat?
  
  // Add these variables for change detection
  private var lastSelectionStart: Int = -1
  private var lastSelectionEnd: Int = -1
  private var hasActiveSelection: Bool = false
  private var isMonitoringSelection: Bool = false

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    textView.isEditable = false
    textView.isSelectable = true
    textView.delegate = self
    addSubview(textView)
    
    // Add gesture recognizer to detect when selection gestures begin
    setupSelectionMonitoring()
  }
  
  private func setupSelectionMonitoring() {
    // Add a gesture recognizer that can detect when text selection gestures are happening
    let longPressGesture = UILongPressGestureRecognizer(target: self, action: #selector(handleLongPress(_:)))
    longPressGesture.minimumPressDuration = 0.1
    longPressGesture.delegate = self
    textView.addGestureRecognizer(longPressGesture)
    
    let panGesture = UIPanGestureRecognizer(target: self, action: #selector(handlePan(_:)))
    panGesture.delegate = self
    textView.addGestureRecognizer(panGesture)
  }
  
  @objc private func handleLongPress(_ gesture: UILongPressGestureRecognizer) {
    switch gesture.state {
    case .began:
      startSelectionMonitoring()
    case .ended, .cancelled, .failed:
      stopSelectionMonitoring()
    default:
      break
    }
  }
  
  @objc private func handlePan(_ gesture: UIPanGestureRecognizer) {
    switch gesture.state {
    case .began:
      startSelectionMonitoring()
    case .changed:
      // Continue monitoring during pan
      break
    case .ended, .cancelled, .failed:
      stopSelectionMonitoring()
    default:
      break
    }
  }
  
  private func startSelectionMonitoring() {
    guard !isMonitoringSelection else { return }
    isMonitoringSelection = true
    
    // Cancel any existing end timer
    selectionEndTimer?.invalidate()
    selectionEndTimer = nil
    
    // Start monitoring selection changes at high frequency
    selectionMonitorTimer = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { [weak self] _ in
      self?.checkSelectionChange()
    }
  }
  
  private func stopSelectionMonitoring() {
    guard isMonitoringSelection else { return }
    isMonitoringSelection = false
    
    // Stop the monitoring timer
    selectionMonitorTimer?.invalidate()
    selectionMonitorTimer = nil
    
    // Start the end timer with a longer delay
    selectionEndTimer = Timer.scheduledTimer(withTimeInterval: .3, repeats: false) { [weak self] _ in
      self?.handleSelectionEnd()
    }
  }
  
  private func checkSelectionChange() {
    let selectedRange = textView.selectedRange
    let currentStart = selectedRange.location
    let currentEnd = selectedRange.location + selectedRange.length
    
    // Check if selection has changed
    if currentStart != lastSelectionStart || currentEnd != lastSelectionEnd {
      lastSelectionStart = currentStart
      lastSelectionEnd = currentEnd
      
      if selectedRange.length > 0 {
        fireOnSelectingEvent()
      }
    }
  }
  
  private func fireOnSelectingEvent() {
    let selectedRange = textView.selectedRange
    
    guard selectedRange.length > 0 else { return }
    
    let newSelectedText = (textView.text as NSString).substring(with: selectedRange)
    self.selectedText = newSelectedText
    hasActiveSelection = true
    
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
  }

  override func layoutSubviews() {
    textView.frame = bounds
  }

  func setText(_ text: String?) {
    guard let text = text else {
      textView.attributedText = nil
      return
    }

    let attributedString = NSMutableAttributedString(string: text)
    let range = NSRange(location: 0, length: text.count)

    // Preserve existing font
    if let font = textView.font {
      attributedString.addAttribute(.font, value: font, range: range)
    }

    // Preserve existing text color
    if let color = textView.textColor {
      attributedString.addAttribute(.foregroundColor, value: color, range: range)
    }

    // Apply pending line height if it was set before the text
    if let pendingLineHeight = pendingLineHeight {
      let paragraphStyle = NSMutableParagraphStyle()
      paragraphStyle.minimumLineHeight = pendingLineHeight
      paragraphStyle.maximumLineHeight = pendingLineHeight
      attributedString.addAttribute(.paragraphStyle, value: paragraphStyle, range: range)
    }

    textView.attributedText = attributedString
  }

  func parseColor(_ colorString: String) -> UIColor {
    var str = colorString.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()

    if str.hasPrefix("#") {
      str.remove(at: str.startIndex)
    }

    if str.count != 6 {
      return .black
    }

    var rgbValue: UInt64 = 0
    Scanner(string: str).scanHexInt64(&rgbValue)

    return UIColor(
      red: CGFloat((rgbValue & 0xFF0000) >> 16) / 255.0,
      green: CGFloat((rgbValue & 0x00FF00) >> 8) / 255.0,
      blue: CGFloat(rgbValue & 0x0000FF) / 255.0,
      alpha: 1.0
    )
  }

  func textViewDidChangeSelection(_ textView: UITextView) {
    // If we're actively monitoring selection, let that handle the events
    if isMonitoringSelection {
      return
    }
    
    let selectedRange = textView.selectedRange
    let currentStart = selectedRange.location
    let currentEnd = selectedRange.location + selectedRange.length

    // Check if selection has actually changed
    if currentStart == lastSelectionStart && currentEnd == lastSelectionEnd {
      return
    }

    // Always cancel any existing end timer when selection changes
    selectionEndTimer?.invalidate()
    selectionEndTimer = nil

    // Update last selection values
    lastSelectionStart = currentStart
    lastSelectionEnd = currentEnd

    if selectedRange.length == 0 {
      // Selection was cleared
      if hasActiveSelection {
        hasActiveSelection = false
        selectedText = ""
        
        // Immediately fire onSelectionEnd for cleared selection
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

    // Fire onSelecting for this selection change
    fireOnSelectingEvent()

    // Schedule onSelectionEnd
    selectionEndTimer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: false) { [weak self] _ in
      self?.handleSelectionEnd()
    }
  }

  private func handleSelectionEnd() {
    // Clear the timer reference
    selectionEndTimer = nil
    
    let selectedRange = textView.selectedRange
    
    // Double-check that we still have a selection
    if selectedRange.length == 0 || !hasActiveSelection {
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

  // Simple tap-to-clear using a single tap gesture
  override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
    super.touchesEnded(touches, with: event)
    
    guard let _ = touches.first else { return }
    
    // Only clear selection if there's a selection and it's a simple tap
    if textView.selectedRange.length > 0 {
      // Small delay to avoid interfering with selection gestures
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) { [weak self] in
        guard let self = self else { return }
        // Check if we still have a selection (not cleared by another gesture)
        if self.textView.selectedRange.length > 0 {
          self.clearSelection()
        }
      }
    }
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      // Clear all menu items
      UIMenuController.shared.menuItems = []
    } else {
      // Clean up timers when view is removed
      selectionEndTimer?.invalidate()
      selectionEndTimer = nil
      selectionMonitorTimer?.invalidate()
      selectionMonitorTimer = nil
    }
  }
  
  deinit {
    selectionEndTimer?.invalidate()
    selectionMonitorTimer?.invalidate()
  }

  func clearSelection() {
    // Get current selection info before clearing
    let selectedRange = textView.selectedRange
    let wasSelected = selectedRange.length > 0
    
    // Cancel any pending timers
    selectionEndTimer?.invalidate()
    selectionEndTimer = nil
    selectionMonitorTimer?.invalidate()
    selectionMonitorTimer = nil
    isMonitoringSelection = false
    
    // Clear the selection
    textView.selectedRange = NSRange(location: 0, length: 0)
    selectedText = ""
    hasActiveSelection = false
    
    // Reset last selection values
    lastSelectionStart = -1
    lastSelectionEnd = -1
    
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

// MARK: - UIGestureRecognizerDelegate
extension ExpoSelectableTextView: UIGestureRecognizerDelegate {
  func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    return true
  }
}
