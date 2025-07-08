import ExpoModulesCore

public class ExpoSelectableTextModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ExpoSelectableText')` in JavaScript.
    Name("ExpoSelectableText")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants([
      "PI": Double.pi
    ])

    // Defines event names that the module can send to JavaScript.
    Events("onChange", "onSelectionEnd", "onSelecting")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      return "Hello world! 👋"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { (value: String) in
      // Send an event to JavaScript.
      self.sendEvent("onChange", [
        "value": value
      ])
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of the
    // view definition: Prop, Events.
    View(ExpoSelectableTextView.self) {
      // Defines a setter for the `text` prop.
      Prop("text") { (view: ExpoSelectableTextView, text: String?) in
        view.setText(text)
      }

      // Defines a setter for the `highlights` prop.
      Prop("highlights") { (view: ExpoSelectableTextView, highlights: [[String: Any]]?) in
        view.setHighlights(highlights ?? [])
      }

      // Defines a setter for the `fontSize` prop.
      Prop("fontSize") { (view: ExpoSelectableTextView, fontSize: Double?) in
        let size = CGFloat(fontSize ?? 14.0)
        // Use existing font family/weight if available, otherwise use system font
        if let currentFont = view.textView.font {
          view.textView.font = currentFont.withSize(size)
        } else {
          view.textView.font = UIFont.systemFont(ofSize: size)
        }
      }

      // Defines a setter for the `fontFamily` prop.
      Prop("fontFamily") { (view: ExpoSelectableTextView, fontFamily: String?) in
        if let fontFamily = fontFamily, let font = UIFont(name: fontFamily, size: view.textView.font?.pointSize ?? 14.0) {
          view.textView.font = font
        }
      }

      // Defines a setter for the `lineHeight` prop.
      Prop("lineHeight") { (view: ExpoSelectableTextView, lineHeight: Double?) in
        guard let lineHeight = lineHeight else { return }
        
        let currentFont = view.textView.font ?? UIFont.systemFont(ofSize: 14.0)
        let fontLineHeight = currentFont.lineHeight
        let desiredLineHeight = CGFloat(lineHeight)
        
        // Create paragraph style with line height
        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.minimumLineHeight = desiredLineHeight
        paragraphStyle.maximumLineHeight = desiredLineHeight
        
        // Apply to existing text if available
        if let text = view.textView.text, !text.isEmpty {
          let attributedText = NSMutableAttributedString(string: text)
          attributedText.addAttribute(.font, value: currentFont, range: NSRange(location: 0, length: text.count))
          attributedText.addAttribute(.paragraphStyle, value: paragraphStyle, range: NSRange(location: 0, length: text.count))
          view.textView.attributedText = attributedText
        } else {
          // Store for future text updates
          view.pendingLineHeight = desiredLineHeight
        }
      }

      // Defines a setter for the `color` prop.
      Prop("color") { (view: ExpoSelectableTextView, color: String?) in
        if let color = color {
          view.textView.textColor = view.parseColor(color)
        }
      }

      // Defines a setter for the `backgroundColor` prop.
      Prop("backgroundColor") { (view: ExpoSelectableTextView, backgroundColor: String?) in
        if let backgroundColor = backgroundColor {
          view.textView.backgroundColor = view.parseColor(backgroundColor)
        }
      }

      // Defines a setter for the `selectionColor` prop.
      Prop("selectionColor") { (view: ExpoSelectableTextView, selectionColor: String?) in
        if let selectionColor = selectionColor {
          view.textView.tintColor = view.parseColor(selectionColor)
        }
      }

      Events("onSelectionEnd", "onSelecting")

      // Add View Command for clearing selection
      AsyncFunction("clearSelection") { (view: ExpoSelectableTextView) in
        view.clearSelection()
      }
    }
  }
}
