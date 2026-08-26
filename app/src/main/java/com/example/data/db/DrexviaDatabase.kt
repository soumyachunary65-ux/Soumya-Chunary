package com.example.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.data.db.dao.DrexviaDao
import com.example.data.db.entities.LoreLogEntity
import com.example.data.db.entities.PlayerProfileEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [PlayerProfileEntity::class, LoreLogEntity::class],
    version = 1,
    exportSchema = false
)
abstract class DrexviaDatabase : RoomDatabase() {
    abstract fun drexviaDao(): DrexviaDao

    companion object {
        @Volatile
        private var INSTANCE: DrexviaDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): DrexviaDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    DrexviaDatabase::class.java,
                    "drexvia_survival_db"
                )
                .addCallback(DatabaseCallback(scope))
                .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback(
            private val scope: CoroutineScope
        ) : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    scope.launch(Dispatchers.IO) {
                        populateInitialData(database.drexviaDao())
                    }
                }
            }

            suspend fun populateInitialData(dao: DrexviaDao) {
                dao.insertOrUpdateProfile(
                    PlayerProfileEntity(
                        id = 1,
                        callsign = "Operator-07",
                        survivedSeconds = 0L,
                        creaturesKilled = 0,
                        missionsCompleted = 0,
                        credits = 300
                    )
                )

                val log1 = LoreLogEntity(
                    logId = "LOG-01",
                    title = "Incident Genesis: The Frequency",
                    author = "Dr. Elena Vance",
                    timestamp = "02:14 AM - Sector 01",
                    content = "The acoustic anomaly started as an infrasound pulse below 12 Hz. Within minutes, test subjects in containment bay 4 began violent vocal mimicry. Seal the blast doors before it spreads beyond Station Omega-9.",
                    sector = "Subterranean Lab 04",
                    isDiscovered = true
                )

                val log2 = LoreLogEntity(
                    logId = "LOG-02",
                    title = "Biohazard Containment Failure",
                    author = "Commander Hayes",
                    timestamp = "03:40 AM - Sector 09",
                    content = "Military evacuation protocol Delta is active. The organisms react with extreme aggression to synthetic light and gunfire. Keep your flashlight off when navigating the pine thickets.",
                    sector = "Perimeter Outpost",
                    isDiscovered = true
                )

                val log3 = LoreLogEntity(
                    logId = "LOG-03",
                    title = "The Hollow Biology",
                    author = "Dr. Soumya Chunary",
                    timestamp = "05:12 AM - Command Center",
                    content = "Cellular decay has been halted by a parasitic crystalline lattice. Aim for the central chest node or head with shotgun or rifle bursts to sever their neural links.",
                    sector = "Station Omega-9 Core",
                    isDiscovered = true
                )

                val log4 = LoreLogEntity(
                    logId = "LOG-04",
                    title = "The Screamer Acoustic Resonance",
                    author = "Chief Scientist Miller",
                    timestamp = "06:22 AM - Sound Lab",
                    content = "The Screamer does not attack directly; it emits a concentrated acoustic scream that disrupts communication gear, distorts human equilibrium, and summons all surrounding Hollow organisms.",
                    sector = "Acoustic Testing Bay",
                    isDiscovered = false
                )

                val log5 = LoreLogEntity(
                    logId = "LOG-05",
                    title = "Project Veil: Optical Cloaking",
                    author = "Dr. Elena Vance",
                    timestamp = "07:05 AM - Sub-Level 2",
                    content = "The apex specimen bends light across dense fog layers. It will stalk you silently. Watch for ground foliage rustling and sudden silence before it strikes.",
                    sector = "Containment Vault Alpha",
                    isDiscovered = false
                )

                val log6 = LoreLogEntity(
                    logId = "LOG-06",
                    title = "Emergency Extraction Protocol",
                    author = "Evacuation Control",
                    timestamp = "08:00 AM - Helipad Control",
                    content = "Helipad Alpha is located at the northern perimeter ridge. Fire the emergency flare launcher to guide the extraction transport and hold the perimeter against the final horde.",
                    sector = "North Helipad Ridge",
                    isDiscovered = false
                )

                dao.insertLoreLogs(listOf(log1, log2, log3, log4, log5, log6))
            }
        }
    }
}
