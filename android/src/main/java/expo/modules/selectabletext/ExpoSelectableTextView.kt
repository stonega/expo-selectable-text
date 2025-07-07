package expo.modules.selectabletext

import android.content.Context
import android.graphics.Color
import android.graphics.Rect
import android.graphics.Typeface
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.MotionEvent
import android.widget.TextView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import kotlin.math.abs
import kotlin.math.sqrt

class ExpoSelectableTextView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val onSelectionEnd by EventDispatcher()
  private val onHighlight by EventDispatcher()

  private var selectedText: String = ""
  private var selectionTimer: Handler? = null
  private val selectionRunnable = Runnable { handleSelectionEnd() }
  private var lastSelectionStart = -1
  private var lastSelectionEnd = -1

  internal val textView = object : TextView(context) {
    private var touchDownX: Float = 0f
    private var touchDownY: Float = 0f
    private var selectionCheckHandler: Handler? = null
    private val selectionCheckRunnable = Runnable { checkSelectionChanges() }

    override fun onTouchEvent(event: MotionEvent): Boolean {
      when (event.action) {
        MotionEvent.ACTION_DOWN -> {
          touchDownX = event.x
          touchDownY = event.y
          // Start monitoring selection changes
          startSelectionMonitoring()
        }
        MotionEvent.ACTION_UP -> {
          val deltaX = abs(event.x - touchDownX)
          val deltaY = abs(event.y - touchDownY)
          val distance = sqrt(deltaX * deltaX + deltaY * deltaY)
          
          val selStart = selectionStart
          val selEnd = selectionEnd
          val hasSelection = selStart != -1 && selEnd != -1 && selStart != selEnd
          
          // If it's a tap (small movement) and we have a selection, clear it
          if (distance < 30 && hasSelection) {
            // Use a delay to ensure system selection gestures complete
            Handler(Looper.getMainLooper()).postDelayed({
              // Double-check we still have a selection
              if (hasSelection()) {
                this@ExpoSelectableTextView.clearSelection()
              }
            }, 300)
          }
          
          // Stop monitoring selection changes after a delay
          Handler(Looper.getMainLooper()).postDelayed({
            stopSelectionMonitoring()
          }, 1000)
        }
      }
      return super.onTouchEvent(event)
    }

    private fun startSelectionMonitoring() {
      selectionCheckHandler = Handler(Looper.getMainLooper())
      selectionCheckHandler?.post(selectionCheckRunnable)
    }

    private fun stopSelectionMonitoring() {
      selectionCheckHandler?.removeCallbacks(selectionCheckRunnable)
      selectionCheckHandler = null
    }

    private fun checkSelectionChanges() {
      val selStart = selectionStart
      val selEnd = selectionEnd
      
      // Check if selection has changed
      if (selStart != lastSelectionStart || selEnd != lastSelectionEnd) {
        lastSelectionStart = selStart
        lastSelectionEnd = selEnd
        
        // Cancel any existing timer
        selectionTimer?.removeCallbacks(selectionRunnable)
        
        if (selStart != -1 && selEnd != -1 && selStart != selEnd) {
          // Selection exists, update selectedText and start timer
          selectedText = if (selStart < selEnd) {
            text.substring(selStart, selEnd)
          } else {
            text.substring(selEnd, selStart)
          }
          
          if (selectedText.isNotEmpty()) {
            // Start a timer to detect when selection has stopped
            selectionTimer = Handler(Looper.getMainLooper())
            selectionTimer?.postDelayed(selectionRunnable, 700)
          }
        } else if (selectedText.isNotEmpty()) {
          // Selection was cleared
          val previousText = selectedText
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
      
      // Continue monitoring if handler is still active
      selectionCheckHandler?.postDelayed(selectionCheckRunnable, 100)
    }

  }.apply {
    layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    setTextIsSelectable(true)
    customSelectionActionModeCallback = createCustomSelectionActionModeCallback()
  }

  init {
    addView(textView)
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
        
        onSelectionEnd(mapOf(
          "text" to selectedText, 
          "start" to selStart, 
          "end" to selEnd,
          "length" to abs(selEnd - selStart),
          "rect" to mapOf(
            "x" to selectionRect.left,
            "y" to selectionRect.top,
            "width" to selectionRect.width(),
            "height" to selectionRect.height()
          )
        ))
      }
    }
  }

  private fun getSelectionRect(start: Int, end: Int): Rect {
    val layout = textView.layout
    val rect = Rect()
    
    if (layout != null) {
      val startLine = layout.getLineForOffset(start)
      val endLine = layout.getLineForOffset(end)
      
      // Get the bounds of the selection
      val startX = layout.getPrimaryHorizontal(start)
      val endX = layout.getPrimaryHorizontal(end)
      val startY = layout.getLineTop(startLine)
      val endY = layout.getLineBottom(endLine)
      
      rect.left = startX.toInt()
      rect.top = startY
      rect.right = endX.toInt()
      rect.bottom = endY
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

  private fun createCustomSelectionActionModeCallback(): android.view.ActionMode.Callback {
    return object : android.view.ActionMode.Callback {
      override fun onCreateActionMode(mode: android.view.ActionMode?, menu: android.view.Menu?): Boolean {
        // Disable all menu items
        return false
      }
      
      override fun onPrepareActionMode(mode: android.view.ActionMode?, menu: android.view.Menu?): Boolean {
        return false
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

  fun clearSelection() {
    // Get current selection info before clearing
    val selStart = textView.selectionStart
    val selEnd = textView.selectionEnd
    val wasSelected = selStart != -1 && selEnd != -1 && selStart != selEnd
    
    // Cancel any pending selection timer
    selectionTimer?.removeCallbacks(selectionRunnable)
    selectionTimer = null
    
    // Clear the selection
    textView.clearFocus()
    textView.setSelection(0, 0)
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
}
