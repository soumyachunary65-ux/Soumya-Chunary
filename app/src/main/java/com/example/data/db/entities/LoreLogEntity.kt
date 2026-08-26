package com.example.data.db.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "lore_logs")
data class LoreLogEntity(
    @PrimaryKey val logId: String,
    val title: String,
    val author: String,
    val timestamp: String,
    val content: String,
    val sector: String,
    val isDiscovered: Boolean = false
)
