package expo.modules.selectabletext

import android.graphics.Typeface
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoSelectableTextModule : Module() {

  override fun definition() = ModuleDefinition {

    Name("ExpoSelectableText")

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(ExpoSelectableTextView::class) {
      Prop("text") {view: ExpoSelectableTextView, text: String ->
        view.textView.text = text.toString()
      }

      Prop("fontFamily") {view: ExpoSelectableTextView, fontFamily: Typeface ->
        view.textView.typeface = fontFamily
      }

      Prop("fontSize") {view: ExpoSelectableTextView, fontSize: Float ->
        view.textView.textSize = fontSize
      }

      Events("onSelectionEnd")
    }
  }
}
