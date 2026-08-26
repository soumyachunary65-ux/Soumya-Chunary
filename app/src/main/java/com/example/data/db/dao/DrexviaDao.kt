package com.example.data.db.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.db.entities.LoreLogEntity
import com.example.data.db.entities.PlayerProfileEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface DrexviaDao {
    @Query("SELECT * FROM player_profile WHERE id = 1 LIMIT 1")
    fun getPlayerProfile(): Flow<PlayerProfileEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateProfile(profile: PlayerProfileEntity)

    @Query("SELECT * FROM lore_logs ORDER BY logId ASC")
    fun getAllLoreLogs(): Flow<List<LoreLogEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLoreLogs(logs: List<LoreLogEntity>)

    @Update
    suspend fun updateLoreLog(log: LoreLogEntity)

    @Query("UPDATE lore_logs SET isDiscovered = 1 WHERE logId = :logId")
    suspend fun unlockLoreLogById(logId: String)

    @Query("UPDATE player_profile SET creaturesKilled = creaturesKilled + :kills, survivedSeconds = survivedSeconds + :seconds, credits = credits + :earnedCredits WHERE id = 1")
    suspend fun recordGameSession(kills: Int, seconds: Long, earnedCredits: Int)

    @Query("UPDATE player_profile SET missionsCompleted = missionsCompleted + 1, credits = credits + :rewardCredits WHERE id = 1")
    suspend fun recordMissionCompleted(rewardCredits: Int = 100)
}
