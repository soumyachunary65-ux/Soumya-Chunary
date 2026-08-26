package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.example.ui.screens.FieldGuideView
import com.example.ui.screens.GameView
import com.example.ui.screens.MainMenuView
import com.example.ui.screens.ProfileView
import com.example.ui.screens.SettingsView
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.GameViewModel
import com.example.ui.viewmodel.Screen

class MainActivity : ComponentActivity() {

    private val viewModel: GameViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                DrexviaApp(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun DrexviaApp(viewModel: GameViewModel) {
    val currentScreen by viewModel.currentScreen.collectAsState()
    val profile by viewModel.profile.collectAsState()
    val loreLogs by viewModel.loreLogs.collectAsState()
    val settings by viewModel.settings.collectAsState()

    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
        when (currentScreen) {
            Screen.MAIN_MENU -> {
                MainMenuView(
                    onNavigate = { screen -> viewModel.navigateTo(screen) },
                    modifier = Modifier.padding(innerPadding)
                )
            }
            Screen.GAMEPLAY -> {
                GameView(
                    onExitGame = { viewModel.navigateTo(Screen.MAIN_MENU) },
                    onRecordStats = { kills, seconds, credits ->
                        viewModel.recordSessionResult(kills, seconds, credits)
                    },
                    onMissionComplete = { reward ->
                        viewModel.recordMissionSuccess(reward)
                    },
                    onUnlockLore = { logId ->
                        viewModel.unlockLoreLogById(logId)
                    },
                    modifier = Modifier.fillMaxSize()
                )
            }
            Screen.PROFILE -> {
                ProfileView(
                    profile = profile,
                    onBack = { viewModel.navigateTo(Screen.MAIN_MENU) },
                    modifier = Modifier.padding(innerPadding)
                )
            }
            Screen.FIELD_GUIDE -> {
                FieldGuideView(
                    loreLogs = loreLogs,
                    onBack = { viewModel.navigateTo(Screen.MAIN_MENU) },
                    modifier = Modifier.padding(innerPadding)
                )
            }
            Screen.SETTINGS -> {
                SettingsView(
                    settings = settings,
                    onSaveSettings = { updated -> viewModel.updateSettings(updated) },
                    onBack = { viewModel.navigateTo(Screen.MAIN_MENU) },
                    modifier = Modifier.padding(innerPadding)
                )
            }
        }
    }
}

