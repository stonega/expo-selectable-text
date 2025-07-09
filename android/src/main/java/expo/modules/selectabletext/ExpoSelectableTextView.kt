package expo.modules.selectabletext

import android.content.Context
import android.graphics.Color
import android.graphics.Rect
import android.graphics.Typeface
import android.os.Handler
import android.os.Looper
import android.text.Selection
import android.text.Spannable
import android.text.SpannableString
import android.text.TextPaint
import android.text.method.LinkMovementMethod
import android.text.style.BackgroundColorSpan
import android.text.style.ClickableSpan
import android.text.style.ForegroundColorSpan
import android.util.Log
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import kotlin.math.abs
import kotlin.math.sqrt

class ExpoSelectableTextView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val onSelectionEnd by EventDispatcher()
  private val onSelecting by EventDispatcher()
  private val onHighlightClicked by EventDispatcher()

  private var selectedText: String = ""
  private var lastSelectionStart = -1
  private var lastSelectionEnd = -1
  private var selectionTimer: Handler? = null
  private val selectionRunnable = Runnable { handleSelectionEnd() }
  
  // Store current text and highlights for reapplication
  private var currentText: String = ""
  private var currentHighlights: List<Map<String, Any>> = emptyList()

  internal val textView = object : TextView(context) {

    override fun onSelectionChanged(selStart: Int, selEnd: Int) {
      super.onSelectionChanged(selStart, selEnd)
      
      // Cancel any existing timer
      selectionTimer?.removeCallbacks(selectionRunnable)
      
      // Check if selection has changed
      if (selStart != lastSelectionStart || selEnd != lastSelectionEnd) {
        lastSelectionStart = selStart
        lastSelectionEnd = selEnd
        
        if (selStart != -1 && selEnd != -1 && selStart != selEnd) {
          // Selection exists, update selectedText and start timer
          selectedText = if (selStart < selEnd) {
            text.substring(selStart, selEnd)
          } else {
            text.substring(selEnd, selStart)
          }
          
          if (selectedText.isNotEmpty()) {
            // Fire onSelecting event for real-time updates
            val selectionRect = getSelectionRect(selStart, selEnd)
            val density = context.resources.displayMetrics.density
            val rectInDp = mapOf(
              "x" to (selectionRect.left / density),
              "y" to (selectionRect.top / density),
              "width" to (selectionRect.width() / density),
              "height" to (selectionRect.height() / density)
            )
            onSelecting(mapOf(
              "text" to selectedText,
              "start" to selStart,
              "end" to selEnd,
              "length" to abs(selEnd - selStart),
              "rect" to rectInDp
            ))
            
            // Start a timer to detect when selection has stopped changing
            selectionTimer = Handler(Looper.getMainLooper())
            selectionTimer?.postDelayed(selectionRunnable, 500)
          }
        } else if (selectedText.isNotEmpty()) {
          // Selection was cleared
          selectedText = ""
          
          // Notify that selection was cleared
          onSelectionEnd(mapOf(
            "text" to "",
            "start" to 0,
            "end" to 0,
            "length" to 0,
            "cleared" to true,
            "rect" to mapOf(
              "x" to 0,
              "y" to 0,
              "width" to 0,
              "height" to 0
            )
          ))
        }
      }
    }

  }.apply {
    layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
    setTextIsSelectable(true)
    customSelectionActionModeCallback = createCustomSelectionActionModeCallback()
    // Important for spans to be clickable
    // movementMethod = LinkMovementMethod.getInstance()
    // Remove the underline and default color of clickable spans
    highlightColor = Color.TRANSPARENT
  }

  init {
    addView(textView)
  }

  private fun createCustomSelectionActionModeCallback(): android.view.ActionMode.Callback {
    return object : android.view.ActionMode.Callback {
      override fun onCreateActionMode(mode: android.view.ActionMode?, menu: android.view.Menu?): Boolean {
        // Allow action mode to be created but clear all menu items
        menu?.clear()
        return true
      }
      
      override fun onPrepareActionMode(mode: android.view.ActionMode?, menu: android.view.Menu?): Boolean {
        // Clear menu items in prepare phase as well
        menu?.clear()
        return true
      }
      
      override fun onActionItemClicked(mode: android.view.ActionMode?, item: android.view.MenuItem?): Boolean {
        return false
      }
      
      override fun onDestroyActionMode(mode: android.view.ActionMode?) {
        // Clean up timer when action mode is destroyed
        selectionTimer?.removeCallbacks(selectionRunnable)
        selectionTimer = null
      }
    }
  }

  private fun handleSelectionEnd() {
    val selStart = textView.selectionStart
    val selEnd = textView.selectionEnd

    if (selStart != -1 && selEnd != -1 && selStart != selEnd) {
      val selectedText = if (selStart < selEnd) {
        textView.text.substring(selStart, selEnd)
      } else {
        textView.text.substring(selEnd, selStart)
      }

      if (selectedText.isNotEmpty()) {
        // Get the selection rectangle for position information
        val selectionRect = getSelectionRect(selStart, selEnd)
        val density = context.resources.displayMetrics.density

        val rectInDp = mapOf(
          "x" to (selectionRect.left / density),
          "y" to (selectionRect.top / density),
          "width" to (selectionRect.width() / density),
          "height" to (selectionRect.height() / density)
        )
        
        onSelectionEnd(mapOf(
          "text" to selectedText, 
          "start" to selStart, 
          "end" to selEnd,
          "length" to abs(selEnd - selStart),
          "rect" to rectInDp
        ))
      }
    }
  }

  private fun getSelectionRect(start: Int, end: Int): Rect {
    val layout = textView.layout
    val rect = Rect()

    if (layout != null) {
      val selStart = if (start <= end) start else end
      val selEnd = if (start <= end) end else start

      val startLine = layout.getLineForOffset(selStart)

      // 1. Get coordinates relative to the text layout's origin.
      val startX = layout.getPrimaryHorizontal(selStart)
      val lineTop = layout.getLineTop(startLine)

      // 2. Adjust for the TextView's own padding and scroll.
      // This gives the final coordinates relative to the ExpoSelectableTextView component.
      val finalX = startX + textView.paddingLeft - textView.scrollX
      val finalY = lineTop + textView.paddingTop - textView.scrollY
      
      // --- Calculate width and height ---
      val endLine = layout.getLineForOffset(selEnd)
      val endX = layout.getPrimaryHorizontal(selEnd)
      val lineBottom = layout.getLineBottom(endLine)

      val width = if (startLine == endLine) {
        // Single line: width is the horizontal distance between start and end.
        abs(endX.toInt() - startX.toInt())
      } else {
        // Multi-line: width is the distance from selection start to the end of the first line.
        (layout.getLineRight(startLine) - startX).toInt()
      }
      
      val height = lineBottom - lineTop
      
      rect.left = finalX.toInt()
      rect.top = finalY
      rect.right = finalX.toInt() + width
      rect.bottom = finalY + height
    }
    
    return rect
  }

  private fun fontFileExists(path: String, fileName: String): Boolean {
    return context.assets.list(path)?.contains(fileName) == true
  }

  fun setFontFamily(fontName: String) {
    val assetManager = context.assets

    try {
      val fontFileName = when {
        fontFileExists("fonts", "$fontName.ttf") -> "fonts/$fontName.ttf"
        fontFileExists("fonts", "$fontName.otf") -> "fonts/$fontName.otf"
        else -> throw IllegalStateException("Font file not found for: $fontName")
      }
      textView.typeface = Typeface.createFromAsset(assetManager, fontFileName)
    } catch (e: Exception) {
      Log.e("ExpoSelectableTextView", e.toString())
      textView.typeface = Typeface.DEFAULT
    }
  }

  fun parseColor(color: String): Int {
    try {
      val parsedColor = Color.parseColor(color)

      return parsedColor
    } catch(e: IllegalArgumentException) {
      Log.e("ExpoSelectableTextView", "Invalid color format: $color")
      return Color.BLACK
    }
  }

  fun clearSelection() {
    // Get current selection info before clearing
    val selStart = textView.selectionStart
    val selEnd = textView.selectionEnd
    val wasSelected = selStart != -1 && selEnd != -1 && selStart != selEnd
    
    // Clear the selection
    textView.clearFocus()
    if (textView.text is android.text.Spannable) {
      Selection.removeSelection(textView.text as android.text.Spannable)
    }
    selectedText = ""
    
    // Fire onSelectionEnd event to notify that selection was cleared
    if (wasSelected) {
      onSelectionEnd(mapOf(
        "text" to "",
        "start" to 0,
        "end" to 0,
        "length" to 0,
        "cleared" to true,
        "rect" to mapOf(
          "x" to 0,
          "y" to 0,
          "width" to 0,
          "height" to 0
        )
      ))
    }
  }

  fun setText(text: String) {
    currentText = text
    // We need to use setText with a buffer type that supports spans
    textView.setText(currentText, TextView.BufferType.SPANNABLE)
    applyHighlights()
  }

  fun setHighlights(highlights: List<Map<String, Any>>) {
    currentHighlights = highlights
    // If text is already set, apply highlights
    if (textView.text.isNotEmpty()) {
      applyHighlights()
    }
  }

  private fun applyHighlights() {
    val spannable = textView.text as Spannable
    // Remove old spans before adding new ones
    val oldSpans = spannable.getSpans(0, spannable.length, Any::class.java)
    for (span in oldSpans) {
      if (span is ClickableSpan || span is BackgroundColorSpan || span is ForegroundColorSpan) {
        spannable.removeSpan(span)
      }
    }

    for (highlight in currentHighlights) {
      val start = (highlight["start"] as? Number)?.toInt()
      val end = (highlight["end"] as? Number)?.toInt()
      val id = highlight["id"] as? String

      if (start != null && end != null && id != null) {
        val clickableSpan = object : ClickableSpan() {
          override fun onClick(widget: View) {
            onHighlightClicked(mapOf("id" to id))
          }
          override fun updateDrawState(ds: TextPaint) {
            // style highlights without underline
            ds.isUnderlineText = false
          }
        }
        spannable.setSpan(clickableSpan, start, end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
        
        highlight["backgroundColor"]?.let {
          val colorString = it as String
          spannable.setSpan(BackgroundColorSpan(parseColor(colorString)), start, end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
        }
        highlight["color"]?.let {
          val colorString = it as String
          spannable.setSpan(ForegroundColorSpan(parseColor(colorString)), start, end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
        }
      }
    }
  }
}
