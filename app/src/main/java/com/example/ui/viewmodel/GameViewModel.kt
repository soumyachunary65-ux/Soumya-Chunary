package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.db.DrexviaDatabase
import com.example.data.db.entities.LoreLogEntity
import com.example.data.db.entities.PlayerProfileEntity
import com.example.data.repository.GameRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class Screen {
    MAIN_MENU,
    GAMEPLAY,
    PROFILE,
    SETTINGS,
    FIELD_GUIDE
}

data class GameSettings(
    val graphicsQuality: String = "HIGH", // LOW, MEDIUM, HIGH, ULTRA
    val lookSensitivity: Float = 1.0f,
    val masterVolume: Float = 0.8f,
    val invertY: Boolean = false,
    val reducedHorror: Boolean = false,
    val defaultPerspective: String = "1ST PERSON" // 1ST PERSON, 3RD PERSON
)

class GameViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: GameRepository
    
    val profile: StateFlow<PlayerProfileEntity?>
    val loreLogs: StateFlow<List<LoreLogEntity>>

    private val _currentScreen = MutableStateFlow(Screen.MAIN_MENU)
    val currentScreen: StateFlow<Screen> = _currentScreen.asStateFlow()

    private val _settings = MutableStateFlow(GameSettings())
    val settings: StateFlow<GameSettings> = _settings.asStateFlow()

    init {
        val database = DrexviaDatabase.getDatabase(application, viewModelScope)
        repository = GameRepository(database.drexviaDao())

        profile = repository.playerProfile.stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            PlayerProfileEntity()
        )

        loreLogs = repository.loreLogs.stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
    }

    fun navigateTo(screen: Screen) {
        _currentScreen.value = screen
    }

    fun updateSettings(newSettings: GameSettings) {
        _settings.value = newSettings
    }

    fun recordSessionResult(kills: Int, durationSeconds: Long, credits: Int) {
        viewModelScope.launch {
            repository.recordSessionStats(kills, durationSeconds, credits)
        }
    }

    fun recordMissionSuccess(rewardCredits: Int = 100) {
        viewModelScope.launch {
            repository.recordMissionCompleted(rewardCredits)
        }
    }

    fun unlockLoreLogById(logId: String) {
        viewModelScope.launch {
            repository.unlockLogById(logId)
        }
    }

    fun unlockLoreLog(log: LoreLogEntity) {
        viewModelScope.launch {
            repository.discoverLog(log)
        }
    }
}
