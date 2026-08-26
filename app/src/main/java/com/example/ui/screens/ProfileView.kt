package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.MilitaryTech
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.db.entities.PlayerProfileEntity
import com.example.ui.theme.DrexviaAmber
import com.example.ui.theme.DrexviaCrimson
import com.example.ui.theme.DrexviaCyan
import com.example.ui.theme.DrexviaCyanDark
import com.example.ui.theme.DrexviaObsidian
import com.example.ui.theme.DrexviaSurface
import com.example.ui.theme.DrexviaSurfaceVariant

@Composable
fun ProfileView(
    profile: PlayerProfileEntity?,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val currentProfile = profile ?: PlayerProfileEntity()

    val totalSeconds = currentProfile.survivedSeconds
    val mins = totalSeconds / 60
    val secs = totalSeconds % 60
    val timeFormatted = "${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s"

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    listOf(DrexviaObsidian, Color(0xFF0F172A), DrexviaObsidian)
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .widthIn(max = 600.dp)
                .align(Alignment.Center)
                .verticalScroll(rememberScrollState())
                .padding(20.dp)
        ) {
            // Header Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onBack,
                    modifier = Modifier.testTag("back_button")
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = DrexviaCyan
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = "OPERATOR DOSSIER",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 2.sp,
                        color = DrexviaCyan
                    )
                    Text(
                        text = "EXCLUSION ZONE SURVIVOR REGISTRY",
                        fontSize = 10.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        letterSpacing = 1.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Operator Identity Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, DrexviaCyan.copy(alpha = 0.3f), RoundedCornerShape(12.dp)),
                colors = CardDefaults.cardColors(containerColor = DrexviaSurface)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .clip(CircleShape)
                            .background(DrexviaCyanDark.copy(alpha = 0.3f))
                            .border(2.dp, DrexviaCyan, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "07",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Black,
                            color = DrexviaCyan,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    Spacer(modifier = Modifier.width(16.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = currentProfile.callsign,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "STATUS: ACTIVE COMBATANT",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF10B981),
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            text = "CLEARANCE: LEVEL 3 HAZMAT",
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = "${currentProfile.credits} CR",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Black,
                            color = DrexviaAmber,
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            text = "SALVAGE VALUE",
                            fontSize = 8.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Combat & Survival Metrics Grid
            Text(
                text = "SURVIVAL TELEMETRY",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = DrexviaAmber,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                StatCard(
                    title = "CREATURES KILLED",
                    value = currentProfile.creaturesKilled.toString(),
                    icon = Icons.Default.MilitaryTech,
                    accentColor = DrexviaCrimson,
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "TIME SURVIVED",
                    value = timeFormatted,
                    icon = Icons.Default.Timer,
                    accentColor = DrexviaCyan,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                StatCard(
                    title = "MISSIONS DONE",
                    value = currentProfile.missionsCompleted.toString(),
                    icon = Icons.Default.EmojiEvents,
                    accentColor = Color(0xFF10B981),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "MAX FEAR LEVEL",
                    value = "${currentProfile.highestFearSurvived}%",
                    icon = Icons.Default.Security,
                    accentColor = Color(0xFFA855F7),
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Service Medals & Achievements
            Text(
                text = "SERVICE MEDALS",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = DrexviaAmber,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            MedalItem(
                title = "FIRST BLOOD",
                desc = "Neutralized your first mutated Hollow organism with tactical sidearm.",
                unlocked = currentProfile.creaturesKilled > 0
            )

            Spacer(modifier = Modifier.height(8.dp))

            MedalItem(
                title = "GENERATOR OVERRIDE",
                desc = "Successfully restored power grid at Station Omega-9.",
                unlocked = currentProfile.missionsCompleted > 0
            )

            Spacer(modifier = Modifier.height(8.dp))

            MedalItem(
                title = "INTO THE NIGHT",
                desc = "Survived more than 5 minutes in deep volumetric fog exclusion zones.",
                unlocked = currentProfile.survivedSeconds >= 300
            )

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = onBack,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = DrexviaCyanDark)
            ) {
                Text(
                    text = "RETURN TO HEADQUARTERS",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    color = Color.White
                )
            }
        }
    }
}

@Composable
private fun StatCard(
    title: String,
    value: String,
    icon: ImageVector,
    accentColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.border(1.dp, accentColor.copy(alpha = 0.3f), RoundedCornerShape(8.dp)),
        colors = CardDefaults.cardColors(containerColor = DrexviaSurface)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = title,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    letterSpacing = 0.5.sp
                )
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = accentColor,
                    modifier = Modifier.size(16.dp)
                )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = value,
                fontSize = 18.sp,
                fontWeight = FontWeight.Black,
                color = MaterialTheme.colorScheme.onSurface,
                fontFamily = FontFamily.Monospace
            )
        }
    }
}

@Composable
private fun MedalItem(
    title: String,
    desc: String,
    unlocked: Boolean
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(
                1.dp,
                if (unlocked) DrexviaAmber.copy(alpha = 0.4f) else Color.White.copy(alpha = 0.08f),
                RoundedCornerShape(8.dp)
            ),
        colors = CardDefaults.cardColors(
            containerColor = if (unlocked) DrexviaSurfaceVariant else DrexviaSurface.copy(alpha = 0.4f)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(
                        if (unlocked) DrexviaAmber.copy(alpha = 0.2f) else Color.DarkGray.copy(alpha = 0.3f)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (unlocked) "★" else "🔒",
                    fontSize = 16.sp,
                    color = if (unlocked) DrexviaAmber else Color.Gray
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (unlocked) MaterialTheme.colorScheme.onSurface else Color.Gray
                )
                Text(
                    text = desc,
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    lineHeight = 13.sp
                )
            }
        }
    }
}
