package com.example.data.repository

import com.example.data.db.dao.DrexviaDao
import com.example.data.db.entities.LoreLogEntity
import com.example.data.db.entities.PlayerProfileEntity
import kotlinx.coroutines.flow.Flow

class GameRepository(private val dao: DrexviaDao) {

    val playerProfile: Flow<PlayerProfileEntity?> = dao.getPlayerProfile()
    val loreLogs: Flow<List<LoreLogEntity>> = dao.getAllLoreLogs()

    suspend fun saveProfile(profile: PlayerProfileEntity) {
        dao.insertOrUpdateProfile(profile)
    }

    suspend fun recordSessionStats(kills: Int, seconds: Long, earnedCredits: Int) {
        dao.recordGameSession(kills, seconds, earnedCredits)
    }

    suspend fun recordMissionCompleted(rewardCredits: Int = 100) {
        dao.recordMissionCompleted(rewardCredits)
    }

    suspend fun unlockLogById(logId: String) {
        dao.unlockLoreLogById(logId)
    }

    suspend fun discoverLog(log: LoreLogEntity) {
        dao.updateLoreLog(log.copy(isDiscovered = true))
    }
}
