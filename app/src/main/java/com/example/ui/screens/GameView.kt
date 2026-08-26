package com.example.ui.screens

import android.annotation.SuppressLint
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.DrexviaCrimson
import com.example.ui.theme.DrexviaObsidian

class DrexviaNativeBridge(
    private val onExitToMenu: () -> Unit,
    private val onSessionStats: (kills: Int, seconds: Long, credits: Int) -> Unit,
    private val onMissionComplete: (rewardCredits: Int) -> Unit = {},
    private val onUnlockLore: (logId: String) -> Unit = {}
) {
    private val mainHandler = Handler(Looper.getMainLooper())

    @JavascriptInterface
    fun exitGame() {
        mainHandler.post { onExitToMenu() }
    }

    @JavascriptInterface
    fun recordSession(kills: Int, seconds: Long, credits: Int) {
        mainHandler.post { onSessionStats(kills, seconds, credits) }
    }

    @JavascriptInterface
    fun recordMissionSuccess(rewardCredits: Int) {
        mainHandler.post { onMissionComplete(rewardCredits) }
    }

    @JavascriptInterface
    fun unlockLoreLog(logId: String) {
        mainHandler.post { onUnlockLore(logId) }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun GameView(
    onExitGame: () -> Unit,
    onRecordStats: (kills: Int, seconds: Long, credits: Int) -> Unit,
    onMissionComplete: (rewardCredits: Int) -> Unit = {},
    onUnlockLore: (logId: String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    BackHandler {
        onExitGame()
    }

    val nativeBridge = remember {
        DrexviaNativeBridge(
            onExitToMenu = onExitGame,
            onSessionStats = onRecordStats,
            onMissionComplete = onMissionComplete,
            onUnlockLore = onUnlockLore
        )
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(DrexviaObsidian)
    ) {
        AndroidView(
            modifier = Modifier
                .fillMaxSize()
                .testTag("game_webview"),
            factory = { ctx ->
                WebView(ctx).apply {
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )

                    setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null)

                    settings.apply {
                        javaScriptEnabled = true
                        domStorageEnabled = true
                        allowFileAccess = true
                        allowContentAccess = true
                        loadWithOverviewMode = true
                        useWideViewPort = true
                        cacheMode = WebSettings.LOAD_DEFAULT
                        mediaPlaybackRequiresUserGesture = false
                        databaseEnabled = true
                    }

                    setBackgroundColor(0xFF000000.toInt())
                    addJavascriptInterface(nativeBridge, "AndroidBridge")

                    webChromeClient = WebChromeClient()
                    webViewClient = object : WebViewClient() {}

                    loadUrl("file:///android_asset/drexvia/index.html")
                }
            }
        )

        // Native Quick Exit floating button in corner
        FloatingActionButton(
            onClick = { onExitGame() },
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(top = 40.dp, start = 12.dp)
                .size(36.dp)
                .testTag("exit_game_button"),
            containerColor = Color.Black.copy(alpha = 0.6f),
            contentColor = DrexviaCrimson,
            shape = CircleShape
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "Exit to Menu",
                modifier = Modifier.size(18.dp)
            )
        }
    }
}
