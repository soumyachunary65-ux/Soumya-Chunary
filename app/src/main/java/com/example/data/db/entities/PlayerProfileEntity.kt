package com.example.data.db.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "player_profile")
data class PlayerProfileEntity(
    @PrimaryKey val id: Int = 1,
    val callsign: String = "Operator-07",
    val survivedSeconds: Long = 0L,
    val creaturesKilled: Int = 0,
    val missionsCompleted: Int = 0,
    val credits: Int = 250,
    val primaryWeapon: String = "M9 Tactical 9mm",
    val secondaryWeapon: String = "AK-47 Assault Rifle",
    val highestFearSurvived: Int = 85
)
