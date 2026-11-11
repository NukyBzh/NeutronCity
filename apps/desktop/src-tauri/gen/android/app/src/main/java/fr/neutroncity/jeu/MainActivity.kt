package fr.neutroncity.jeu

import android.app.Activity
import android.content.ClipData
import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.core.content.FileProvider
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import java.io.File

// Tablet game: landscape (manifest), screen kept on while playing, system bars hidden (a swipe from an edge shows
// them for a moment). Same approach as the NPP tablet APK.
class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    hideSystemBars()
  }

  // The Android WebView has no Web Share API and drops <a download> links: the play log export goes through here (L9.2c).
  override fun onWebViewCreate(webView: WebView) {
    webView.addJavascriptInterface(ShareBridge(this), "NukiAndroid")
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) hideSystemBars()
  }

  private fun hideSystemBars() {
    val controller = WindowCompat.getInsetsController(window, window.decorView)
    controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    controller.hide(WindowInsetsCompat.Type.systemBars())
  }
}

/**
 * Play log export on Android (lot L9.2c): the game hands over the table, written to the app cache (exports/), then the
 * Android share sheet opens (Signal, e-mail, Drive…). The FileProvider of the manifest already serves the cache folder.
 * The chooser title comes from the game (content/i18n). Returns false if the file could not be written or shared.
 */
class ShareBridge(private val activity: Activity) {
  @JavascriptInterface
  fun shareFile(name: String, text: String, mime: String, title: String): Boolean = try {
    val dir = File(activity.cacheDir, "exports").apply { mkdirs() }
    val file = File(dir, name.replace(Regex("[^A-Za-z0-9._-]"), "_"))
    file.writeText(text, Charsets.UTF_8)
    val uri = FileProvider.getUriForFile(activity, "${activity.packageName}.fileprovider", file)
    val send = Intent(Intent.ACTION_SEND).apply {
      type = mime
      putExtra(Intent.EXTRA_STREAM, uri)
      putExtra(Intent.EXTRA_SUBJECT, file.name)
      clipData = ClipData.newRawUri(file.name, uri)
      addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    activity.runOnUiThread { activity.startActivity(Intent.createChooser(send, title)) }
    true
  } catch (e: Exception) {
    false
  }
}
