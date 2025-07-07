import ExpoModulesCore
import UIKit

class ExpoSelectableTextView: ExpoView, UITextViewDelegate {
  let textView = UITextView()
  let onSelectionEnd = EventDispatcher()

  var selectedText: String = ""

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    textView.isEditable = false
    textView.isSelectable = true
    textView.delegate = self
    addSubview(textView)
  }

  override func layoutSubviews() {
    textView.frame = bounds
  }

  func textViewDidChangeSelection(_ textView: UITextView) {
    guard let textRange = textView.selectedTextRange,
          let selectedText = textView.text(in: textRange) else {
      return
    }
    self.selectedText = selectedText
  }

  @objc func handleTextViewTap(_ gestureRecognizer: UITapGestureRecognizer) {
    if gestureRecognizer.state == .ended {
        let selectedRange = textView.selectedRange
        let selectedText = (textView.text as NSString).substring(with: selectedRange)

        if !selectedText.isEmpty {
             onSelectionEnd([
                "text": selectedText,
                "start": selectedRange.location,
                "end": selectedRange.location + selectedRange.length
            ])
        }
    }
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
        let tapGestureRecognizer = UITapGestureRecognizer(target: self, action: #selector(handleTextViewTap(_:)))
        textView.addGestureRecognizer(tapGestureRecognizer)
    } else {
        textView.gestureRecognizers?.forEach(textView.removeGestureRecognizer)
    }
  }
}
