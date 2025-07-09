package expo.modules.selectabletext

import android.annotation.SuppressLint
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoSelectableTextModule : Module() {

  @SuppressLint("NewApi")
  override fun definition() = ModuleDefinition {

    Name("ExpoSelectableText")

    View(ExpoSelectableTextView::class) {
      Prop("text") { view: ExpoSelectableTextView, text: String ->
        view.setText(text)
      }

      Prop("highlights") { view: ExpoSelectableTextView, highlights: List<Map<String, Any>> ->
        view.setHighlights(highlights)
      }

      Prop("fontSize") { view: ExpoSelectableTextView, fontSize: Float ->
        view.textView.textSize = fontSize
      }

      Prop("fontFamily") { view: ExpoSelectableTextView, fontFamily: String ->
        view.setFontFamily(fontFamily)
      }

      Prop("selectionColor") { view: ExpoSelectableTextView, selectionColor: String ->
        view.textView.highlightColor = view.parseColor(selectionColor)
      }

      Prop("color") { view: ExpoSelectableTextView, color: String ->
        view.textView.setTextColor(view.parseColor(color))
      }

      Prop("backgroundColor") { view: ExpoSelectableTextView, backgroundColor: String ->
        view.textView.setBackgroundColor(view.parseColor(backgroundColor))
      }

      Prop("lineHeight") { view: ExpoSelectableTextView, lineHeight: Float ->
        val fontSizePx = view.textView.textSize
        val lineHeightPx = lineHeight * view.context.resources.displayMetrics.density
        val extraSpacing = lineHeightPx - fontSizePx
        view.textView.setLineSpacing(extraSpacing, 1.0f)
      }

      Events("onSelectionEnd", "onSelecting", "onHighlightClicked")

      // Add View Command for clearing selection
      AsyncFunction("clearSelection") { view: ExpoSelectableTextView ->
        view.clearSelection()
      }
    }
  }
}
